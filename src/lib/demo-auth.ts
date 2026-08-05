import { useEffect, useState } from "react";

export type Role = "manager" | "client";
export type KycStatus = "unverified" | "pending" | "verified" | "rejected";

export type KycDocKey = "idFront" | "idBack" | "selfie";
export type KycDocs = Partial<Record<KycDocKey, string>>;

export const KYC_DOC_FIELDS: { key: KycDocKey; label: string; hint: string }[] = [
  { key: "idFront", label: "National ID — front", hint: "All four corners visible, no glare" },
  { key: "idBack", label: "National ID — back", hint: "Make sure the text is readable" },
  { key: "selfie", label: "Selfie with your ID", hint: "Hold the ID next to your face" },
];

export type Account = {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  nrc?: string;
  kyc: KycStatus;
  kycDocs?: KycDocs;
  kycSubmittedAt?: string;
  kycReviewedAt?: string;
  kycNote?: string;
};

export type Application = {
  id: string;
  email: string;
  name: string;
  amount: number;
  term: number;
  commitmentPct: number;
  commitment: number;
  provider: string;
  msisdn: string;
  purpose: string;
  product: string;
  status: "awaiting_commitment" | "under_review" | "approved" | "declined";
  createdAt: string;
};

const USERS_KEY = "lf_users_v2";
const SESSION_KEY = "lf_session_v2";
const APPS_KEY = "lf_applications_v2";
const CHANNEL = "lf_realtime";
export const EVENT = "lf:change";

export const DEMO_ACCOUNTS: Account[] = [
  { email: "manager@lendflowafrica.com", password: "Manager@2026", name: "Grace Mwansa", role: "manager", kyc: "verified" },
  { email: "client@lendflowafrica.com", password: "Client@2026", name: "Joseph Banda", role: "client", phone: "+260 97 555 0142", kyc: "unverified" },
];

/* ---------------- realtime bus ---------------- */
let bc: BroadcastChannel | null = null;
function channel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!bc) {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = () => window.dispatchEvent(new CustomEvent(EVENT));
  }
  return bc;
}

export function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
  channel()?.postMessage(Date.now());
}

/** Subscribe to every data change across tabs/windows in real time. */
export function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  channel();
  const onStorage = (e: StorageEvent) => {
    if (!e.key || [USERS_KEY, SESSION_KEY, APPS_KEY].includes(e.key)) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  const poll = window.setInterval(cb, 1500); // safety net for same-origin edge cases
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
    window.clearInterval(poll);
  };
}

/** Re-render a component whenever LendFlow data changes anywhere. */
export function useRealtime<T>(selector: () => T): T {
  const [value, setValue] = useState<T>(selector);
  useEffect(() => {
    const sync = () => setValue(() => selector());
    sync();
    return subscribe(sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

/* ---------------- storage ---------------- */
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emitChange();
}

function storedUsers(): Account[] {
  const stored = read<Account[]>(USERS_KEY, []);
  if (stored.length) return stored;
  return DEMO_ACCOUNTS.map(a => ({ ...a }));
}

export function allUsers(): Account[] {
  const users = storedUsers();
  const merged = [...users];
  for (const d of DEMO_ACCOUNTS) if (!merged.some(u => u.email === d.email)) merged.push({ ...d });
  return merged;
}

function persistUsers(users: Account[]) { write(USERS_KEY, users); }

/* ---------------- auth ---------------- */
export function signIn(email: string, password: string): Account | null {
  const user = allUsers().find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) return null;
  persistUsers(allUsers());
  write(SESSION_KEY, { email: user.email });
  return user;
}

export function signUp(input: { name: string; email: string; password: string; phone: string }):
  { ok: true; user: Account } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (allUsers().some(u => u.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user: Account = { ...input, email, role: "client", kyc: "unverified" };
  persistUsers([...allUsers(), user]);
  write(SESSION_KEY, { email });
  return { ok: true, user };
}

export function currentUser(): Account | null {
  const s = read<{ email: string } | null>(SESSION_KEY, null);
  if (!s) return null;
  return allUsers().find(u => u.email === s.email) ?? null;
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  emitChange();
}

export function updateUser(email: string, patch: Partial<Account>) {
  persistUsers(allUsers().map(u => (u.email === email ? { ...u, ...patch } : u)));
}

/* ---------------- KYC (single consolidated verification) ---------------- */
export function saveKycDoc(email: string, key: KycDocKey, dataUrl: string) {
  const user = allUsers().find(u => u.email === email);
  updateUser(email, { kycDocs: { ...(user?.kycDocs ?? {}), [key]: dataUrl } });
}
export function removeKycDoc(email: string, key: KycDocKey) {
  const user = allUsers().find(u => u.email === email);
  const docs = { ...(user?.kycDocs ?? {}) };
  delete docs[key];
  updateUser(email, { kycDocs: docs });
}
export const kycDocsComplete = (u: Account | null) =>
  !!u && KYC_DOC_FIELDS.every(f => !!u.kycDocs?.[f.key]);

export function submitKyc(email: string) {
  updateUser(email, { kyc: "pending", kycSubmittedAt: new Date().toISOString(), kycNote: undefined });
}

/** Downscale an uploaded photo to a compact data URL so it fits in demo storage. */
export async function fileToDataUrl(file: File, max = 900): Promise<string> {
  const raw: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
  if (typeof document === "undefined" || !file.type.startsWith("image/")) return raw;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Invalid image"));
      el.src = raw;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return raw;
  }
}

export function reviewKyc(email: string, decision: "verified" | "rejected", note?: string) {
  updateUser(email, { kyc: decision, kycReviewedAt: new Date().toISOString(), kycNote: note });
}
export const canApply = (u: Account | null) => !!u && u.kyc === "verified";

/* ---------------- applications ---------------- */
export function listApplications(): Application[] {
  const stored = read<Application[] | null>(APPS_KEY, null);
  if (stored) return stored;
  write(APPS_KEY, SEED);
  return SEED;
}
export function saveApplication(app: Application) {
  write(APPS_KEY, [app, ...listApplications()]);
}
export function updateApplication(id: string, patch: Partial<Application>) {
  write(APPS_KEY, listApplications().map(a => (a.id === id ? { ...a, ...patch } : a)));
}

const SEED: Application[] = [
  {
    id: "LF-10241", email: "client@lendflowafrica.com", name: "Joseph Banda",
    amount: 8000, term: 6, commitmentPct: 12, commitment: 960,
    provider: "MTN MoMo", msisdn: "+260 97 555 0142", purpose: "Business stock",
    product: "Business Loan", status: "under_review",
    createdAt: new Date(Date.now() - 864e5 * 2).toISOString(),
  },
  {
    id: "LF-10238", email: "mary.phiri@example.com", name: "Mary Phiri",
    amount: 15000, term: 12, commitmentPct: 15, commitment: 2250,
    provider: "Airtel Money", msisdn: "+260 96 555 0987", purpose: "Farming inputs",
    product: "Agri Loan", status: "approved",
    createdAt: new Date(Date.now() - 864e5 * 9).toISOString(),
  },
  {
    id: "LF-10233", email: "kofi.mensah@example.com", name: "Kofi Mensah",
    amount: 4000, term: 3, commitmentPct: 10, commitment: 400,
    provider: "MTN MoMo", msisdn: "+254 71 555 0034", purpose: "School fees",
    product: "Personal Loan", status: "awaiting_commitment",
    createdAt: new Date(Date.now() - 864e5 * 12).toISOString(),
  },
];

export { money } from "@/lib/ui";
