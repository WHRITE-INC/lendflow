import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard } from "@/components/kpi-card";
import { AutoStatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";
import { Wallet, FileText, ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Akiba" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["borrower-dashboard"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const uid = user.user!.id;
      const [profile, loans, apps, notifs] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("loans").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("loan_applications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
        supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        profile: profile.data,
        loans: loans.data ?? [],
        apps: apps.data ?? [],
        notifs: notifs.data ?? [],
      };
    },
  });

  if (isLoading || !data) {
    return <div className="text-muted-foreground">Loading your dashboard…</div>;
  }

  const active = data.loans.find((l) => l.status === "active");
  const outstanding = data.loans
    .filter((l) => l.status === "active" || l.status === "pending_disbursement")
    .reduce((s, l) => s + l.outstanding, 0);
  const currency = active?.currency ?? data.loans[0]?.currency ?? "KES";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {data.profile?.full_name ?? "Borrower"}
          </h1>
        </div>
        <Link to="/app/loans/apply"><Button size="lg">Apply for a loan</Button></Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Outstanding" value={formatMoney(outstanding, currency)} icon={<Wallet className="size-4" />} tone={outstanding > 0 ? "accent" : "default"} />
        <KpiCard label="Active loans" value={data.loans.filter((l) => l.status === "active").length} icon={<TrendingUp className="size-4" />} />
        <KpiCard label="Open applications" value={data.apps.filter((a) => a.status === "submitted" || a.status === "under_review").length} icon={<FileText className="size-4" />} />
        <KpiCard label="KYC status" value={<span className="text-base"><AutoStatusPill status={data.profile?.kyc_status ?? "pending"} /></span>} icon={<ShieldCheck className="size-4" />} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your loans</h2>
            <Link to="/app/loans" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {data.loans.length === 0 ? (
            <EmptyState
              title="No loans yet"
              body="Browse our products and apply in under two minutes."
              cta={<Link to="/app/loans/apply"><Button>Apply now</Button></Link>}
            />
          ) : (
            <ul className="divide-y">
              {data.loans.slice(0, 5).map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <div className="font-medium tabular">{formatMoney(l.principal, l.currency)}</div>
                    <div className="text-xs text-muted-foreground">
                      Due {formatDate(l.due_date)} · Outstanding {formatMoney(l.outstanding, l.currency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AutoStatusPill status={l.status} />
                    <Link to="/app/loans/$id" params={{ id: l.id }}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Notifications</h2>
          {data.notifs.length === 0 ? (
            <p className="text-sm text-muted-foreground">All caught up.</p>
          ) : (
            <ul className="space-y-3">
              {data.notifs.map((n) => (
                <li key={n.id} className="rounded-lg border bg-background p-3">
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{formatDate(n.created_at)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed py-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
