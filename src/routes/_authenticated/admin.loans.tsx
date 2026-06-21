import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoStatusPill } from "@/components/status-pill";
import { formatDate, formatMoney } from "@/lib/format";
import { markDisbursed } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/loans")({
  head: () => ({ meta: [{ title: "Loans — Admin" }] }),
  component: AdminLoans,
});

function AdminLoans() {
  const qc = useQueryClient();
  const disburse = useServerFn(markDisbursed);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-loans"],
    queryFn: async () => {
      const { data } = await supabase.from("loans").select("*, profiles!loans_user_id_fkey(full_name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function doDisburse(id: string) {
    try {
      await disburse({ data: { loan_id: id } });
      toast.success("Loan marked disbursed");
      qc.invalidateQueries({ queryKey: ["admin-loans"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Loans</h1>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Borrower</th><th className="p-3">Principal</th><th className="p-3">Outstanding</th><th className="p-3">Due</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {data.map((l) => {
              const u = (l as unknown as { profiles?: { full_name: string } }).profiles;
              return (
                <tr key={l.id}>
                  <td className="p-3">{u?.full_name ?? "—"}</td>
                  <td className="p-3 tabular">{formatMoney(l.principal, l.currency)}</td>
                  <td className="p-3 tabular">{formatMoney(l.outstanding, l.currency)}</td>
                  <td className="p-3">{formatDate(l.due_date)}</td>
                  <td className="p-3"><AutoStatusPill status={l.status} /></td>
                  <td className="p-3 text-right">
                    {l.status === "pending_disbursement" && <Button size="sm" onClick={() => doDisburse(l.id)}>Mark disbursed</Button>}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No loans yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
