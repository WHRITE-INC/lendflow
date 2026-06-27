// Borrower-initiated repayment + status polling.
// Real provider call lives in src/lib/payments/providers.ts; swap to real
// MTN MoMo / Airtel Money / M-Pesa Daraja behind the same interface.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getProvider } from "./payments/providers";
import { settleToMpesaWallet } from "./payments/settlement";
import { repaySchema } from "./schemas";

export const initiateRepayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => repaySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: loan, error: loanErr } = await supabase
      .from("loans")
      .select("id, user_id, outstanding, currency, status")
      .eq("id", data.loan_id)
      .maybeSingle();
    if (loanErr) throw new Error(loanErr.message);
    if (!loan) throw new Error("Loan not found");
    if (loan.user_id !== userId) throw new Error("Forbidden");
    if (loan.status !== "active") throw new Error("Loan is not active");
    if (data.amount > loan.outstanding) throw new Error("Amount exceeds outstanding balance");

    const provider = getProvider(data.provider);
    const result = await provider.initiatePayment({
      amount: data.amount,
      currency: loan.currency,
      msisdn: data.msisdn,
      reference: `loan_${loan.id}`,
      description: `Repayment for loan ${loan.id.slice(0, 8)}`,
    });
    if (!result.ok) throw new Error(result.message ?? "Provider rejected request");

    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert({
        loan_id: loan.id,
        user_id: userId,
        direction: "repayment",
        provider: data.provider,
        provider_ref: result.providerRef,
        msisdn: data.msisdn,
        amount: data.amount,
        currency: loan.currency,
        status: "pending",
      })
      .select("id, provider_ref")
      .single();
    if (txErr) throw new Error(txErr.message);

    return { transaction_id: tx.id, provider_ref: tx.provider_ref };
  });

export const verifyRepayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const obj = input as { transaction_id?: unknown };
    if (typeof obj.transaction_id !== "string") throw new Error("transaction_id required");
    return { transaction_id: obj.transaction_id };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: tx, error } = await supabase
      .from("transactions")
      .select("id, user_id, loan_id, provider, provider_ref, amount, status")
      .eq("id", data.transaction_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!tx) throw new Error("Transaction not found");
    if (tx.user_id !== userId) throw new Error("Forbidden");
    if (tx.status !== "pending") return { status: tx.status };
    if (!tx.provider_ref) return { status: "pending" };

    const provider = getProvider(tx.provider as "mtn" | "airtel" | "mpesa");
    const verify = await provider.verifyPayment(tx.provider_ref);

    if (verify.status === "pending") return { status: "pending" };

    // Use admin client to update outside of RLS (verified server-side).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (verify.status === "failed") {
      await supabaseAdmin
        .from("transactions")
        .update({
          status: "failed",
          failure_reason: verify.failureReason ?? "Unknown",
        })
        .eq("id", tx.id);
      return { status: "failed" as const };
    }

    // success: mark tx success and reduce outstanding atomically (best-effort)
    await supabaseAdmin
      .from("transactions")
      .update({ status: "success", raw_payload: verify.raw as never })
      .eq("id", tx.id);

    if (tx.loan_id) {
      const { data: loanRow } = await supabaseAdmin
        .from("loans")
        .select("outstanding")
        .eq("id", tx.loan_id)
        .single();
      if (loanRow) {
        const newOutstanding = Math.max(0, loanRow.outstanding - tx.amount);
        await supabaseAdmin
          .from("loans")
          .update({
            outstanding: newOutstanding,
            status: newOutstanding === 0 ? "completed" : "active",
          })
          .eq("id", tx.loan_id);

        // mark schedule rows paid in order
        const { data: schedules } = await supabaseAdmin
          .from("repayment_schedules")
          .select("id, amount_due, amount_paid, status")
          .eq("loan_id", tx.loan_id)
          .order("installment_no", { ascending: true });
        let remaining = tx.amount;
        for (const s of schedules ?? []) {
          if (remaining <= 0) break;
          if (s.status === "paid") continue;
          const need = s.amount_due - s.amount_paid;
          const pay = Math.min(need, remaining);
          const paid = s.amount_paid + pay;
          await supabaseAdmin
            .from("repayment_schedules")
            .update({
              amount_paid: paid,
              status: paid >= s.amount_due ? "paid" : "partial",
            })
            .eq("id", s.id);
          remaining -= pay;
        }

        await supabaseAdmin.from("notifications").insert({
          user_id: tx.user_id,
          channel: "inapp",
          template: "repayment_success",
          title: "Payment received",
          body: `We received your payment. Outstanding: ${newOutstanding}`,
        });
      }
    }

    await settleToMpesaWallet({
      source: "transaction",
      sourceId: tx.id,
      provider: tx.provider,
      amount: tx.amount,
    }).catch((error) => {
      console.error("M-Pesa settlement submission failed", error);
    });

    return { status: "success" as const };
  });
