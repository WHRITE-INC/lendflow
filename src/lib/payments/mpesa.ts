import { queryMpesaStkPush, requestMpesaStkPush } from "@/lib/mpesa-daraja.server";
import type {
  InitiateInput,
  InitiateResult,
  PaymentProvider,
  RefundInput,
  VerifyResult,
} from "./types";

export const MpesaProvider: PaymentProvider = {
  id: "mpesa",

  async initiatePayment(input: InitiateInput): Promise<InitiateResult> {
    const result = await requestMpesaStkPush({
      amount: input.amount,
      phone: input.msisdn,
      accountReference: input.reference,
      description: input.description ?? "LendFlow payment",
    });

    return {
      ok: true,
      providerRef: result.CheckoutRequestID!,
      message: result.CustomerMessage ?? "Enter your M-Pesa PIN to complete payment",
    };
  },

  async verifyPayment(providerRef: string): Promise<VerifyResult> {
    const result = await queryMpesaStkPush(providerRef);
    if (result.ResultCode === "0") return { status: "success", providerRef, raw: result };

    if (result.ResponseCode === "0" && !result.ResultCode) {
      return { status: "pending", providerRef, raw: result };
    }

    const pendingCodes = new Set(["500.001.1001", "500.001.1002"]);
    if (result.errorCode && pendingCodes.has(result.errorCode)) {
      return { status: "pending", providerRef, raw: result };
    }

    return {
      status: "failed",
      providerRef,
      raw: result,
      failureReason: result.ResultDesc ?? result.ResponseDescription ?? result.errorMessage,
    };
  },

  async refundPayment(_input: RefundInput): Promise<InitiateResult> {
    return {
      ok: false,
      providerRef: "",
      message: "M-Pesa refunds require a reversal flow and are not enabled in this app.",
    };
  },
};
