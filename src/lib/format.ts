// Currency / money helpers — store as integer minor units, format at edges.

export const CURRENCY_BY_COUNTRY: Record<string, "KES" | "UGX" | "TZS" | "RWF" | "GHS" | "NGN"> = {
  KE: "KES",
  UG: "UGX",
  TZ: "TZS",
  RW: "RWF",
  GH: "GHS",
  NG: "NGN",
};

export const COUNTRY_NAMES: Record<string, string> = {
  KE: "Kenya",
  UG: "Uganda",
  TZ: "Tanzania",
  RW: "Rwanda",
  GH: "Ghana",
  NG: "Nigeria",
};

export const COUNTRY_DIAL: Record<string, string> = {
  KE: "+254",
  UG: "+256",
  TZ: "+255",
  RW: "+250",
  GH: "+233",
  NG: "+234",
};

export function formatMoney(amount: number | bigint | null | undefined, currency: string) {
  if (amount == null) return "—";
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function formatDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function daysFromNow(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
