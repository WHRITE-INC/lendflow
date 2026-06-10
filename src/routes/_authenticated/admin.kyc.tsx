import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/kyc")({
  head: () => ({ meta: [{ title: "KYC review — Admin" }] }),
  component: AdminKyc,
});

type Row = {
  id: string;
  user_id: string;
  doc_type: "id_front" | "id_back" | "selfie";
  storage_path: string;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  updated_at: string;
  profile?: { first_name: string | null; last_name: string | null; phone: string | null };
  url?: string;
};

const TYPE_LABEL: Record<Row["doc_type"], string> = {
  id_front: "ID Front", id_back: "ID Back", selfie: "Selfie",
};

function AdminKyc() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("kyc_documents")
      .select("id,user_id,doc_type,storage_path,status,review_notes,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) { toast.error(error.message); setLoading(false); return; }
    const baseRows = (data ?? []) as Row[];

    const userIds = Array.from(new Set(baseRows.map((r) => r.user_id)));
    const profilesByUser = new Map<string, Row["profile"]>();
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,first_name,last_name,phone")
        .in("id", userIds);
      (profs ?? []).forEach((p) => profilesByUser.set(p.id, p));
    }

    const withUrls = await Promise.all(baseRows.map(async (r) => {
      const { data: signed } = await supabase.storage.from("kyc-documents")
        .createSignedUrl(r.storage_path, 300);
      return { ...r, profile: profilesByUser.get(r.user_id), url: signed?.signedUrl };
    }));
    setRows(withUrls);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const decide = async (row: Row, status: "approved" | "rejected") => {
    let notes: string | null = null;
    if (status === "rejected") {
      notes = window.prompt("Reason for rejection (shown to borrower):") ?? null;
      if (!notes) { toast.error("Rejection reason required"); return; }
    }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("kyc_documents")
      .update({ status, review_notes: notes, reviewed_at: new Date().toISOString(), reviewed_by: u.user?.id })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Document ${status}`);
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Compliance</p>
          <h1 className="text-3xl font-medium text-navy mt-1">KYC review queue</h1>
        </div>
        <div className="inline-flex bg-card ring-1 ring-hairline rounded-full p-1 text-xs font-medium">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full capitalize transition-colors ${filter === f ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-navy"}`}
            >{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-emerald" /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 bg-card ring-1 ring-black/5 rounded-2xl">
          <Clock className="size-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No documents match this filter.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.id} className="bg-card ring-1 ring-black/5 rounded-2xl overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-surface-muted">
                {r.url ? <img src={r.url} alt="" className="w-full h-full object-cover" /> : null}
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald">{TYPE_LABEL[r.doc_type]}</span>
                  <StatusPill status={r.status} />
                </div>
                <div>
                  <p className="font-medium text-navy text-sm">
                    {[r.profile?.first_name, r.profile?.last_name].filter(Boolean).join(" ") || "Unnamed borrower"}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.profile?.phone ?? "no phone"}</p>
                  <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">{r.user_id.slice(0, 8)}…</p>
                </div>
                {r.review_notes && (
                  <p className="text-xs text-muted-foreground italic">Note: {r.review_notes}</p>
                )}
                {r.status === "pending" && (
                  <div className="flex gap-2 pt-2 mt-auto">
                    <button onClick={() => decide(r, "approved")} className="flex-1 py-2 rounded-lg bg-emerald text-emerald-foreground text-xs font-medium hover:bg-emerald/90 inline-flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="size-3.5" /> Approve
                    </button>
                    <button onClick={() => decide(r, "rejected")} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 inline-flex items-center justify-center gap-1.5">
                      <XCircle className="size-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Row["status"] }) {
  const map = {
    approved: "bg-emerald/10 text-emerald",
    rejected: "bg-destructive/10 text-destructive",
    pending: "bg-amber-50 text-amber-700",
  } as const;
  return <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${map[status]}`}>{status}</span>;
}