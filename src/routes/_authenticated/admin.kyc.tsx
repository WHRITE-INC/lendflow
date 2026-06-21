import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoStatusPill } from "@/components/status-pill";
import { updateKycStatus } from "@/lib/admin.functions";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/kyc")({
  head: () => ({ meta: [{ title: "KYC queue — Admin" }] }),
  component: KycQueue,
});

function KycQueue() {
  const qc = useQueryClient();
  const update = useServerFn(updateKycStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-kyc"],
    queryFn: async () => {
      const { data: docs } = await supabase
        .from("kyc_documents")
        .select("*, profiles!kyc_documents_user_id_fkey(full_name, country, kyc_status)")
        .order("created_at", { ascending: false });
      return docs ?? [];
    },
  });

  async function decide(userId: string, status: "approved" | "rejected") {
    const reason = status === "rejected" ? window.prompt("Reason?") ?? "" : "";
    try {
      await update({ data: { user_id: userId, status, reason } });
      toast.success(`KYC ${status}`);
      qc.invalidateQueries({ queryKey: ["admin-kyc"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">KYC review queue</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((d) => {
          const p = (d as unknown as { profiles?: { full_name: string; country: string; kyc_status: string } }).profiles;
          return <KycCard key={d.id} doc={d} profile={p} onDecide={decide} />;
        })}
        {data.length === 0 && <p className="text-muted-foreground">Queue empty.</p>}
      </div>
    </div>
  );
}

function KycCard({ doc, profile, onDecide }: {
  doc: { id: string; user_id: string; doc_type: string; storage_path: string; status: string; created_at: string };
  profile?: { full_name: string; country: string; kyc_status: string };
  onDecide: (u: string, s: "approved" | "rejected") => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("kyc").createSignedUrl(doc.storage_path, 300).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [doc.storage_path]);
  return (
    <Card className="overflow-hidden">
      {url ? (
        doc.storage_path.endsWith(".pdf") ?
          <a href={url} target="_blank" rel="noreferrer" className="block bg-muted/50 p-12 text-center text-accent">Open PDF</a>
        : <img src={url} alt="" className="aspect-video w-full bg-muted object-contain" />
      ) : <div className="aspect-video w-full animate-pulse bg-muted" />}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{profile?.full_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{profile?.country} · {doc.doc_type.replace("_", " ")}</div>
          </div>
          <AutoStatusPill status={doc.status} />
        </div>
        {(doc.status === "pending" || doc.status === "in_review") && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onDecide(doc.user_id, "rejected")}>Reject</Button>
            <Button size="sm" className="flex-1" onClick={() => onDecide(doc.user_id, "approved")}>Approve</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
