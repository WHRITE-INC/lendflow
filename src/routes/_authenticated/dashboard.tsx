import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldCheck, Wallet, FileCheck2, Banknote, Clock, ArrowRight, LogOut, BellRing, CreditCard, BadgeCheck, Loader2, RefreshCcw, Smartphone, Lock, Sparkles,
} from "lucide-react";
import {
  checkMobileMoneyPackagePayment,
  getPromotionPackages,
  startMobileMoneyPackagePayment,
  type PackagePaymentResult,
  type PromotionPackage,
} from "@/lib/payments.functions";

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
  const loadPackages = useServerFn(getPromotionPackages);
  const startPackagePayment = useServerFn(startMobileMoneyPackagePayment);
  const checkPackagePayment = useServerFn(checkMobileMoneyPackagePayment);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [packages, setPackages] = useState<PromotionPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<"mtn_momo" | "airtel_money">("mtn_momo");
  const [payment, setPayment] = useState<PackagePaymentResult | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);

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
      if (data?.phone) setPaymentPhone(data.phone);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    })();
  }, []);

  useEffect(() => {
    loadPackages({ data: {} })
      .then((rows) => {
        setPackages(rows);
        setSelectedPackageId((current) => current || rows[0]?.id || "");
      })
      .catch((error: Error) => toast.error(error.message));
  }, [loadPackages]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Borrower";
  const kyc = profile?.kyc_status ?? "pending";
  const activation = profile?.activation_status ?? "unpaid";
  const completion = computeCompletion(profile);
  const kycApproved = kyc === "approved";

  const beginPayment = async () => {
    if (!kycApproved) {
      toast.error("Complete KYC before choosing a promotion package");
      return;
    }
    if (!selectedPackageId) {
      toast.error("Choose a package first");
      return;
    }
    setPaymentBusy(true);
    try {
      const result = await startPackagePayment({
        data: {
          packageId: selectedPackageId,
          provider: paymentProvider,
          phone: paymentPhone,
        },
      });
      setPayment(result);
      setProfile((p) => (p ? { ...p, phone: result.phone, activation_status: "pending" } : p));
      setPaymentPhone(result.phone);
      toast.success("Mobile money payment request sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start mobile money payment");
    } finally {
      setPaymentBusy(false);
    }
  };

  const refreshPayment = async () => {
    if (!payment) return;
    setPaymentBusy(true);
    try {
      const result = await checkPackagePayment({ data: { paymentId: payment.paymentId } });
      setPayment(result);
      if (result.status === "successful") {
        setProfile((p) => (p ? { ...p, activation_status: "active" } : p));
        toast.success("Payment confirmed. Your package is active.");
      } else if (result.status === "failed") {
        toast.error("Mobile money payment failed");
      } else {
        toast.info("Payment is still pending");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not check payment status");
    } finally {
      setPaymentBusy(false);
    }
  };

  const selectedPackage = packages.find((pack) => pack.id === selectedPackageId);

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
          <Kpi icon={Wallet} label="Available Limit" value="K 0" hint="Choose a package to unlock" />
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
            <button type="button" onClick={() => document.getElementById("promotion-package-payment")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="contents">
              <Step
                icon={BadgeCheck}
                n="03"
                title="Choose promotion package"
                status={statusFromActivation(activation)}
                desc="Pick a qualification package and pay by mobile money."
                interactive
              />
            </button>
          </div>
        </section>

        {/* Loan apply CTA */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-navy rounded-2xl p-8 text-navy-foreground flex flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Loan Application</p>
              <h2 className="text-2xl font-medium mt-2 text-balance">Ready when you are.</h2>
              <p className="text-sm text-navy-foreground/60 mt-2 max-w-[44ch]">
                Once your package payment is confirmed, apply for a loan in under 60 seconds. Funds are disbursed straight to your mobile money wallet.
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
          <div id="promotion-package-payment" className="bg-card ring-1 ring-black/5 rounded-2xl p-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-navy">Promotion packages</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Congratulations, you have been slotted to qualify for a promotion.
                </p>
              </div>
              {kycApproved ? <Sparkles className="size-5 text-emerald" /> : <Lock className="size-5 text-muted-foreground" />}
            </div>

            {activation === "active" ? (
              <div className="rounded-lg bg-emerald/10 px-4 py-3 text-sm font-medium text-emerald">
                Your promotion package is active.
              </div>
            ) : (
              <div className="space-y-4">
                {!kycApproved && (
                  <Link
                    to="/kyc"
                    className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                  >
                    <span>Complete KYC to unlock package selection.</span>
                    <ArrowRight className="size-4 shrink-0" />
                  </Link>
                )}

                <div className="grid gap-3">
                  {packages.map((pack) => (
                    <PromotionPackageCard
                      key={pack.id}
                      pack={pack}
                      selected={selectedPackageId === pack.id}
                      locked={!kycApproved}
                      onSelect={() => {
                        if (!kycApproved) {
                          toast.error("Complete KYC to customize and choose a package");
                          return;
                        }
                        setSelectedPackageId(pack.id);
                      }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("mtn_momo")}
                    disabled={!kycApproved}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${paymentProvider === "mtn_momo" ? "border-emerald bg-emerald/5 text-emerald" : "border-hairline text-muted-foreground"}`}
                  >
                    MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("airtel_money")}
                    disabled={!kycApproved}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${paymentProvider === "airtel_money" ? "border-emerald bg-emerald/5 text-emerald" : "border-hairline text-muted-foreground"}`}
                  >
                    Airtel Money
                  </button>
                </div>

                <label className="space-y-2 block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wallet number</span>
                  <input
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    disabled={!kycApproved}
                    placeholder="260971234567"
                    className="w-full rounded-lg border border-hairline bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald/30"
                  />
                </label>
                <button
                  onClick={beginPayment}
                  disabled={paymentBusy || activation === "active" || !selectedPackage || !kycApproved}
                  className="w-full bg-emerald text-emerald-foreground py-3 px-4 rounded-lg font-medium text-sm hover:bg-emerald/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {paymentBusy ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
                  Pay K {selectedPackage?.feeAmount.toLocaleString() ?? "0"} with {paymentProvider === "mtn_momo" ? "MTN MoMo" : "Airtel Money"}
                </button>

                {payment && (
                  <div className="rounded-lg border border-hairline p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Payment request</p>
                        <p className="font-medium text-navy">K {payment.amount.toLocaleString()} {payment.currency}</p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${payment.status === "successful" ? "bg-emerald/10 text-emerald" : payment.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-amber-50 text-amber-700"}`}>
                        {payment.status}
                      </span>
                    </div>
                    <p className="break-all text-xs text-muted-foreground">Ref: {payment.referenceId}</p>
                    <button
                      onClick={refreshPayment}
                      disabled={paymentBusy || payment.status !== "pending"}
                      className="w-full border border-hairline py-2 px-3 rounded-lg font-medium text-sm hover:bg-surface-muted transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {paymentBusy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
                      Check status
                    </button>
                  </div>
                )}
              </div>
            )}
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

function PromotionPackageCard({
  pack,
  selected,
  locked,
  onSelect,
}: {
  pack: PromotionPackage;
  selected: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  const theme = packageTheme(pack.accent);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
        selected ? `${theme.border} ${theme.bg} shadow-lg shadow-black/5` : "border-hairline bg-background hover:border-emerald/40 hover:bg-surface-muted"
      } ${locked ? "opacity-75" : "hover:-translate-y-0.5"}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${theme.rail}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-navy">{pack.name}</span>
            {pack.badge && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${theme.badge}`}>
                {pack.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-foreground">{pack.headline}</p>
          <p className="mt-1 text-xs text-muted-foreground">{pack.description}</p>
        </div>
        {locked ? <Lock className="size-4 shrink-0 text-muted-foreground" /> : selected ? <BadgeCheck className={`size-4 shrink-0 ${theme.text}`} /> : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Qualify</div>
          <div className="mt-1 text-lg font-semibold text-navy">K {pack.qualificationAmount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pay fee</div>
          <div className={`mt-1 text-lg font-semibold ${theme.text}`}>K {pack.feeAmount.toLocaleString()}</div>
        </div>
      </div>
    </button>
  );
}

function packageTheme(accent: string) {
  const themes: Record<string, { bg: string; border: string; rail: string; text: string; badge: string }> = {
    emerald: { bg: "bg-emerald/5", border: "border-emerald/50", rail: "bg-emerald", text: "text-emerald", badge: "bg-emerald/10 text-emerald" },
    amber: { bg: "bg-amber-50", border: "border-amber-300", rail: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
    sky: { bg: "bg-sky-50", border: "border-sky-300", rail: "bg-sky-500", text: "text-sky-700", badge: "bg-sky-100 text-sky-800" },
    violet: { bg: "bg-violet-50", border: "border-violet-300", rail: "bg-violet-500", text: "text-violet-700", badge: "bg-violet-100 text-violet-800" },
    rose: { bg: "bg-rose-50", border: "border-rose-300", rail: "bg-rose-500", text: "text-rose-700", badge: "bg-rose-100 text-rose-800" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-300", rail: "bg-indigo-500", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
    slate: { bg: "bg-slate-50", border: "border-slate-300", rail: "bg-slate-700", text: "text-slate-700", badge: "bg-slate-200 text-slate-800" },
  };
  return themes[accent] ?? themes.emerald;
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
