import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getAirtelMoneyPaymentStatus,
  normalizeAirtelMsisdn,
  requestAirtelMoneyPayment,
} from "@/lib/airtel-money.server";
import {
  getMtnMomoConfig,
  getMtnMomoPaymentStatus,
  normalizeMomoMsisdn,
  requestMtnMomoPayment,
} from "@/lib/mtn-momo.server";

const providerSchema = z.enum(["mtn_momo", "airtel_money"]);
type PaymentProvider = z.infer<typeof providerSchema>;

export type PromotionPackage = {
  id: string;
  name: string;
  headline: string;
  badge: string | null;
  accent: string;
  description: string | null;
  qualificationAmount: number;
  feeAmount: number;
  currency: string;
};

export type PackagePaymentResult = {
  paymentId: string;
  referenceId: string;
  packageId: string | null;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: "pending" | "successful" | "failed";
  phone: string;
};

function assertValidMsisdn(phone: string) {
  if (!/^\d{9,15}$/.test(phone)) {
    throw new Error("Enter the phone number in international format, for example 260971234567");
  }
}

function normalizePhone(provider: PaymentProvider, phone: string) {
  const normalized =
    provider === "mtn_momo" ? normalizeMomoMsisdn(phone) : normalizeAirtelMsisdn(phone);
  assertValidMsisdn(normalized);
  return normalized;
}

export const getPromotionPackages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({}))
  .handler(async ({ context }): Promise<PromotionPackage[]> => {
    const { data, error } = await context.supabase
      .from("promotion_packages")
      .select("id,name,headline,badge,accent,description,qualification_amount,fee_amount,currency")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      headline: row.headline,
      badge: row.badge,
      accent: row.accent,
      description: row.description,
      qualificationAmount: Number(row.qualification_amount),
      feeAmount: Number(row.fee_amount),
      currency: row.currency,
    }));
  });

export const startMobileMoneyPackagePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      packageId: z.string().uuid(),
      provider: providerSchema,
      phone: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }): Promise<PackagePaymentResult> => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const phone = normalizePhone(data.provider, data.phone);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("id", userId)
      .single();
    if (profileError) throw new Error(profileError.message);
    if (profile.kyc_status !== "approved") {
      throw new Error("Complete KYC approval before choosing a promotion package");
    }

    const { data: pack, error: packageError } = await supabase
      .from("promotion_packages")
      .select("id,name,fee_amount,currency")
      .eq("id", data.packageId)
      .eq("is_active", true)
      .single();
    if (packageError) throw new Error(packageError.message);

    const amount = Number(pack.fee_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("The selected package does not have a valid fee");
    }

    let paymentCurrency = pack.currency;
    if (data.provider === "mtn_momo") {
      const momoConfig = getMtnMomoConfig();
      paymentCurrency = momoConfig.currency;
      if (momoConfig.targetEnvironment !== "sandbox" && pack.currency !== paymentCurrency) {
        throw new Error(
          `This package is priced in ${pack.currency}, but MTN MoMo is configured for ${paymentCurrency}`,
        );
      }
    }

    const referenceId = crypto.randomUUID();
    const externalId = `${data.provider}-${referenceId.slice(0, 8)}`;

    const { data: payment, error: insertError } = await supabaseAdmin
      .from("mobile_money_payments")
      .insert({
        user_id: userId,
        package_id: pack.id,
        provider: data.provider,
        reference_id: referenceId,
        external_id: externalId,
        amount,
        currency: paymentCurrency,
        phone,
        status: "pending",
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);

    try {
      if (data.provider === "mtn_momo") {
        await requestMtnMomoPayment({
          referenceId,
          externalId,
          amount,
          currency: paymentCurrency,
          phone,
          payerMessage: "LendFlow promotion package",
          payeeNote: `Promotion fee for ${pack.name}`,
        });
      } else {
        await requestAirtelMoneyPayment({
          referenceId,
          externalId,
          amount,
          phone,
        });
      }
    } catch (error) {
      await supabaseAdmin
        .from("mobile_money_payments")
        .update({
          status: "failed",
          provider_status: "REQUEST_FAILED",
          reason: error instanceof Error ? error.message : "Mobile money request failed",
        })
        .eq("id", payment.id);
      throw error;
    }

    await supabaseAdmin
      .from("profiles")
      .update({ phone, activation_status: "pending" })
      .eq("id", userId);

    return {
      paymentId: payment.id,
      referenceId,
      packageId: pack.id,
      provider: data.provider,
      amount,
      currency: paymentCurrency,
      status: "pending",
      phone,
    };
  });

export const checkMobileMoneyPackagePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ paymentId: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<PackagePaymentResult> => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: payment, error } = await supabase
      .from("mobile_money_payments")
      .select("id,reference_id,external_id,package_id,provider,amount,currency,phone,status")
      .eq("id", data.paymentId)
      .eq("user_id", userId)
      .single();
    if (error) throw new Error(error.message);

    if (payment.status !== "pending") {
      return {
        paymentId: payment.id,
        referenceId: payment.reference_id,
        packageId: payment.package_id,
        provider: payment.provider as PaymentProvider,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status as "successful" | "failed",
        phone: payment.phone,
      };
    }

    const provider = payment.provider as PaymentProvider;
    const providerStatus =
      provider === "mtn_momo"
        ? await getMtnMomoPaymentStatus(payment.reference_id)
        : await getAirtelMoneyPaymentStatus(payment.external_id);

    const rawStatus =
      "status" in providerStatus && typeof providerStatus.status === "string"
        ? providerStatus.status
        : "PENDING";
    const status =
      rawStatus === "SUCCESSFUL" || rawStatus === "SUCCESS" || rawStatus === "TS"
        ? "successful"
        : rawStatus === "FAILED" || rawStatus === "TF"
          ? "failed"
          : "pending";

    const { error: updateError } = await supabaseAdmin
      .from("mobile_money_payments")
      .update({
        status,
        provider_status: rawStatus,
        reason:
          "reason" in providerStatus
            ? (providerStatus.reason ?? null)
            : (providerStatus.message ?? null),
        raw_response: providerStatus,
        completed_at: status === "pending" ? null : new Date().toISOString(),
      })
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
      packageId: payment.package_id,
      provider,
      amount: Number(payment.amount),
      currency: payment.currency,
      status,
      phone: payment.phone,
    };
  });
