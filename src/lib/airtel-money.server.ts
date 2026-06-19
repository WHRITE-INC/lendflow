type AirtelConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  country: string;
  currency: string;
};

type AirtelTokenResponse = {
  access_token?: string;
  data?: {
    access_token?: string;
  };
};

export type AirtelPaymentStatus = {
  status: "PENDING" | "SUCCESS" | "SUCCESSFUL" | "FAILED" | "TF" | "TS" | "TIP";
  message?: string;
  data?: unknown;
};

export function getAirtelMoneyConfig(): AirtelConfig {
  const missing = [
    !process.env.AIRTEL_MONEY_CLIENT_ID && "AIRTEL_MONEY_CLIENT_ID",
    !process.env.AIRTEL_MONEY_CLIENT_SECRET && "AIRTEL_MONEY_CLIENT_SECRET",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing Airtel Money environment variable(s): ${missing.join(", ")}`);
  }

  return {
    baseUrl: (process.env.AIRTEL_MONEY_BASE_URL ?? "https://openapi.airtel.africa").replace(/\/$/, ""),
    clientId: process.env.AIRTEL_MONEY_CLIENT_ID!,
    clientSecret: process.env.AIRTEL_MONEY_CLIENT_SECRET!,
    country: process.env.AIRTEL_MONEY_COUNTRY ?? "ZM",
    currency: process.env.AIRTEL_MONEY_CURRENCY ?? "ZMW",
  };
}

export function normalizeAirtelMsisdn(value: string) {
  return value.replace(/[^\d]/g, "");
}

async function getAirtelAccessToken(config: AirtelConfig) {
  const response = await fetch(`${config.baseUrl}/auth/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Airtel Money token request failed (${response.status})`);
  }

  const body = (await response.json()) as AirtelTokenResponse;
  const token = body.access_token ?? body.data?.access_token;
  if (!token) throw new Error("Airtel Money token response did not include an access token");
  return token;
}

export async function requestAirtelMoneyPayment(params: {
  referenceId: string;
  externalId: string;
  amount: number;
  phone: string;
}) {
  const config = getAirtelMoneyConfig();
  const token = await getAirtelAccessToken(config);
  const response = await fetch(`${config.baseUrl}/merchant/v1/payments/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Country": config.country,
      "X-Currency": config.currency,
    },
    body: JSON.stringify({
      reference: params.referenceId,
      subscriber: {
        country: config.country,
        currency: config.currency,
        msisdn: params.phone,
      },
      transaction: {
        amount: params.amount.toFixed(2),
        country: config.country,
        currency: config.currency,
        id: params.externalId,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Airtel Money payment request failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return { currency: config.currency };
}

export async function getAirtelMoneyPaymentStatus(externalId: string): Promise<AirtelPaymentStatus> {
  const config = getAirtelMoneyConfig();
  const token = await getAirtelAccessToken(config);
  const response = await fetch(`${config.baseUrl}/standard/v1/payments/${externalId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Country": config.country,
      "X-Currency": config.currency,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtel Money status request failed (${response.status})`);
  }

  return (await response.json()) as AirtelPaymentStatus;
}
