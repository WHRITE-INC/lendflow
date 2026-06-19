import { Buffer } from "node:buffer";

type MomoConfig = {
  baseUrl: string;
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
  targetEnvironment: string;
  currency: string;
  callbackUrl?: string;
};

type RequestToPayParams = {
  referenceId: string;
  externalId: string;
  amount: number;
  currency: string;
  phone: string;
  payerMessage: string;
  payeeNote: string;
};

export type MomoPaymentStatus = {
  amount?: string;
  currency?: string;
  financialTransactionId?: string;
  externalId?: string;
  payer?: {
    partyIdType?: string;
    partyId?: string;
  };
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  reason?: string;
};

export type MomoAccountBalance = {
  availableBalance: string;
  currency: string;
};

export function getMtnMomoConfig(): MomoConfig {
  const missing = [
    !process.env.MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY && "MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY",
    !process.env.MTN_MOMO_COLLECTION_API_USER && "MTN_MOMO_COLLECTION_API_USER",
    !process.env.MTN_MOMO_COLLECTION_API_KEY && "MTN_MOMO_COLLECTION_API_KEY",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing MTN MoMo environment variable(s): ${missing.join(", ")}`);
  }

  const config = {
    baseUrl: (process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com").replace(
      /\/$/,
      "",
    ),
    subscriptionKey: process.env.MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY!,
    apiUser: process.env.MTN_MOMO_COLLECTION_API_USER!,
    apiKey: process.env.MTN_MOMO_COLLECTION_API_KEY!,
    targetEnvironment: process.env.MTN_MOMO_TARGET_ENVIRONMENT ?? "sandbox",
    currency: process.env.MTN_MOMO_CURRENCY ?? "ZMW",
    callbackUrl: process.env.MTN_MOMO_CALLBACK_URL,
  };

  if (!/^[A-Z]{3}$/.test(config.currency)) {
    throw new Error("MTN_MOMO_CURRENCY must be a three-letter ISO currency code");
  }

  if (config.callbackUrl) {
    try {
      const callbackUrl = new URL(config.callbackUrl);
      if (callbackUrl.protocol !== "https:") throw new Error();
    } catch {
      throw new Error("MTN_MOMO_CALLBACK_URL must be a valid HTTPS URL");
    }
  }

  return config;
}

export function normalizeMomoMsisdn(value: string) {
  return value.replace(/[^\d]/g, "");
}

async function getCollectionAccessToken(config: MomoConfig) {
  const credentials = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString("base64");
  const response = await fetch(`${config.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
  });

  if (!response.ok) {
    throw new Error(`MTN MoMo token request failed (${response.status})`);
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token)
    throw new Error("MTN MoMo token response did not include an access token");
  return body.access_token;
}

export async function requestMtnMomoPayment(params: RequestToPayParams) {
  const config = getMtnMomoConfig();
  const phone = normalizeMomoMsisdn(params.phone);

  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    throw new Error("MTN MoMo payment amount must be greater than zero");
  }
  if (params.currency !== config.currency) {
    throw new Error(
      `MTN MoMo currency mismatch: payment uses ${params.currency}, but MTN_MOMO_CURRENCY is ${config.currency}`,
    );
  }
  if (!/^\d{9,15}$/.test(phone)) {
    throw new Error("MTN MoMo payer number must use international format");
  }

  const token = await getCollectionAccessToken(config);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Reference-Id": params.referenceId,
    "X-Target-Environment": config.targetEnvironment,
    "Ocp-Apim-Subscription-Key": config.subscriptionKey,
  };
  if (config.callbackUrl) headers["X-Callback-Url"] = config.callbackUrl;

  const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount: params.amount.toFixed(2),
      currency: params.currency,
      externalId: params.externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: phone,
      },
      payerMessage: params.payerMessage,
      payeeNote: params.payeeNote,
    }),
  });

  if (response.status !== 202) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `MTN MoMo payment request failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return { referenceId: params.referenceId, currency: params.currency, status: "PENDING" as const };
}

export async function getMtnMomoPaymentStatus(referenceId: string): Promise<MomoPaymentStatus> {
  const config = getMtnMomoConfig();
  const token = await getCollectionAccessToken(config);
  const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": config.targetEnvironment,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
  });

  if (!response.ok) {
    throw new Error(`MTN MoMo status request failed (${response.status})`);
  }

  return (await response.json()) as MomoPaymentStatus;
}

export async function getMtnMomoAccountBalance(currency?: string): Promise<MomoAccountBalance> {
  const config = getMtnMomoConfig();
  const requestedCurrency = (currency ?? config.currency).toUpperCase();
  if (!/^[A-Z]{3}$/.test(requestedCurrency)) {
    throw new Error("MTN MoMo balance currency must be a three-letter ISO currency code");
  }

  const token = await getCollectionAccessToken(config);
  const response = await fetch(
    `${config.baseUrl}/collection/v1_0/account/balance/${requestedCurrency}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": config.targetEnvironment,
        "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `MTN MoMo balance request failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return (await response.json()) as MomoAccountBalance;
}
