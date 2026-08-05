import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { KpiCard, StatusPill } from "@/components/AppShell";
import {
  canApply, currentUser, fileToDataUrl, kycDocsComplete, KYC_DOC_FIELDS, listApplications, money,
  removeKycDoc, saveKycDoc, submitKyc, useRealtime,
  type Account, type Application, type KycDocKey,
} from "@/lib/demo-auth";
import { ShieldCheck, Clock, XCircle, BadgeCheck, ArrowRight, Upload, Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard — LendFlow Africa" },
      { name: "description", content: "Verify your identity in one tap and track your LendFlow Africa loan applications, commitments and repayments in real time." },
      { property: "og:title", content: "My dashboard — LendFlow Africa" },
      { property: "og:description", content: "Verification, applications and repayments in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const user = useRealtime<Account | null>(() => currentUser());
  const apps = useRealtime<Application[]>(() => listApplications());
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/auth", search: { mode: "signin" } });
    else if (user.role === "manager") navigate({ to: "/manager" });
  }, [ready, user, navigate]);

  if (!user || user.role === "manager") return null;

  const mine = apps.filter(a => a.email === user.email);
  const outstanding = mine.filter(a => a.status === "approved").reduce((s, a) => s + a.amount, 0);
  const commitments = mine.reduce((s, a) => s + a.commitment, 0);
  const verified = canApply(user);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <h1 className="display text-3xl font-black tracking-tight">Hello, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[color:var(--color-muted)]">
          All LendFlow loans are 0% interest — you repay only what you borrow.
        </p>

        <VerificationCard user={user} />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Applications" value={String(mine.length)} hint="Lifetime" tone="sky" />
          <KpiCard label="Outstanding" value={money(outstanding)} hint="Principal only" />
          <KpiCard label="Commitments paid" value={money(commitments)} tone="sun" />
          <KpiCard label="Interest charged" value="K0" hint="0% forever" />
        </div>

        <div className="card mt-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-6 py-4">
            <h2 className="text-lg font-bold">My applications</h2>
            {verified && <Link to="/apply" className="btn-primary rounded-full px-4 py-2 text-xs font-bold">New application</Link>}
          </div>
          {mine.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[color:var(--color-muted)]">
              No applications yet. Once verified you can apply in four steps.
            </p>
          ) : (
            <div className="divide-y divide-[color:var(--color-line)]">
              {mine.map(a => (
                <div key={a.id} className="grid gap-3 px-6 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="font-bold">{a.id} · {money(a.amount)} <span className="font-normal text-[color:var(--color-muted)]">· {a.product}</span></div>
                    <div className="text-xs text-[color:var(--color-muted)]">
                      {a.term} months · commitment {money(a.commitment)} ({a.commitmentPct}%) · {a.provider}
                    </div>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function VerificationCard({ user }: { user: Account }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = user.kyc;
  const complete = kycDocsComplete(user);
  const locked = state === "pending" || state === "verified";

  const verify = () => {
    if (!complete) { setError("Upload all three documents before verifying."); return; }
    setError(null);
    setBusy(true);
    submitKyc(user.email);
    window.setTimeout(() => setBusy(false), 600);
  };

  const tone =
    state === "verified" ? "border-[color:var(--color-leaf)]/40 bg-[color:var(--color-mint)]"
    : state === "pending" ? "border-amber-200 bg-amber-50"
    : state === "rejected" ? "border-red-200 bg-red-50"
    : "border-[color:var(--color-line)] bg-white";

  const icon =
    state === "verified" ? <BadgeCheck className="h-6 w-6 text-[color:var(--color-leaf-dark)]" />
    : state === "pending" ? <Clock className="h-6 w-6 text-amber-600" />
    : state === "rejected" ? <XCircle className="h-6 w-6 text-red-600" />
    : <ShieldCheck className="h-6 w-6 text-[color:var(--color-navy)]" />;

  const copy = {
    unverified: { t: "Verify your identity", b: "One button covers your whole KYC — identity, address and wallet ownership. Verification unlocks loan applications." },
    pending: { t: "Verification in review", b: "A LendFlow compliance officer is reviewing your details. This card updates the moment a decision is made — no refresh needed." },
    verified: { t: "You are verified", b: "Your identity is confirmed. You can apply for any LendFlow loan right now." },
    rejected: { t: "Verification declined", b: user.kycNote || "We could not confirm your details. Please re-submit your verification." },
  }[state];

  return (
    <section className={`card mt-8 flex flex-col gap-5 border p-7 sm:flex-row sm:items-center ${tone}`} aria-live="polite">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">{icon}</div>
      <div className="flex-1">
        <h2 className="text-lg font-bold">{copy.t}</h2>
        <p className="mt-1 max-w-2xl text-sm text-[color:var(--color-muted)]">{copy.b}</p>
      </div>
      {state === "verified" ? (
        <Link to="/apply" className="btn-primary inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold">
          Apply for a loan <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button onClick={verify} disabled={state === "pending" || busy}
          className="btn-navy shrink-0 rounded-full px-6 py-3 text-sm font-bold disabled:opacity-50">
          {state === "pending" ? "Awaiting review…" : state === "rejected" ? "Re-submit verification" : "Verify my identity"}
        </button>
      )}
    </section>
  );
}

function KycDocuments({ user, locked, error }:
  { user: Account; locked: boolean; error: string | null }) {
  return (
    <section className="card mt-6 p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Your KYC documents</h2>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Upload clear photos. They sync to the compliance team instantly — one verification covers everything.
          </p>
        </div>
        <span className="rounded-full bg-[color:var(--color-sky)] px-3 py-1 text-xs font-bold text-[color:var(--color-navy)]">
          {KYC_DOC_FIELDS.filter(f => user.kycDocs?.[f.key]).length}/3 uploaded
        </span>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {KYC_DOC_FIELDS.map(f => (
          <DocSlot key={f.key} email={user.email} docKey={f.key} label={f.label} hint={f.hint}
            value={user.kycDocs?.[f.key]} locked={locked} />
        ))}
      </div>
    </section>
  );
}

function DocSlot({ email, docKey, label, hint, value, locked }: {
  email: string; docKey: KycDocKey; label: string; hint: string; value?: string; locked: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try { saveKycDoc(email, docKey, await fileToDataUrl(file)); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-3">
      <div className="text-xs font-bold text-[color:var(--color-navy)]">{label}</div>
      <div className="mt-3 aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-[color:var(--color-line)] bg-white">
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} disabled={locked || busy}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-xs font-semibold text-[color:var(--color-muted)] hover:bg-[color:var(--color-mint)] disabled:opacity-50">
            <Upload className="h-5 w-5" />
            {busy ? "Uploading…" : "Upload photo"}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden"
        onChange={e => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-[11px] text-[color:var(--color-muted)]">{hint}</span>
        {value ? (
          locked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[color:var(--color-leaf-dark)]">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          ) : (
            <button onClick={() => removeKycDoc(email, docKey)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline">
              <Trash2 className="h-3.5 w-3.5" /> Replace
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
