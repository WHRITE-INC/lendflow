import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — Admin" }] }),
  component: AuditPage,
});

function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">Audit log</h1>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">When</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Entity</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr> :
              (data ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="p-3">{formatDateTime(a.created_at)}</td>
                  <td className="p-3 font-mono text-xs">{a.actor_id?.slice(0, 8) ?? "system"}</td>
                  <td className="p-3">{a.action}</td>
                  <td className="p-3">{a.entity} {a.entity_id ? `#${a.entity_id.slice(0, 8)}` : ""}</td>
                </tr>
              ))}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No entries.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
