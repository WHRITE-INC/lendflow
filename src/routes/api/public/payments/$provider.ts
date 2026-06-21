// Public webhook endpoint for provider callbacks.
//
// MTN MoMo: registered via X-Callback-Url on requestToPay. MTN does NOT sign
// callbacks, so we treat the body as a hint only and re-verify the status
// against MTN's API before mutating any state (the providerRef in our DB is
// the X-Reference-Id we generated, which MTN echoes back as `externalId`).
import { createFileRoute } from "@tanstack/react-router";
import { getProvider } from "@/lib/payments/providers";
import type { ProviderId } from "@/lib/payments/types";

const KNOWN: ProviderId[] = ["mtn", "airtel", "mpesa"];

export const Route = createFileRoute("/api/public/payments/$provider")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const provider = params.provider as ProviderId;
        if (!KNOWN.includes(provider)) {
          return new Response("Unknown provider", { status: 404 });
        }

        let payload: Record<string, unknown> | null = null;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        // Extract reference per provider format.
        let ref: string | undefined;
        if (provider === "mtn") {
          // MTN payload uses `externalId` (= our X-Reference-Id we set on init).
          ref =
            (payload?.externalId as string | undefined) ??
            (payload?.referenceId as string | undefined);
        } else {
          ref =
            (payload?.providerRef as string | undefined) ??
            (payload?.reference as string | undefined);
        }
        if (!ref) return new Response("missing reference", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: tx } = await supabaseAdmin
          .from("transactions")
          .select("id, status, loan_id, user_id, amount, provider, provider_ref")
          .eq("provider_ref", ref)
          .maybeSingle();
        if (!tx) return new Response("unknown ref", { status: 404 });
        if (tx.status !== "pending") return Response.json({ ok: true, already: tx.status });

        // Re-verify against the provider (don't trust unsigned callback body).
        let success: boolean;
        let failureReason: string | undefined;
        if (provider === "mtn") {
          const verify = await getProvider("mtn").verifyPayment(ref);
          if (verify.status === "pending") {
            // Callback arrived but provider still says pending — leave for polling.
            return Response.json({ ok: true, status: "pending" });
          }
          success = verify.status === "success";
          failureReason = verify.failureReason;
        } else {
          // Mock providers: trust payload.status
          success = (payload?.status as string | undefined) !== "failed";
        }

        await supabaseAdmin.from("transactions").update({
          status: success ? "success" : "failed",
          failure_reason: success ? null : (failureReason ?? "Declined"),
          raw_payload: payload as never,
        }).eq("id", tx.id);

        if (success && tx.loan_id) {
          const { data: loan } = await supabaseAdmin
            .from("loans").select("outstanding").eq("id", tx.loan_id).single();
          if (loan) {
            const newOut = Math.max(0, loan.outstanding - tx.amount);
            await supabaseAdmin.from("loans").update({
              outstanding: newOut,
              status: newOut === 0 ? "completed" : "active",
            }).eq("id", tx.loan_id);

            // Apply across schedule rows in order.
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
              await supabaseAdmin.from("repayment_schedules").update({
                amount_paid: paid,
                status: paid >= s.amount_due ? "paid" : "partial",
              }).eq("id", s.id);
              remaining -= pay;
            }
          }
        }

        return Response.json({ ok: true });
      },
    },
  },
});
