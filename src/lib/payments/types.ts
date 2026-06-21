// Provider abstraction. Real MTN MoMo / Airtel Money / M-Pesa Daraja swap in
// later behind these interfaces without touching call sites.

export type ProviderId = "mtn" | "airtel" | "mpesa";

export interface InitiateInput {
  amount: number;          // minor units
  currency: string;
  msisdn: string;          // E.164
  reference: string;       // our internal transaction id
  description?: string;
}

export interface InitiateResult {
  ok: boolean;
  providerRef: string;     // upstream id used to verify / reconcile
  message?: string;
}

export interface VerifyResult {
  status: "pending" | "success" | "failed";
  providerRef: string;
  raw?: unknown;
  failureReason?: string;
}

export interface RefundInput {
  providerRef: string;
  amount: number;
  reason?: string;
}

export interface PaymentProvider {
  id: ProviderId;
  initiatePayment(input: InitiateInput): Promise<InitiateResult>;
  verifyPayment(providerRef: string): Promise<VerifyResult>;
  refundPayment(input: RefundInput): Promise<InitiateResult>;
}
