import { getAirtelMoneyPaymentStatus, requestAirtelMoneyPayment } from "@/lib/airtel-money.server";
import type {
  InitiateInput,
  InitiateResult,
  PaymentProvider,
  RefundInput,
  VerifyResult,
} from "./types";

function statusToVerify(
  providerRef: string,
  raw: Awaited<ReturnType<typeof getAirtelMoneyPaymentStatus>>,
): VerifyResult {
  const status = raw.status;
  if (status === "SUCCESS" || status === "SUCCESSFUL" || status === "TS") {
    return { status: "success", providerRef, raw };
  }
  if (status === "FAILED" || status === "TF") {
    return { status: "failed", providerRef, raw, failureReason: raw.message ?? "Declined" };
  }
  return { status: "pending", providerRef, raw };
}

export const AirtelProvider: PaymentProvider = {
  id: "airtel",

  async initiatePayment(input: InitiateInput): Promise<InitiateResult> {
    const externalId = crypto.randomUUID();
    await requestAirtelMoneyPayment({
      referenceId: input.reference,
      externalId,
      amount: input.amount,
      phone: input.msisdn,
    });
    return {
      ok: true,
      providerRef: externalId,
      message: "Awaiting customer authorization on Airtel Money",
    };
  },

  async verifyPayment(providerRef: string): Promise<VerifyResult> {
    const status = await getAirtelMoneyPaymentStatus(providerRef);
    return statusToVerify(providerRef, status);
  },

  async refundPayment(_input: RefundInput): Promise<InitiateResult> {
    return {
      ok: false,
      providerRef: "",
      message: "Airtel Money refunds are not configured for this merchant account.",
    };
  },
};
