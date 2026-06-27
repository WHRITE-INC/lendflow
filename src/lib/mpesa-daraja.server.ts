import { Buffer } from "node:buffer";

type DarajaConfig = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  b2cInitiatorName?: string;
  b2cSecurityCredential?: string;
  b2cResultUrl?: string;
  b2cQueueTimeoutUrl?: string;
  settlementMsisdn?: string;
};

type TokenResponse = {
  access_token?: string;
  expires_in?: string;
};

export type MpesaStkPushResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorCode?: string;
  errorMessage?: string;
};

export type MpesaStkQueryResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  ResultCode?: string;
  ResultDesc?: string;
  errorCode?: string;
  errorMessage?: string;
};

export type MpesaB2cResponse = {
  ConversationID?: string;
  OriginatorConversationID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  errorCode?: string;
  errorMessage?: string;
};

export function normalizeMpesaMsisdn(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

export function getMpesaDarajaConfig(): DarajaConfig {
  const missing = [
    !process.env.MPESA_CONSUMER_KEY && "MPESA_CONSUMER_KEY",
    !process.env.MPESA_CONSUMER_SECRET && "MPESA_CONSUMER_SECRET",
    !process.env.MPESA_BUSINESS_SHORT_CODE && "MPESA_BUSINESS_SHORT_CODE",
    !process.env.MPESA_PASSKEY && "MPESA_PASSKEY",
    !process.env.MPESA_CALLBACK_URL && "MPESA_CALLBACK_URL",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing M-Pesa Daraja environment variable(s): ${missing.join(", ")}`);
  }

  const config = {
    baseUrl: (process.env.MPESA_BASE_URL ?? "https://api.safaricom.co.ke").replace(/\/$/, ""),
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
    passkey: process.env.MPESA_PASSKEY!,
    callbackUrl: process.env.MPESA_CALLBACK_URL!,
    b2cInitiatorName: process.env.MPESA_B2C_INITIATOR_NAME,
    b2cSecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL,
    b2cResultUrl: process.env.MPESA_B2C_RESULT_URL,
    b2cQueueTimeoutUrl: process.env.MPESA_B2C_QUEUE_TIMEOUT_URL,
    settlementMsisdn: process.env.MPESA_SETTLEMENT_MSISDN,
  };

  for (const [name, url] of [
    ["MPESA_CALLBACK_URL", config.callbackUrl],
    ["MPESA_B2C_RESULT_URL", config.b2cResultUrl],
    ["MPESA_B2C_QUEUE_TIMEOUT_URL", config.b2cQueueTimeoutUrl],
  ] as const) {
    if (!url) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") throw new Error();
    } catch {
      throw new Error(`${name} must be a valid HTTPS URL`);
    }
  }

  return config;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(config: DarajaConfig) {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.token;

  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString(
    "base64",
  );
  const response = await fetch(
    `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `M-Pesa token request failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  const body = (await response.json()) as TokenResponse;
  if (!body.access_token) throw new Error("M-Pesa token response did not include an access token");

  cachedToken = {
    token: body.access_token,
    expiresAt: now + Number(body.expires_in ?? 3599) * 1000,
  };
  return cachedToken.token;
}

function darajaTimestamp() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function validateAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("M-Pesa amount must be greater than zero");
  }
  return Math.round(amount);
}

export async function requestMpesaStkPush(params: {
  amount: number;
  phone: string;
  accountReference: string;
  description: string;
}) {
  const config = getMpesaDarajaConfig();
  const token = await getAccessToken(config);
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${config.businessShortCode}${config.passkey}${timestamp}`).toString(
    "base64",
  );
  const amount = validateAmount(params.amount);
  const phone = normalizeMpesaMsisdn(params.phone);

  if (!/^254\d{9}$/.test(phone)) {
    throw new Error("M-Pesa phone number must be a Kenyan MSISDN, for example +254712345678");
  }

  const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: config.businessShortCode,
      PhoneNumber: phone,
      CallBackURL: config.callbackUrl,
      AccountReference: params.accountReference.slice(0, 12),
      TransactionDesc: params.description.slice(0, 100),
    }),
  });

  const body = (await response.json().catch(() => ({}))) as MpesaStkPushResponse;
  if (!response.ok || body.ResponseCode !== "0" || !body.CheckoutRequestID) {
    throw new Error(
      `M-Pesa STK push failed (${response.status}): ${
        body.errorMessage ?? body.ResponseDescription ?? "Request rejected"
      }`,
    );
  }

  return body;
}

export async function queryMpesaStkPush(checkoutRequestId: string): Promise<MpesaStkQueryResponse> {
  const config = getMpesaDarajaConfig();
  const token = await getAccessToken(config);
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${config.businessShortCode}${config.passkey}${timestamp}`).toString(
    "base64",
  );

  const response = await fetch(`${config.baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`M-Pesa STK query failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }

  return (await response.json()) as MpesaStkQueryResponse;
}

export async function sendMpesaB2cPayment(params: {
  amount: number;
  phone?: string;
  remarks: string;
  occasion?: string;
  originatorConversationId?: string;
}) {
  const config = getMpesaDarajaConfig();
  const missing = [
    !config.b2cInitiatorName && "MPESA_B2C_INITIATOR_NAME",
    !config.b2cSecurityCredential && "MPESA_B2C_SECURITY_CREDENTIAL",
    !config.b2cResultUrl && "MPESA_B2C_RESULT_URL",
    !config.b2cQueueTimeoutUrl && "MPESA_B2C_QUEUE_TIMEOUT_URL",
    !(params.phone ?? config.settlementMsisdn) && "MPESA_SETTLEMENT_MSISDN",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing M-Pesa B2C environment variable(s): ${missing.join(", ")}`);
  }

  const token = await getAccessToken(config);
  const amount = validateAmount(params.amount);
  const partyB = normalizeMpesaMsisdn(params.phone ?? config.settlementMsisdn!);

  if (!/^254\d{9}$/.test(partyB)) {
    throw new Error("M-Pesa settlement wallet must be a Kenyan MSISDN");
  }

  const response = await fetch(`${config.baseUrl}/mpesa/b2c/v3/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      OriginatorConversationID: params.originatorConversationId,
      InitiatorName: config.b2cInitiatorName,
      SecurityCredential: config.b2cSecurityCredential,
      CommandID: "BusinessPayment",
      Amount: amount,
      PartyA: config.businessShortCode,
      PartyB: partyB,
      Remarks: params.remarks.slice(0, 100),
      QueueTimeOutURL: config.b2cQueueTimeoutUrl,
      ResultURL: config.b2cResultUrl,
      Occasion: (params.occasion ?? "LendFlow settlement").slice(0, 100),
    }),
  });

  const body = (await response.json().catch(() => ({}))) as MpesaB2cResponse;
  if (!response.ok || (body.ResponseCode && body.ResponseCode !== "0")) {
    throw new Error(
      `M-Pesa B2C request failed (${response.status}): ${
        body.errorMessage ?? body.ResponseDescription ?? "Request rejected"
      }`,
    );
  }

  return body;
}
