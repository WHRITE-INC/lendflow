import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AutoStatusPill } from "@/components/status-pill";
import { formatDateTime, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/collections")({
  head: () => ({ meta: [{ title: "Collections — Admin" }] }),
  component: Collections,
});

function Collections() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => (await supabase.from("transactions").select("*, profiles!transactions_user_id_fkey(full_name)").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Collections</h1>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">When</th><th className="p-3">Borrower</th><th className="p-3">Direction</th><th className="p-3">Provider</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Ref</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading…</td></tr> :
              (data ?? []).map((t) => {
                const u = (t as unknown as { profiles?: { full_name: string } }).profiles;
                return (
                  <tr key={t.id}>
                    <td className="p-3">{formatDateTime(t.created_at)}</td>
                    <td className="p-3">{u?.full_name ?? "—"}</td>
                    <td className="p-3 capitalize">{t.direction}</td>
                    <td className="p-3 uppercase">{t.provider}</td>
                    <td className="p-3 tabular">{formatMoney(t.amount, t.currency)}</td>
                    <td className="p-3"><AutoStatusPill status={t.status} /></td>
                    <td className="p-3 font-mono text-xs">{t.provider_ref ?? "—"}</td>
                  </tr>
                );
              })}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
