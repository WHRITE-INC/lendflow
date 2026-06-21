import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoStatusPill } from "@/components/status-pill";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/loans")({
  head: () => ({ meta: [{ title: "Loans — Akiba" }] }),
  component: () => {
    const path = useRouterState({ select: (s) => s.location.pathname });
    if (path !== "/app/loans") return <Outlet />;
    return <LoansList />;
  },
});

function LoansList() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-loans-page"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const [loans, apps] = await Promise.all([
        supabase.from("loans").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("loan_applications").select("*, loan_products(name, currency)").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);
      return { loans: loans.data ?? [], apps: apps.data ?? [] };
    },
  });

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Loans</h1>
        <Link to="/app/loans/apply"><Button>New application</Button></Link>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Disbursed loans</h2>
        {data.loans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No loans yet.</p>
        ) : (
          <ul className="divide-y">
            {data.loans.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <div className="font-medium tabular">{formatMoney(l.principal, l.currency)} principal</div>
                  <div className="text-xs text-muted-foreground">
                    Outstanding {formatMoney(l.outstanding, l.currency)} · Due {formatDate(l.due_date)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AutoStatusPill status={l.status} />
                  <Link to="/app/loans/$id" params={{ id: l.id }}><Button size="sm" variant="outline">Open</Button></Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Applications</h2>
        {data.apps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="divide-y">
            {data.apps.map((a) => {
              const product = (a as unknown as { loan_products?: { name: string; currency: string } }).loan_products;
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <div className="font-medium">{product?.name ?? "Loan"}</div>
                    <div className="text-xs text-muted-foreground tabular">
                      {formatMoney(a.requested_amount, product?.currency ?? "KES")} · {a.term_days} days · {formatDate(a.created_at)}
                    </div>
                  </div>
                  <AutoStatusPill status={a.status} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
