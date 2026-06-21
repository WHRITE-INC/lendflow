// Provider registry. MTN is the real Collections API; Airtel and M-Pesa are
// mocks until their credentials are wired in.
import type {
  PaymentProvider,
  InitiateInput,
  InitiateResult,
  VerifyResult,
  RefundInput,
  ProviderId,
} from "./types";
import { MTNProvider } from "./mtn";

const FAILURE_RATE = 0.1; // 10% of mock STK pushes fail

function makeRef(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function makeMockProvider(id: ProviderId, prefix: string): PaymentProvider {
  return {
    id,
    async initiatePayment(input: InitiateInput): Promise<InitiateResult> {
      if (input.amount <= 0) return { ok: false, providerRef: "", message: "Invalid amount" };
      return { ok: true, providerRef: makeRef(prefix), message: "Pending customer authorization" };
    },
    async verifyPayment(providerRef: string): Promise<VerifyResult> {
      let h = 0;
      for (let i = 0; i < providerRef.length; i++) h = (h * 31 + providerRef.charCodeAt(i)) | 0;
      const failed = Math.abs(h % 1000) < FAILURE_RATE * 1000;
      return failed
        ? { status: "failed", providerRef, failureReason: "Customer cancelled or insufficient funds" }
        : { status: "success", providerRef };
    },
    async refundPayment(input: RefundInput): Promise<InitiateResult> {
      return { ok: true, providerRef: makeRef(`${prefix}r`), message: `Refund of ${input.amount} accepted` };
    },
  };
}

export const AirtelProvider = makeMockProvider("airtel", "atl");
export const MpesaProvider = makeMockProvider("mpesa", "mpx");
export { MTNProvider };

export function getProvider(id: ProviderId): PaymentProvider {
  switch (id) {
    case "mtn": return MTNProvider;
    case "airtel": return AirtelProvider;
    case "mpesa": return MpesaProvider;
  }
}
