import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { DEMO_ACCOUNTS, signIn, signUp } from "@/lib/demo-auth";
import { inputCls } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { KeyRound, ShieldCheck, UserPlus } from "lucide-react";

type Search = { mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s['mode'] === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in or register — LendFlow Africa" },
      { name: "description", content: "Sign in to your LendFlow Africa dashboard or create a free account to apply for a 0% interest loan." },
      { property: "og:title", content: "Sign in or register — LendFlow Africa" },
      { property: "og:description", content: "Access your LendFlow Africa dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signin") {
      const user = signIn(email, password);
      if (!user) return setError("Incorrect email or password.");
      navigate({ to: user.role === "manager" ? "/manager" : "/dashboard" });
    } else {
      if (!name.trim()) return setError("Please enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      const res = signUp({ name, email, password, phone });
      if (!res.ok) return setError(res.error);
      navigate({ to: "/dashboard" });
    }
  };

  const useDemo = (i: number) => {
    setMode("signin");
    setEmail(DEMO_ACCOUNTS[i].email);
    setPassword(DEMO_ACCOUNTS[i].password);
    setError("");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-2 lg:px-8">
        <div className="card rise p-8">
          <div className="flex gap-2 rounded-full bg-[color:var(--color-sky)] p-1">
            {(["signin", "signup"] as const).map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(""); }}
                className={cn("flex-1 rounded-full px-4 py-2 text-sm font-bold transition",
                  mode === m ? "bg-white text-[color:var(--color-navy)] shadow" : "text-[color:var(--color-muted)]")}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h1 className="display mt-6 text-2xl font-black tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your free account"}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            {mode === "signin" ? "Clients and managers use the same sign-in." : "Register, verify once, and apply for a 0% interest loan."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <Labelled label="Full name">
                  <input value={name} onChange={e => setName(e.target.value)} className={inputCls()} placeholder="Joseph Banda" />
                </Labelled>
                <Labelled label="Mobile number">
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls()} placeholder="+260 97 000 0000" />
                </Labelled>
              </>
            )}
            <Labelled label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls()} placeholder="you@example.com" />
            </Labelled>
            <Labelled label="Password">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls()} placeholder="••••••••" />
            </Labelled>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full rounded-full px-6 py-3 text-sm font-bold">
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">
              <KeyRound className="h-4 w-4" /> Demo sign-in details
            </div>
            <div className="mt-5 space-y-4">
              {DEMO_ACCOUNTS.map((a, i) => (
                <div key={a.email} className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-mint)] p-5">
                  <div className="flex items-center gap-2 text-sm font-black text-[color:var(--color-navy)]">
                    {a.role === "manager" ? <ShieldCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {a.role === "manager" ? "Manager / back office" : "Client / borrower"}
                  </div>
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-[color:var(--color-muted)]">Email</dt><dd className="font-bold">{a.email}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-[color:var(--color-muted)]">Password</dt><dd className="font-bold">{a.password}</dd></div>
                  </dl>
                  <button type="button" onClick={() => useDemo(i)} className="btn-navy mt-4 w-full rounded-full px-4 py-2 text-xs font-bold">
                    Use these credentials
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 text-sm text-[color:var(--color-muted)]">
            New clients: register, tap <strong className="text-[color:var(--color-navy)]">Verify my identity</strong> once on your
            dashboard, then apply. All loans are 0% interest with a 10–15% commitment.{" "}
            <Link to="/loans" className="font-bold text-[color:var(--color-leaf-dark)]">See loan options</Link>.
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{label}</label>
      {children}
    </div>
  );
}
