import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldCheck, Wallet, FileCheck2, Banknote, Clock, ArrowRight, LogOut, BellRing, CreditCard, BadgeCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LendFlow Zambia" }] }),
  component: Dashboard,
});

type Profile = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  kyc_status: string;
  activation_status: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("first_name,last_name,phone,kyc_status,activation_status")
        .eq("id", u.user.id)
        .maybeSingle();
      if (data) setProfile(data as Profile);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Borrower";
  const kyc = profile?.kyc_status ?? "pending";
  const activation = profile?.activation_status ?? "unpaid";
  const completion = computeCompletion(profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-6 bg-navy rounded-sm flex items-center justify-center">
              <div className="size-2 bg-emerald rounded-full" />
            </div>
            <span className="font-semibold text-navy tracking-tight">LendFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin/kyc" className="text-xs font-semibold uppercase tracking-wider text-emerald hover:underline">Admin</Link>
            )}
            <button className="relative size-9 rounded-md hover:bg-surface-muted flex items-center justify-center text-muted-foreground">
              <BellRing className="size-4" />
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-emerald" />
            </button>
            <button onClick={signOut} className="text-sm font-medium text-muted-foreground hover:text-navy inline-flex items-center gap-1.5">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Greeting */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Borrower Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-medium text-navy mt-2">Welcome, {fullName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>
          <div className="flex items-center gap-3">
            <ProfilePill label="Profile" value={`${completion}% complete`} />
          </div>
        </section>

        {/* KPI grid */}
        <section className="grid md:grid-cols-4 gap-4">
          <Kpi icon={Wallet} label="Available Limit" value="K 0" hint="Complete activation to unlock" />
          <Kpi icon={CreditCard} label="Active Loans" value="0" hint="No active loans" />
          <Kpi icon={Banknote} label="Outstanding" value="K 0" hint="Nothing due" />
          <Kpi icon={Clock} label="Next Due Date" value="—" hint="No upcoming payments" />
        </section>

        {/* Onboarding steps */}
        <section className="bg-card ring-1 ring-black/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-medium text-navy">Get loan-ready</h2>
              <p className="text-sm text-muted-foreground">Complete these steps to unlock loan applications.</p>
            </div>
            <ArrowRight className="text-muted-foreground" />
          </div>
          <div className="grid md:grid-cols-3 gap-1">
            <Step
              icon={FileCheck2}
              n="01"
              title="Complete profile"
              status={completion === 100 ? "done" : "in-progress"}
              desc="Add your NRC, address and contact details."
            />
            <Link to="/kyc" className="contents">
              <Step
                icon={ShieldCheck}
                n="02"
                title="Verify identity (KYC)"
                status={statusFromKyc(kyc)}
                desc="Upload your National ID and a selfie."
                interactive
              />
            </Link>
            <Step
              icon={BadgeCheck}
              n="03"
              title="Activate membership"
              status={statusFromActivation(activation)}
              desc="Pay activation fee to unlock your loan tier."
            />
          </div>
        </section>

        {/* Loan apply CTA */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-navy rounded-2xl p-8 text-navy-foreground flex flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Loan Application</p>
              <h2 className="text-2xl font-medium mt-2 text-balance">Ready when you are.</h2>
              <p className="text-sm text-navy-foreground/60 mt-2 max-w-[44ch]">
                Once your account is activated, apply for a loan in under 60 seconds. Funds are disbursed straight to your mobile money wallet.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={activation !== "active" || kyc !== "approved"}
                className="self-start bg-emerald text-emerald-foreground py-3 px-6 rounded-lg font-medium text-sm hover:bg-emerald/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                Apply for a loan <ArrowRight className="size-4" />
              </button>
              <Link
                to="/eligibility"
                className="self-start py-3 px-6 rounded-lg font-medium text-sm border border-emerald/40 text-emerald hover:bg-emerald/10 transition-colors inline-flex items-center gap-2"
              >
                Check eligibility <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="bg-card ring-1 ring-black/5 rounded-2xl p-8 space-y-4">
            <h3 className="font-medium text-navy">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">No transactions yet. Your loan history and repayments will appear here.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function computeCompletion(p: Profile | null) {
  if (!p) return 25;
  const fields = [p.first_name, p.last_name, p.phone];
  const filled = fields.filter(Boolean).length;
  return Math.round(((filled + 1) / (fields.length + 1)) * 100);
}

function statusFromKyc(s: string): "done" | "in-progress" | "todo" {
  if (s === "approved") return "done";
  if (s === "rejected") return "todo";
  return "in-progress";
}
function statusFromActivation(s: string): "done" | "in-progress" | "todo" {
  if (s === "active") return "done";
  if (s === "pending") return "in-progress";
  return "todo";
}

function ProfilePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-3 bg-card ring-1 ring-hairline rounded-full px-4 py-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-navy">{value}</span>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string }) {
  return (
    <div className="bg-card ring-1 ring-black/5 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="size-4 text-emerald" />
      </div>
      <div className="text-2xl font-medium text-navy">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function Step({
  icon: Icon, n, title, desc, status, interactive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  n: string; title: string; desc: string; status: "done" | "in-progress" | "todo"; interactive?: boolean;
}) {
  const badge =
    status === "done" ? { text: "Done", cls: "bg-emerald/10 text-emerald" }
    : status === "in-progress" ? { text: "In progress", cls: "bg-amber-50 text-amber-700" }
    : { text: "To do", cls: "bg-surface-muted text-muted-foreground" };
  return (
    <div className={`p-6 ring-1 ring-black/5 bg-surface flex flex-col gap-4 ${interactive ? "hover:bg-surface-muted cursor-pointer transition-colors" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">{n}</span>
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${badge.cls}`}>{badge.text}</span>
      </div>
      <Icon className="size-5 text-emerald" />
      <div>
        <h3 className="font-medium text-navy">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  );
}