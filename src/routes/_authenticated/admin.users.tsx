import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AutoStatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: UsersAdmin,
});

function UsersAdmin() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const rows = (data ?? []).filter((p) =>
    !q || (p.full_name?.toLowerCase().includes(q.toLowerCase())) || (p.phone_e164?.includes(q)) || (p.email?.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Users</h1>
        <Input placeholder="Search by name, email or phone" className="max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Country</th><th className="p-3">KYC</th><th className="p-3">Joined</th></tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr> :
              rows.map((p) => (
                <tr key={p.user_id}>
                  <td className="p-3">{p.full_name ?? "—"}</td>
                  <td className="p-3">{p.email ?? "—"}</td>
                  <td className="p-3 tabular">{p.phone_e164 ?? "—"}</td>
                  <td className="p-3">{p.country ?? "—"}</td>
                  <td className="p-3"><AutoStatusPill status={p.kyc_status} /></td>
                  <td className="p-3">{formatDate(p.created_at)}</td>
                </tr>
              ))
            }
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No matches.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
