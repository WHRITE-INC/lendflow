import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PRODUCTS } from "@/lib/products";
import { inputCls, money } from "@/lib/ui";
import { cn } from "@/lib/utils";
import {
  ArrowRight, CheckCircle2, Loader, ShieldCheck, Smartphone, Copy, Check, AlertTriangle,
} from "lucide-react";
import {
  canApply, currentUser, saveApplication, useRealtime, type Account, type Application,
} from "@/lib/demo-auth";

/** Collections wallet — deliberately referenced nowhere else in the app. */
const COLLECTION_MSISDN = "+254757860014";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply for a loan — LendFlow Africa" },
      { name: "description", content: "Apply for a 0% interest LendFlow Africa loan in four steps and pay your commitment by MTN MoMo or Airtel Money." },
      { property: "og:title", content: "Apply for a loan — LendFlow Africa" },
      { property: "og:description", content: "Four steps to funded. 0% interest, mobile money commitment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: ApplyPage,
});

type Form = {
  product: string; amount: number; term: number; pct: number;
  firstName: string; lastName: string; email: string; phone: string;
  employment: string; income: string; purpose: string;
  provider: string; msisdn: string; txnRef: string; consent: boolean;
};

function ApplyPage() {
  const navigate = useNavigate();
  const user = useRealtime<Account | null>(() => currentUser());
  const verified = canApply(user);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [form, setForm] = useState<Form>({
    product: "personal", amount: 15000, term: 12, pct: 12,
    firstName: "", lastName: "", email: "", phone: "",
    employment: "", income: "", purpose: "",
    provider: "", msisdn: "", txnRef: "", consent: false,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!user) return;
    setForm(f => ({
      ...f,
      firstName: f.firstName || user.name.split(" ")[0] || "",
      lastName: f.lastName || user.name.split(" ").slice(1).join(" ") || "",
      email: f.email || user.email,
      phone: f.phone || user.phone || "",
    }));
  }, [user]);

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  const product = PRODUCTS.find(p => p.slug === form.product)!;
  const commitment = Math.round((form.amount * form.pct) / 100);
  const monthly = Math.round(form.amount / form.term);

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (form.amount < product.min) e.amount = `Minimum for ${product.name} is ${money(product.min)}`;
      if (form.amount > product.max) e.amount = `Maximum for ${product.name} is ${money(product.max)}`;
      if (form.term > product.maxTerm) e.term = `Maximum term is ${product.maxTerm} months`;
    }
    if (s === 2) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
      if (!/^[+\d\s()-]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    }
    if (s === 3) {
      if (!form.employment) e.employment = "Select your employment status";
      if (!form.income || Number(form.income) <= 0) e.income = "Enter your monthly income";
      if (!form.purpose) e.purpose = "Select the purpose of the loan";
    }
    if (s === 4) {
      if (!form.provider) e.provider = "Choose the wallet you paid from";
      if (!/^[+\d\s()-]{7,}$/.test(form.msisdn)) e.msisdn = "Enter the number you paid from";
      if (form.txnRef.trim().length < 4) e.txnRef = "Enter the transaction reference from your SMS";
      if (!form.consent) e.consent = "Please confirm you have sent the commitment";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => Math.min(4, s + 1)); };
  const back = () => setStep(s => Math.max(1, s - 1));

  const submit = () => {
    if (!validate(4) || !user) return;
    setStatus("processing");
    const app: Application = {
      id: "LF-" + Math.floor(10000 + Math.random() * 89999),
      email: user.email, name: `${form.firstName} ${form.lastName}`.trim(),
      amount: form.amount, term: form.term, commitmentPct: form.pct, commitment,
      provider: form.provider, msisdn: form.msisdn, purpose: form.purpose,
      product: product.name, status: "under_review", createdAt: new Date().toISOString(),
    };
    window.setTimeout(() => { saveApplication(app); setStatus("done"); }, 1400);
  };

  const titles = ["Choose your loan", "Your details", "Income & purpose", "Pay your commitment"];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <h1 ref={headingRef} tabIndex={-1} className="display text-3xl font-black tracking-tight outline-none sm:text-4xl">
          Apply for a loan
        </h1>
        <p className="mt-2 text-[color:var(--color-muted)]">
          0% interest. You repay exactly what you borrow after a one-time 10–15% commitment.
        </p>

        {!user && <GateCard
          title="Sign in to continue"
          body="Create a free LendFlow account or sign in — your application is saved to your dashboard."
          action={<Link to="/auth" search={{ mode: "signin" }} className="btn-primary rounded-full px-6 py-3 text-sm font-bold">Sign in or register</Link>}
        />}

        {user && !verified && <GateCard
          title="Verify your identity first"
          body="One tap on your dashboard submits your verification. Approval unlocks loan applications instantly — this page updates the moment you are verified."
          action={<Link to="/dashboard" className="btn-primary rounded-full px-6 py-3 text-sm font-bold">Go to verification</Link>}
        />}

        {user && verified && (
          <div className="card mt-8 overflow-hidden">
            <div className="border-b border-[color:var(--color-line)] px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">
                    Step {status === "done" ? 4 : step} of 4
                  </div>
                  <div className="text-lg font-bold">{status === "done" ? "Application submitted" : titles[step - 1]}</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-mint)] px-3 py-1.5 text-xs font-bold text-[color:var(--color-leaf-dark)]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Identity verified
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-line)]">
                <div className="h-full rounded-full bg-[color:var(--color-leaf)] transition-all duration-500"
                  style={{ width: `${((status === "done" ? 4 : step) / 4) * 100}%` }} />
              </div>
            </div>

            <div className="px-6 py-7">
              {status === "processing" && (
                <div className="flex flex-col items-center py-16">
                  <Loader className="spin h-11 w-11 text-[color:var(--color-leaf)]" />
                  <div className="mt-5 text-lg font-bold">Submitting your application…</div>
                </div>
              )}

              {status === "done" && (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-mint)] ring-2 ring-[color:var(--color-leaf)]/50">
                    <CheckCircle2 className="h-8 w-8 text-[color:var(--color-leaf-dark)]" />
                  </div>
                  <div className="mt-5 text-2xl font-black">We&rsquo;ve got your application</div>
                  <p className="mt-2 max-w-md text-sm text-[color:var(--color-muted)]">
                    A LendFlow manager is reconciling your {money(commitment)} commitment now. You can track
                    the status live from your dashboard.
                  </p>
                  <button onClick={() => navigate({ to: "/dashboard" })} className="btn-primary mt-6 rounded-full px-6 py-3 text-sm font-bold">
                    Go to my dashboard
                  </button>
                </div>
              )}

              {status === "idle" && step === 1 && (
                <div className="space-y-6">
                  <Field label="Loan product" error={errors.product}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PRODUCTS.filter(p => !p.comingSoon).map(p => (
                        <button key={p.slug} type="button" onClick={() => update("product", p.slug)}
                          className={cn("rounded-2xl border p-4 text-left transition",
                            form.product === p.slug
                              ? "border-[color:var(--color-leaf)] bg-[color:var(--color-mint)]"
                              : "border-[color:var(--color-line)] bg-white hover:bg-[color:var(--color-sky)]")}>
                          <div className="text-sm font-bold text-[color:var(--color-navy)]">{p.name}</div>
                          <div className="mt-0.5 text-xs text-[color:var(--color-muted)]">
                            {money(p.min)} – {money(p.max)} · up to {p.maxTerm} mo
                          </div>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Slider label="Loan amount" display={money(form.amount)} min={product.min} max={product.max}
                    step={500} value={form.amount} onChange={v => update("amount", v)} error={errors.amount} />
                  <Slider label="Repayment term" display={`${form.term} months`} min={1} max={product.maxTerm}
                    step={1} value={Math.min(form.term, product.maxTerm)} onChange={v => update("term", v)} error={errors.term} />
                  <Slider label="Commitment" display={`${form.pct}%`} min={10} max={15} step={1}
                    value={form.pct} onChange={v => update("pct", v)} />
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <Summary label="Commitment" value={money(commitment)} highlight />
                    <Summary label="Monthly" value={money(monthly)} />
                    <Summary label="Total repaid" value={money(form.amount)} />
                  </div>
                </div>
              )}

              {status === "idle" && step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" error={errors.firstName}>
                    <input value={form.firstName} onChange={e => update("firstName", e.target.value)} className={inputCls(errors.firstName)} placeholder="Joseph" />
                  </Field>
                  <Field label="Last name" error={errors.lastName}>
                    <input value={form.lastName} onChange={e => update("lastName", e.target.value)} className={inputCls(errors.lastName)} placeholder="Banda" />
                  </Field>
                  <Field label="Email" error={errors.email} full>
                    <input type="email" value={form.email} onChange={e => update("email", e.target.value)} className={inputCls(errors.email)} placeholder="you@example.com" />
                  </Field>
                  <Field label="Phone number" error={errors.phone} full>
                    <input value={form.phone} onChange={e => update("phone", e.target.value)} className={inputCls(errors.phone)} placeholder="+260 97 000 0000" />
                  </Field>
                </div>
              )}

              {status === "idle" && step === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Employment status" error={errors.employment}>
                    <select value={form.employment} onChange={e => update("employment", e.target.value)} className={inputCls(errors.employment)}>
                      <option value="">Select…</option>
                      <option>Employed</option><option>Self-employed</option>
                      <option>Civil servant</option><option>Business owner</option><option>Farmer</option>
                    </select>
                  </Field>
                  <Field label="Monthly income (K)" error={errors.income}>
                    <input inputMode="numeric" value={form.income} onChange={e => update("income", e.target.value.replace(/\D/g, ""))} className={inputCls(errors.income)} placeholder="6500" />
                  </Field>
                  <Field label="Purpose of the loan" error={errors.purpose} full>
                    <select value={form.purpose} onChange={e => update("purpose", e.target.value)} className={inputCls(errors.purpose)}>
                      <option value="">Select…</option>
                      <option>Business stock</option><option>Farming inputs</option><option>School fees</option>
                      <option>Home improvement</option><option>Medical</option><option>Emergency</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2 rounded-2xl bg-[color:var(--color-sky)] p-5 text-sm text-[color:var(--color-muted)]">
                    You are applying for <strong className="text-[color:var(--color-navy)]">{money(form.amount)}</strong> over{" "}
                    <strong className="text-[color:var(--color-navy)]">{form.term} months</strong> at 0% interest.
                    Commitment due: <strong className="text-[color:var(--color-leaf-dark)]">{money(commitment)}</strong>.
                  </div>
                </div>
              )}

              {status === "idle" && step === 4 && (
                <PaymentStep
                  commitment={commitment} amount={form.amount} pct={form.pct}
                  form={form} errors={errors} update={update}
                />
              )}
            </div>

            {status === "idle" && (
              <div className="flex items-center justify-between border-t border-[color:var(--color-line)] px-6 py-4">
                <button onClick={back} disabled={step === 1}
                  className="rounded-full border border-[color:var(--color-line)] px-5 py-2.5 text-sm font-bold text-[color:var(--color-navy)] transition hover:bg-[color:var(--color-sky)] disabled:opacity-40">
                  Back
                </button>
                {step < 4 ? (
                  <button onClick={next} className="btn-navy inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={submit} className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold">
                    Submit application <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- last step: the only place the collections number appears ---------- */
function PaymentStep({ commitment, amount, pct, form, errors, update }: {
  commitment: number; amount: number; pct: number;
  form: Form; errors: Record<string, string>;
  update: <K extends keyof Form>(k: K, v: Form[K]) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(COLLECTION_MSISDN); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  const steps = useMemo(() => ({
    "MTN MoMo": [
      "Dial *165# on your MTN line (or open the MoMo app).",
      "Choose 1. Send Money, then Mobile Money User.",
      `Enter the LendFlow collections number ${COLLECTION_MSISDN}.`,
      `Enter the amount ${money(commitment)} and your MoMo PIN.`,
      "Keep the confirmation SMS — copy its transaction ID below.",
    ],
    "Airtel Money": [
      "Dial *115# on your Airtel line (or open the Airtel Money app).",
      "Choose Send Money, then To Airtel Money / Other network.",
      `Enter the LendFlow collections number ${COLLECTION_MSISDN}.`,
      `Enter the amount ${money(commitment)} and confirm with your Airtel Money PIN.`,
      "Keep the confirmation SMS — copy its transaction ID below.",
    ],
  }), [commitment]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[color:var(--color-leaf)]/40 bg-[color:var(--color-mint)] p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">Commitment due now</div>
        <div className="mt-1 text-4xl font-black tabular-nums">{money(commitment)}</div>
        <p className="mt-1 text-xs text-[color:var(--color-muted)]">
          {pct}% of {money(amount)}. This replaces interest entirely — you repay only {money(amount)}.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-line)] bg-white p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">Send the commitment to</div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="display text-2xl font-black tracking-tight text-[color:var(--color-navy)]">{COLLECTION_MSISDN}</span>
          <button type="button" onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-line)] px-3 py-1.5 text-xs font-bold hover:bg-[color:var(--color-sky)]">
            {copied ? <><Check className="h-3.5 w-3.5 text-[color:var(--color-leaf-dark)]" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy number</>}
          </button>
        </div>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          Account name: LendFlow Africa Collections. Use MTN Mobile Money or Airtel Money only.
        </p>
      </div>

      <Field label="Which wallet are you paying from?" error={errors.provider} full>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["MTN MoMo", "Airtel Money"] as const).map(p => (
            <button key={p} type="button" onClick={() => update("provider", p)}
              className={cn("rounded-xl border px-4 py-3 text-sm font-bold transition",
                form.provider === p
                  ? "border-[color:var(--color-leaf)] bg-[color:var(--color-mint)] text-[color:var(--color-leaf-dark)]"
                  : "border-[color:var(--color-line)] bg-white hover:bg-[color:var(--color-sky)]")}>
              {p}
            </button>
          ))}
        </div>
      </Field>

      {form.provider && (
        <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-sky)] p-5">
          <div className="text-sm font-black text-[color:var(--color-navy)]">How to send with {form.provider}</div>
          <ol className="mt-3 space-y-2.5">
            {steps[form.provider as keyof typeof steps].map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-[color:var(--color-muted)]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[color:var(--color-navy)] text-xs font-black text-white">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Number you paid from" error={errors.msisdn}>
          <input value={form.msisdn} onChange={e => update("msisdn", e.target.value)} className={inputCls(errors.msisdn)} placeholder="+260 97 000 0000" />
        </Field>
        <Field label="Transaction reference" error={errors.txnRef}>
          <input value={form.txnRef} onChange={e => update("txnRef", e.target.value)} className={inputCls(errors.txnRef)} placeholder="e.g. MP2608.1234.A5678" />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={form.consent} onChange={e => update("consent", e.target.checked)}
          className="mt-1 h-4 w-4 accent-[color:var(--color-leaf)]" />
        <span className="text-[color:var(--color-muted)]">
          I confirm I have sent the {money(commitment)} commitment. I understand it is refunded in full
          if my application is declined.
        </span>
      </label>
      {errors.consent && <p className="text-sm font-semibold text-red-600">{errors.consent}</p>}

      <div className="flex gap-2 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800">
        <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
        Payments are reconciled manually by a manager within one business hour of your SMS reference.
      </div>
    </div>
  );
}

/* ---------- primitives ---------- */
function GateCard({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="card mt-8 flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-lg font-bold">{title}</div>
        <p className="mt-1 text-sm text-[color:var(--color-muted)]">{body}</p>
      </div>
      {action}
    </div>
  );
}

function Field({ label, error, children, full }:
  { label: string; error?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn(full && "sm:col-span-2")}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function Slider({ label, display, min, max, step, value, onChange, error }: {
  label: string; display: string; min: number; max: number; step: number;
  value: number; onChange: (n: number) => void; error?: string;
}) {
  const pct = ((value - min) / Math.max(1, max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-[color:var(--color-muted)]">{label}</label>
        <span className="text-lg font-bold tabular-nums">{display}</span>
      </div>
      <input type="range" aria-label={label} className="slider mt-3" min={min} max={max} step={step}
        value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ ["--val" as string]: `${pct}%` }} />
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function Summary({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-sky)] px-3 py-4",
      highlight && "border-[color:var(--color-leaf)]/40 bg-[color:var(--color-mint)]")}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{label}</div>
      <div className="mt-1 text-lg font-black tabular-nums">{value}</div>
    </div>
  );
}
