// Admin loan operations: approve/reject application, mark disbursed.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { decisionSchema } from "./schemas";
import { computeLoan } from "./loans/calc";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "reviewer"]);
  if (!data?.length) throw new Error("Forbidden — admin only");
}

export const decideApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => decisionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { data: app, error } = await supabase
      .from("loan_applications")
      .select("id, user_id, product_id, requested_amount, term_days, status")
      .eq("id", data.application_id)
      .maybeSingle();
    if (error || !app) throw new Error("Application not found");
    if (app.status !== "submitted" && app.status !== "under_review") {
      throw new Error("Application already decided");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.decision === "reject") {
      await supabaseAdmin.from("loan_applications").update({
        status: "rejected",
        decision_notes: data.notes ?? null,
        decided_by: userId,
        decided_at: new Date().toISOString(),
      }).eq("id", app.id);
      await supabaseAdmin.from("notifications").insert({
        user_id: app.user_id,
        channel: "inapp",
        template: "application_rejected",
        title: "Loan application rejected",
        body: data.notes || "Your application was not approved at this time.",
      });
      return { ok: true };
    }

    // approve → create loan + schedule
    const { data: product } = await supabaseAdmin
      .from("loan_products")
      .select("interest_rate_pct, currency")
      .eq("id", app.product_id)
      .single();
    if (!product) throw new Error("Product missing");

    const c = computeLoan(app.requested_amount, Number(product.interest_rate_pct), app.term_days);

    const { data: loan, error: lerr } = await supabaseAdmin.from("loans").insert({
      application_id: app.id,
      user_id: app.user_id,
      product_id: app.product_id,
      principal: c.principal,
      interest: c.interest,
      total_payable: c.total,
      outstanding: c.total,
      currency: product.currency,
      due_date: c.dueDate,
      status: "pending_disbursement",
    }).select("id").single();
    if (lerr) throw new Error(lerr.message);

    await supabaseAdmin.from("repayment_schedules").insert({
      loan_id: loan.id,
      installment_no: 1,
      due_date: c.dueDate,
      amount_due: c.total,
    });

    await supabaseAdmin.from("loan_applications").update({
      status: "approved",
      decision_notes: data.notes ?? null,
      decided_by: userId,
      decided_at: new Date().toISOString(),
    }).eq("id", app.id);

    await supabaseAdmin.from("notifications").insert({
      user_id: app.user_id,
      channel: "inapp",
      template: "application_approved",
      title: "Loan approved",
      body: `Your loan was approved. ${c.principal} principal, ${c.total} total payable.`,
    });

    return { ok: true, loan_id: loan.id };
  });

export const markDisbursed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ loan_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: loan } = await supabaseAdmin.from("loans")
      .select("id, user_id, principal, currency, status").eq("id", data.loan_id).single();
    if (!loan) throw new Error("Loan not found");
    if (loan.status !== "pending_disbursement") throw new Error("Loan not in pending_disbursement");

    await supabaseAdmin.from("loans").update({
      status: "active",
      disbursed_at: new Date().toISOString(),
    }).eq("id", loan.id);

    await supabaseAdmin.from("transactions").insert({
      loan_id: loan.id,
      user_id: loan.user_id,
      direction: "disbursement",
      provider: "manual",
      amount: loan.principal,
      currency: loan.currency,
      status: "success",
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: loan.user_id,
      channel: "inapp",
      template: "loan_disbursed",
      title: "Loan disbursed",
      body: "Your funds are on the way to your mobile money wallet.",
    });
    return { ok: true };
  });

export const updateKycStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    user_id: z.string().uuid(),
    status: z.enum(["approved", "rejected", "in_review"]),
    reason: z.string().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ kyc_status: data.status }).eq("user_id", data.user_id);
    await supabaseAdmin.from("kyc_documents").update({
      status: data.status === "approved" ? "approved" : data.status === "rejected" ? "rejected" : "pending",
      reviewer_id: userId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: data.reason ?? null,
    }).eq("user_id", data.user_id);
    await supabaseAdmin.from("notifications").insert({
      user_id: data.user_id,
      channel: "inapp",
      template: `kyc_${data.status}`,
      title: `KYC ${data.status}`,
      body: data.reason || `Your KYC status is now ${data.status}.`,
    });
    return { ok: true };
  });
