import { sendMpesaB2cPayment } from "@/lib/mpesa-daraja.server";

type SettlementSource = "transaction" | "mobile_money_payment";

export async function settleToMpesaWallet(params: {
  source: SettlementSource;
  sourceId: string;
  provider: string;
  amount: number;
  enabledOnlyForAirtel?: boolean;
}) {
  if (!process.env.MPESA_SETTLEMENT_MSISDN) return;
  if (params.enabledOnlyForAirtel !== false && !params.provider.includes("airtel")) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const originatorConversationId = `${params.source}-${params.sourceId}`.slice(0, 64);

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("payment_settlements")
    .select("id,status")
    .eq("source_table", params.source)
    .eq("source_id", params.sourceId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing && existing.status !== "failed") return;

  const payload = {
    source_table: params.source,
    source_id: params.sourceId,
    destination_provider: "mpesa",
    destination_msisdn: process.env.MPESA_SETTLEMENT_MSISDN,
    amount: params.amount,
    status: "pending",
  };

  const { data: settlement, error: upsertError } = await supabaseAdmin
    .from("payment_settlements")
    .upsert(payload, { onConflict: "source_table,source_id" })
    .select("id")
    .single();
  if (upsertError) throw new Error(upsertError.message);

  try {
    const response = await sendMpesaB2cPayment({
      amount: params.amount,
      remarks: `LendFlow ${params.source} settlement`,
      occasion: params.sourceId,
      originatorConversationId,
    });

    await supabaseAdmin
      .from("payment_settlements")
      .update({
        status: "submitted",
        provider_ref: response.ConversationID ?? response.OriginatorConversationID ?? null,
        raw_response: response,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", settlement.id);
  } catch (error) {
    await supabaseAdmin
      .from("payment_settlements")
      .update({
        status: "failed",
        failure_reason: error instanceof Error ? error.message : "M-Pesa settlement failed",
      })
      .eq("id", settlement.id);
    throw error;
  }
}
