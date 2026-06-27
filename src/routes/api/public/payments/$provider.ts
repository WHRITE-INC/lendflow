// Public webhook endpoint for provider callbacks.
//
// MTN MoMo: registered via X-Callback-Url on requestToPay. MTN does NOT sign
// callbacks, so we treat the body as a hint only and re-verify the status
// against MTN's API before mutating any state (the providerRef in our DB is
// the X-Reference-Id we generated, which MTN echoes back as `externalId`).
import { createFileRoute } from "@tanstack/react-router";
import { getProvider } from "@/lib/payments/providers";
import { settleToMpesaWallet } from "@/lib/payments/settlement";
import type { ProviderId } from "@/lib/payments/types";

const KNOWN: ProviderId[] = ["mtn", "airtel", "mpesa"];
const B2C_CALLBACKS = ["mpesa-b2c", "mpesa-b2c-timeout"];

export const Route = createFileRoute("/api/public/payments/$provider")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const providerParam = params.provider;
        if (
          !KNOWN.includes(providerParam as ProviderId) &&
          !B2C_CALLBACKS.includes(providerParam)
        ) {
          return new Response("Unknown provider", { status: 404 });
        }

        let payload: Record<string, unknown> | null = null;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("invalid json", { status: 400 });
        }

        if (B2C_CALLBACKS.includes(providerParam)) {
          const result = (payload.Body as Record<string, unknown> | undefined)?.Result as
            | Record<string, unknown>
            | undefined;
          const originatorConversationId =
            (result?.OriginatorConversationID as string | undefined) ??
            (payload.OriginatorConversationID as string | undefined);
          if (!originatorConversationId)
            return new Response("missing conversation id", { status: 400 });

          const [sourceTable, sourceId] = originatorConversationId.split(/-(.+)/);
          if (!sourceTable || !sourceId)
            return new Response("invalid conversation id", { status: 400 });

          const resultCode = String(result?.ResultCode ?? payload.ResultCode ?? "");
          const success = providerParam === "mpesa-b2c" && resultCode === "0";
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("payment_settlements")
            .update({
              status: success ? "completed" : "failed",
              failure_reason: success
                ? null
                : String(result?.ResultDesc ?? payload.ResultDesc ?? "M-Pesa B2C callback failed"),
              raw_response: payload,
            })
            .eq("source_table", sourceTable)
            .eq("source_id", sourceId);

          return Response.json({ ok: true });
        }

        const provider = providerParam as ProviderId;

        // Extract reference per provider format.
        let ref: string | undefined;
        if (provider === "mtn") {
          // MTN payload uses `externalId` (= our X-Reference-Id we set on init).
          ref =
            (payload?.externalId as string | undefined) ??
            (payload?.referenceId as string | undefined);
        } else if (provider === "mpesa") {
          const body = payload?.Body as Record<string, unknown> | undefined;
          const callback = body?.stkCallback as Record<string, unknown> | undefined;
          ref =
            (callback?.CheckoutRequestID as string | undefined) ??
            (payload?.CheckoutRequestID as string | undefined) ??
            (payload?.providerRef as string | undefined);
        } else {
          const transaction = payload?.transaction as Record<string, unknown> | undefined;
          ref =
            (transaction?.id as string | undefined) ??
            (payload?.id as string | undefined) ??
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

        // Re-verify against the provider; public callbacks are only hints.
        const verify = await getProvider(provider).verifyPayment(ref);
        if (verify.status === "pending") {
          return Response.json({ ok: true, status: "pending" });
        }
        const success = verify.status === "success";
        const failureReason = verify.failureReason;

        await supabaseAdmin
          .from("transactions")
          .update({
            status: success ? "success" : "failed",
            failure_reason: success ? null : (failureReason ?? "Declined"),
            raw_payload: { callback: payload, verify: verify.raw } as never,
          })
          .eq("id", tx.id);

        if (success && tx.loan_id) {
          const { data: loan } = await supabaseAdmin
            .from("loans")
            .select("outstanding")
            .eq("id", tx.loan_id)
            .single();
          if (loan) {
            const newOut = Math.max(0, loan.outstanding - tx.amount);
            await supabaseAdmin
              .from("loans")
              .update({
                outstanding: newOut,
                status: newOut === 0 ? "completed" : "active",
              })
              .eq("id", tx.loan_id);

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
              await supabaseAdmin
                .from("repayment_schedules")
                .update({
                  amount_paid: paid,
                  status: paid >= s.amount_due ? "paid" : "partial",
                })
                .eq("id", s.id);
              remaining -= pay;
            }
          }

          await settleToMpesaWallet({
            source: "transaction",
            sourceId: tx.id,
            provider,
            amount: tx.amount,
          }).catch((error) => {
            console.error("M-Pesa settlement submission failed", error);
          });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
