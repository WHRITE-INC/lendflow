// Real MTN MoMo Collections integration.
// Docs: https://momodeveloper.mtn.com/api-documentation/api-description/
//
// Env (server-only, read inside calls — never at module scope):
//   MTN_SUBSCRIPTION_KEY  Collections primary key (Ocp-Apim-Subscription-Key)
//   MTN_API_USER          UUID provisioned via /v1_0/apiuser (or production onboarding)
//   MTN_API_KEY           Generated via /v1_0/apiuser/{id}/apikey
//   MTN_TARGET_ENV        e.g. "mtnuganda" | "mtnghana" | "mtnzambia" | "sandbox"
//   MTN_CALLBACK_HOST     Public HTTPS host (e.g. https://your-app.lovable.app)
//
// Webhook path: /api/public/payments/mtn (registered with MTN as X-Callback-Url)

import type {
  PaymentProvider,
  InitiateInput,
  InitiateResult,
  VerifyResult,
  RefundInput,
} from "./types";

function baseUrl(env: string) {
  return env === "sandbox"
    ? "https://sandbox.momodeveloper.mtn.com"
    : "https://proxy.momoapi.mtn.com";
}

function readEnv() {
  const subKey = process.env.MTN_SUBSCRIPTION_KEY;
  const apiUser = process.env.MTN_API_USER;
  const apiKey = process.env.MTN_API_KEY;
  const targetEnv = process.env.MTN_TARGET_ENV;
  const callbackHost = process.env.MTN_CALLBACK_HOST;
  if (!subKey || !apiUser || !apiKey || !targetEnv) {
    throw new Error(
      "MTN MoMo not configured: set MTN_SUBSCRIPTION_KEY, MTN_API_USER, MTN_API_KEY, MTN_TARGET_ENV.",
    );
  }
  return { subKey, apiUser, apiKey, targetEnv, callbackHost };
}

// In-memory token cache (per worker isolate). Tokens live ~1h.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.token;

  const { subKey, apiUser, apiKey, targetEnv } = readEnv();
  const basic = btoa(`${apiUser}:${apiKey}`);
  const res = await fetch(`${baseUrl(targetEnv)}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": subKey,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MTN token error ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  return cachedToken.token;
}

function uuid(): string {
  return crypto.randomUUID();
}

// MTN MSISDN format: digits only, no leading "+" (e.g. "256771234567").
function normalizeMsisdn(input: string): string {
  return input.replace(/[^0-9]/g, "");
}

export const MTNProvider: PaymentProvider = {
  id: "mtn",

  async initiatePayment(input: InitiateInput): Promise<InitiateResult> {
    if (input.amount <= 0) return { ok: false, providerRef: "", message: "Invalid amount" };
    const { subKey, targetEnv, callbackHost } = readEnv();
    const token = await getAccessToken();
    const referenceId = uuid();

    // MTN Collections amounts are sent as STRING in MAJOR units. Our app stores
    // amounts in major units already (e.g. KES 100 = 100), so cast directly.
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": targetEnv,
      "Ocp-Apim-Subscription-Key": subKey,
      "Content-Type": "application/json",
    };
    if (callbackHost) {
      headers["X-Callback-Url"] = `${callbackHost.replace(/\/$/, "")}/api/public/payments/mtn`;
    }

    const body = {
      amount: String(input.amount),
      currency: input.currency,
      // externalId == referenceId so the webhook (which only sees externalId)
      // can correlate back to our pending transaction row by provider_ref.
      externalId: referenceId,
      payer: { partyIdType: "MSISDN", partyId: normalizeMsisdn(input.msisdn) },
      payerMessage: (input.description ?? "Akiba Loans payment").slice(0, 160),
      payeeNote: input.reference.slice(0, 160),
    };

    const res = await fetch(`${baseUrl(targetEnv)}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.status !== 202) {
      const text = await res.text();
      return {
        ok: false,
        providerRef: referenceId,
        message: `MTN requestToPay ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    return {
      ok: true,
      providerRef: referenceId,
      message: "Awaiting customer authorization on phone",
    };
  },

  async verifyPayment(providerRef: string): Promise<VerifyResult> {
    const { subKey, targetEnv } = readEnv();
    const token = await getAccessToken();
    const res = await fetch(
      `${baseUrl(targetEnv)}/collection/v1_0/requesttopay/${providerRef}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": targetEnv,
          "Ocp-Apim-Subscription-Key": subKey,
        },
      },
    );
    if (!res.ok) {
      const text = await res.text();
      return {
        status: "pending",
        providerRef,
        failureReason: `lookup ${res.status}: ${text.slice(0, 120)}`,
      };
    }
    const data = (await res.json()) as {
      status?: "SUCCESSFUL" | "FAILED" | "PENDING";
      reason?: string | { code?: string; message?: string };
    };
    const reason =
      typeof data.reason === "string"
        ? data.reason
        : data.reason?.message ?? data.reason?.code;

    if (data.status === "SUCCESSFUL") return { status: "success", providerRef, raw: data };
    if (data.status === "FAILED")
      return { status: "failed", providerRef, raw: data, failureReason: reason ?? "Declined" };
    return { status: "pending", providerRef, raw: data };
  },

  async refundPayment(_input: RefundInput): Promise<InitiateResult> {
    // MTN Disbursements requires a separate product subscription. Not enabled.
    return {
      ok: false,
      providerRef: "",
      message: "MTN refunds require a Disbursements subscription (not configured).",
    };
  },
};
