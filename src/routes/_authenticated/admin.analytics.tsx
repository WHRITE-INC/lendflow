import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: Analytics,
});

function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [loans, txs] = await Promise.all([
        supabase.from("loans").select("currency, principal, interest, status, disbursed_at"),
        supabase.from("transactions").select("currency, amount, direction, status, created_at"),
      ]);
      return { loans: loans.data ?? [], txs: txs.data ?? [] };
    },
  });
  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  const byCurrency = new Map<string, { disbursed: number; collected: number; interest: number; defaulted: number; total: number }>();
  for (const l of data.loans) {
    const c = byCurrency.get(l.currency) ?? { disbursed: 0, collected: 0, interest: 0, defaulted: 0, total: 0 };
    if (l.disbursed_at) c.disbursed += l.principal;
    if (l.status === "completed") c.interest += l.interest;
    if (l.status === "defaulted") c.defaulted += 1;
    c.total += 1;
    byCurrency.set(l.currency, c);
  }
  for (const t of data.txs) {
    if (t.direction === "repayment" && t.status === "success") {
      const c = byCurrency.get(t.currency) ?? { disbursed: 0, collected: 0, interest: 0, defaulted: 0, total: 0 };
      c.collected += t.amount;
      byCurrency.set(t.currency, c);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {[...byCurrency.entries()].map(([currency, c]) => {
          const rate = c.disbursed > 0 ? Math.round((c.collected / c.disbursed) * 100) : 0;
          const defaultRate = c.total > 0 ? Math.round((c.defaulted / c.total) * 100) : 0;
          return (
            <Card key={currency} className="p-6">
              <h2 className="font-display text-lg font-semibold">{currency}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Mini label="Total loans" value={c.total} />
                <Mini label="Disbursed" value={formatMoney(c.disbursed, currency)} />
                <Mini label="Collected" value={formatMoney(c.collected, currency)} />
                <Mini label="Interest revenue" value={formatMoney(c.interest, currency)} />
                <Mini label="Collection rate" value={`${rate}%`} />
                <Mini label="Default rate" value={`${defaultRate}%`} />
              </div>
            </Card>
          );
        })}
        {byCurrency.size === 0 && <p className="text-muted-foreground">No data yet.</p>}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg tabular">{value}</div>
    </div>
  );
}
