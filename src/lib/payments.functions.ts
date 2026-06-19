import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getMtnMomoConfig,
  getMtnMomoPaymentStatus,
  normalizeMomoMsisdn,
  requestMtnMomoPayment,
} from "@/lib/mtn-momo.server";

export type ActivationPaymentResult = {
  paymentId: string;
  referenceId: string;
  amount: number;
  currency: string;
  status: "pending" | "successful" | "failed";
  phone: string;
};

function assertValidMsisdn(phone: string) {
  if (!/^\d{9,15}$/.test(phone)) {
    throw new Error("Enter the MTN number in international format, for example 260971234567");
  }
}

export const startMtnMomoActivationPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ phone: z.string().min(1).optional() }))
  .handler(async ({ data, context }): Promise<ActivationPaymentResult> => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phone,activation_status,tier_id")
      .eq("id", userId)
      .single();
    if (profileError) throw new Error(profileError.message);
    if (profile.activation_status === "active") {
      throw new Error("Your account is already active");
    }

    const rawPhone = data.phone ?? profile.phone;
    if (!rawPhone) throw new Error("Add an MTN phone number before paying");
    const phone = normalizeMomoMsisdn(rawPhone);
    assertValidMsisdn(phone);

    let tierQuery = supabase
      .from("loan_tiers")
      .select("id,name,activation_fee")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1);

    if (profile.tier_id) tierQuery = tierQuery.eq("id", profile.tier_id);

    const { data: tiers, error: tierError } = await tierQuery;
    if (tierError) throw new Error(tierError.message);
    const tier = tiers?.[0];
    if (!tier) throw new Error("No active activation tier is configured");

    const amount = Number(tier.activation_fee);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("The selected tier does not have an activation fee configured");
    }

    const referenceId = crypto.randomUUID();
    const externalId = `activation-${referenceId.slice(0, 8)}`;
    const currency = getMtnMomoConfig().currency;

    const { data: payment, error: insertError } = await supabaseAdmin
      .from("mobile_money_payments")
      .insert({
        user_id: userId,
        tier_id: tier.id,
        reference_id: referenceId,
        external_id: externalId,
        amount,
        currency,
        phone,
        status: "pending",
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);

    try {
      await requestMtnMomoPayment({
        referenceId,
        externalId,
        amount,
        phone,
        payerMessage: "LendFlow activation",
        payeeNote: `Activation fee for ${tier.name}`,
      });
    } catch (error) {
      await supabaseAdmin
        .from("mobile_money_payments")
        .update({
          status: "failed",
          provider_status: "REQUEST_FAILED",
          reason: error instanceof Error ? error.message : "MTN MoMo request failed",
        })
        .eq("id", payment.id);
      throw error;
    }

    await supabaseAdmin
      .from("profiles")
      .update({ phone, activation_status: "pending", tier_id: tier.id })
      .eq("id", userId);

    return {
      paymentId: payment.id,
      referenceId,
      amount,
      currency,
      status: "pending",
      phone,
    };
  });

export const checkMtnMomoActivationPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ paymentId: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<ActivationPaymentResult> => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: payment, error } = await supabase
      .from("mobile_money_payments")
      .select("id,reference_id,amount,currency,phone,status")
      .eq("id", data.paymentId)
      .eq("user_id", userId)
      .single();
    if (error) throw new Error(error.message);

    if (payment.status !== "pending") {
      return {
        paymentId: payment.id,
        referenceId: payment.reference_id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status as "successful" | "failed",
        phone: payment.phone,
      };
    }

    const momoStatus = await getMtnMomoPaymentStatus(payment.reference_id);
    const status =
      momoStatus.status === "SUCCESSFUL"
        ? "successful"
        : momoStatus.status === "FAILED"
          ? "failed"
          : "pending";

    const update = {
      status,
      provider_status: momoStatus.status,
      reason: momoStatus.reason ?? null,
      raw_response: momoStatus,
      completed_at: status === "pending" ? null : new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from("mobile_money_payments")
      .update(update)
      .eq("id", payment.id);
    if (updateError) throw new Error(updateError.message);

    if (status === "successful") {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ activation_status: "active" })
        .eq("id", userId);
      if (profileError) throw new Error(profileError.message);
    }

    return {
      paymentId: payment.id,
      referenceId: payment.reference_id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status,
      phone: payment.phone,
    };
  });
