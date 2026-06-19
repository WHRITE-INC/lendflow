import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const baseUrl = "https://sandbox.momodeveloper.mtn.com";

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

function setEnvValue(source, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(source)) return source.replace(pattern, line);
  return `${source.trimEnd()}\n${line}\n`;
}

async function expectResponse(response, expectedStatus, operation) {
  if (response.status === expectedStatus) return;
  const detail = await response.text().catch(() => "");
  throw new Error(`${operation} failed (${response.status})${detail ? `: ${detail}` : ""}`);
}

const currentEnv = await readFile(envPath, "utf8").catch(() => "");
const env = { ...parseEnv(currentEnv), ...process.env };
const subscriptionKey = env.MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY;
const callbackUrl = env.MTN_MOMO_CALLBACK_URL;
const callbackHost = callbackUrl ? new URL(callbackUrl).host : "localhost";

if (!subscriptionKey) {
  console.error("Missing MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY in .env");
  console.error("Sign in at https://momodeveloper.mtn.com/product, subscribe to Collections,");
  console.error("then place its Primary or Secondary key in .env and run this command again.");
  process.exit(1);
}

const apiUser = randomUUID();
const commonHeaders = {
  "Content-Type": "application/json",
  "Ocp-Apim-Subscription-Key": subscriptionKey,
};

const createUserResponse = await fetch(`${baseUrl}/v1_0/apiuser`, {
  method: "POST",
  headers: { ...commonHeaders, "X-Reference-Id": apiUser },
  body: JSON.stringify({ providerCallbackHost: callbackHost }),
});
await expectResponse(createUserResponse, 201, "Creating MTN sandbox API user");

const createKeyResponse = await fetch(`${baseUrl}/v1_0/apiuser/${apiUser}/apikey`, {
  method: "POST",
  headers: commonHeaders,
  body: "{}",
});
await expectResponse(createKeyResponse, 201, "Creating MTN sandbox API key");
const keyBody = await createKeyResponse.json();
if (!keyBody.apiKey) throw new Error("MTN did not return an API key");

let nextEnv = currentEnv;
const values = {
  MTN_MOMO_BASE_URL: baseUrl,
  MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY: subscriptionKey,
  MTN_MOMO_COLLECTION_API_USER: apiUser,
  MTN_MOMO_COLLECTION_API_KEY: keyBody.apiKey,
  MTN_MOMO_TARGET_ENVIRONMENT: "sandbox",
  MTN_MOMO_CURRENCY: "EUR",
};
for (const [key, value] of Object.entries(values)) nextEnv = setEnvValue(nextEnv, key, value);
await writeFile(envPath, nextEnv, { mode: 0o600 });

const credentials = Buffer.from(`${apiUser}:${keyBody.apiKey}`).toString("base64");
const tokenResponse = await fetch(`${baseUrl}/collection/token/`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${credentials}`,
    "Ocp-Apim-Subscription-Key": subscriptionKey,
  },
});
await expectResponse(tokenResponse, 200, "Validating MTN sandbox credentials");
const tokenBody = await tokenResponse.json();
if (!tokenBody.access_token) throw new Error("MTN credential validation did not return a token");

console.log("MTN MoMo sandbox credentials were created and saved to .env.");
console.log(`API user: ${apiUser}`);
console.log("Credential validation: successful");
console.log("Sandbox uses EUR. Change the environment and currency only after MTN Zambia go-live.");
