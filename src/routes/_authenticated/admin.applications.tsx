import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoStatusPill } from "@/components/status-pill";
import { formatDate, formatMoney } from "@/lib/format";
import { decideApplication } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  head: () => ({ meta: [{ title: "Applications — Admin" }] }),
  component: ApplicationsAdmin,
});

function ApplicationsAdmin() {
  const qc = useQueryClient();
  const decide = useServerFn(decideApplication);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data } = await supabase.from("loan_applications")
        .select("*, loan_products(name, currency), profiles!loan_applications_user_id_fkey(full_name, country)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function act(id: string, decision: "approve" | "reject") {
    const notes = decision === "reject" ? window.prompt("Reason for rejection?") ?? "" : "";
    try {
      await decide({ data: { application_id: id, decision, notes } });
      toast.success(`Application ${decision}d`);
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Loan applications</h1>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Customer</th><th className="p-3">Product</th><th className="p-3">Amount</th><th className="p-3">Term</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {data.map((a) => {
              const p = (a as unknown as { loan_products?: { name: string; currency: string } }).loan_products;
              const u = (a as unknown as { profiles?: { full_name: string; country: string } }).profiles;
              const open = a.status === "submitted" || a.status === "under_review";
              return (
                <tr key={a.id}>
                  <td className="p-3">{u?.full_name ?? "—"} <span className="text-xs text-muted-foreground">{u?.country}</span></td>
                  <td className="p-3">{p?.name ?? "—"}</td>
                  <td className="p-3 tabular">{formatMoney(a.requested_amount, p?.currency ?? "KES")}</td>
                  <td className="p-3 tabular">{a.term_days}d</td>
                  <td className="p-3">{formatDate(a.created_at)}</td>
                  <td className="p-3"><AutoStatusPill status={a.status} /></td>
                  <td className="p-3 text-right">
                    {open && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => act(a.id, "reject")}>Reject</Button>
                        <Button size="sm" onClick={() => act(a.id, "approve")}>Approve</Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No applications.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
