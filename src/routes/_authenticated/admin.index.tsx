import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard } from "@/components/kpi-card";
import { formatMoney } from "@/lib/format";
import { Users, Wallet, AlertTriangle, CircleDollarSign, TrendingUp, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — Akiba" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profiles, loans, apps, txs] = await Promise.all([
        supabase.from("profiles").select("user_id, kyc_status", { count: "exact", head: false }),
        supabase.from("loans").select("*"),
        supabase.from("loan_applications").select("id, status"),
        supabase.from("transactions").select("direction, status, amount, currency"),
      ]);
      return {
        users: profiles.data?.length ?? 0,
        kycPending: profiles.data?.filter((p) => p.kyc_status !== "approved").length ?? 0,
        loans: loans.data ?? [],
        apps: apps.data ?? [],
        txs: txs.data ?? [],
      };
    },
  });

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  const active = data.loans.filter((l) => l.status === "active");
  const overdue = data.loans.filter((l) => l.status === "active" && new Date(l.due_date).getTime() < Date.now());
  const totalRevenue = data.loans.filter((l) => l.status === "completed").reduce((s, l) => s + l.interest, 0);
  const totalDisbursed = data.loans.reduce((s, l) => s + (l.disbursed_at ? l.principal : 0), 0);
  const collected = data.txs.filter((t) => t.direction === "repayment" && t.status === "success").reduce((s, t) => s + t.amount, 0);
  const collectionRate = totalDisbursed > 0 ? Math.round((collected / totalDisbursed) * 100) : 0;
  const currency = data.loans[0]?.currency ?? "KES";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Admin overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide metrics at a glance.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Total users" value={data.users} icon={<Users className="size-4" />} hint={`${data.kycPending} need KYC`} />
        <KpiCard label="Active loans" value={active.length} icon={<Wallet className="size-4" />} tone="accent" />
        <KpiCard label="Overdue" value={overdue.length} icon={<AlertTriangle className="size-4" />} tone={overdue.length ? "danger" : "default"} />
        <KpiCard label="Total disbursed" value={formatMoney(totalDisbursed, currency)} icon={<CircleDollarSign className="size-4" />} />
        <KpiCard label="Revenue (interest)" value={formatMoney(totalRevenue, currency)} icon={<TrendingUp className="size-4" />} />
        <KpiCard label="Collection rate" value={`${collectionRate}%`} icon={<FileCheck2 className="size-4" />} hint="Collected ÷ disbursed" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Applications by status" items={countBy(data.apps, "status")} />
        <Panel title="Loans by status" items={countBy(data.loans, "status")} />
      </section>
    </div>
  );
}

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  const map = new Map<string, number>();
  for (const i of items) map.set(String(i[key]), (map.get(String(i[key])) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function Panel({ title, items }: { title: string; items: [string, number][] }) {
  const max = Math.max(1, ...items.map((i) => i[1]));
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : (
        <ul className="space-y-2">
          {items.map(([k, v]) => (
            <li key={k} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{k.replace(/_/g, " ")}</span>
                <span className="tabular text-muted-foreground">{v}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(v / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
