import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — LendFlow Zambia" },
      { name: "description", content: "Sign in to your LendFlow account or create one to apply for a mobile money loan." },
    ],
  }),
  component: AuthPage,
});

const PROVINCES = [
  "Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga",
  "Northern", "North-Western", "Southern", "Western",
];

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode);
  const [loading, setLoading] = useState(false);

  useEffect(() => setTab(mode), [mode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: fd.get("first_name"),
          last_name: fd.get("last_name"),
          phone: fd.get("phone"),
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Redirecting…");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-16 flex items-center border-b border-hairline">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </header>

      <main className="flex-1 grid lg:grid-cols-2">
        {/* Left: pitch */}
        <aside className="hidden lg:flex flex-col justify-between bg-navy text-navy-foreground p-12">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-emerald rounded-sm" />
            <span className="font-semibold tracking-tight">LendFlow Zambia</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-medium leading-tight text-balance max-w-[20ch]">
              Fast. Secure. Accessible credit for every Zambian.
            </h2>
            <p className="text-navy-foreground/60 text-sm max-w-[40ch] text-pretty">
              Join thousands of borrowers receiving funds directly to their mobile money wallet — typically within 15 minutes of approval.
            </p>
          </div>
          <p className="text-xs text-navy-foreground/40">&copy; {new Date().getFullYear()} LendFlow Zambia Limited.</p>
        </aside>

        {/* Right: forms */}
        <section className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="text-2xl font-semibold text-navy">
                {tab === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === "signin"
                  ? "Sign in to continue your application or manage your loan."
                  : "It takes under two minutes. Your data is encrypted end-to-end."}
              </p>
            </div>

            <div className="grid grid-cols-2 p-1 bg-surface-muted rounded-lg text-sm font-medium">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`py-2 rounded-md transition-colors ${tab === "signin" ? "bg-card text-navy shadow-sm" : "text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`py-2 rounded-md transition-colors ${tab === "signup" ? "bg-card text-navy shadow-sm" : "text-muted-foreground"}`}
              >
                Sign up
              </button>
            </div>

            {tab === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Field label="Email">
                  <input name="email" type="email" required className={inputCls} placeholder="you@example.com" />
                </Field>
                <Field label="Password">
                  <input name="password" type="password" required minLength={6} className={inputCls} placeholder="••••••••" />
                </Field>
                <SubmitButton loading={loading}>Sign in</SubmitButton>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name">
                    <input name="first_name" required className={inputCls} />
                  </Field>
                  <Field label="Last name">
                    <input name="last_name" required className={inputCls} />
                  </Field>
                </div>
                <Field label="Phone number">
                  <input name="phone" type="tel" required className={inputCls} placeholder="+260 9..." />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" required className={inputCls} />
                </Field>
                <Field label="Province">
                  <select name="province" required className={inputCls} defaultValue="">
                    <option value="" disabled>Select province</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Password">
                  <input name="password" type="password" required minLength={6} className={inputCls} placeholder="Minimum 6 characters" />
                </Field>
                <SubmitButton loading={loading}>Create account</SubmitButton>
                <p className="text-[11px] text-muted-foreground text-center">
                  By creating an account you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const inputCls = "w-full h-11 px-3 rounded-md bg-card border border-input text-navy text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-11 bg-navy text-navy-foreground rounded-md font-medium text-sm hover:bg-navy/95 transition-colors disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}