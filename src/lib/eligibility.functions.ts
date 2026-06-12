import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TierEligibility = {
  tier_id: string;
  tier_name: string;
  eligible: boolean;
  reasons: string[];
  active_loan_count: number;
  outstanding_principal: number;
};

// Evaluate which active loan tiers a user qualifies for. Callers may only
// evaluate their own profile unless they hold the admin role (enforced both
// here and in the SECURITY DEFINER SQL function).
export const getTierEligibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid().optional() }))
  .handler(async ({ data, context }): Promise<TierEligibility[]> => {
    const targetUserId = data.userId ?? context.userId;
    if (targetUserId !== context.userId) {
      const { data: isAdmin } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Forbidden");
    }
    const { data: rows, error } = await context.supabase.rpc(
      "evaluate_tier_eligibility",
      { _user_id: targetUserId },
    );
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      tier_id: r.tier_id,
      tier_name: r.tier_name,
      eligible: r.eligible,
      reasons: r.reasons ?? [],
      active_loan_count: r.active_loan_count ?? 0,
      outstanding_principal: Number(r.outstanding_principal ?? 0),
    }));
  });

// Backend-enforced loan application. Validates against tier limits
// (amount, term, repayment frequency) and rejects if the borrower fails
// eligibility (KYC, activation, age, active-loan cap, outstanding cap).
export const applyForLoan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      tierId: z.string().uuid(),
      amount: z.number().positive(),
      termMonths: z.number().int().positive(),
      repaymentFrequencyDays: z.number().int().positive(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: tier, error: tErr } = await supabase
      .from("loan_tiers")
      .select("*")
      .eq("id", data.tierId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!tier || !tier.is_active) throw new Error("Tier is not available");

    if (data.amount < tier.min_amount || data.amount > tier.max_amount) {
      throw new Error(
        `Amount must be between K${tier.min_amount} and K${tier.max_amount}`,
      );
    }
    if (
      data.termMonths < tier.min_term_months ||
      data.termMonths > tier.max_term_months
    ) {
      throw new Error(
        `Term must be between ${tier.min_term_months} and ${tier.max_term_months} months`,
      );
    }
    if (
      data.repaymentFrequencyDays < tier.min_repayment_frequency_days ||
      data.repaymentFrequencyDays > tier.max_repayment_frequency_days
    ) {
      throw new Error(
        `Repayment frequency must be ${tier.min_repayment_frequency_days}–${tier.max_repayment_frequency_days} days`,
      );
    }

    const { data: eligibility, error: eErr } = await supabase.rpc(
      "evaluate_tier_eligibility",
      { _user_id: userId },
    );
    if (eErr) throw new Error(eErr.message);
    const row = (eligibility ?? []).find((r) => r.tier_id === data.tierId);
    if (!row) throw new Error("Tier not found in eligibility results");
    if (!row.eligible) {
      throw new Error(
        `Not eligible for ${row.tier_name}: ${(row.reasons ?? []).join("; ")}`,
      );
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: created, error: iErr } = await supabaseAdmin
      .from("loans")
      .insert({
        user_id: userId,
        tier_id: tier.id,
        principal: data.amount,
        term_months: data.termMonths,
        repayment_frequency_days: data.repaymentFrequencyDays,
        interest_rate: tier.interest_rate,
        outstanding_principal: data.amount,
        status: "pending",
      })
      .select("id")
      .single();
    if (iErr) throw new Error(iErr.message);
    return { loanId: created.id };
  });