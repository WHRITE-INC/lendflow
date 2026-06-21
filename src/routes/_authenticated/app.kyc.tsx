import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AutoStatusPill } from "@/components/status-pill";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

const DOC_TYPES = [
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "utility_bill", label: "Utility bill" },
  { value: "selfie", label: "Selfie with ID" },
] as const;

export const Route = createFileRoute("/_authenticated/app/kyc")({
  head: () => ({ meta: [{ title: "Verification — Akiba" }] }),
  component: KycPage,
});

function KycPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-kyc"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const [docs, prof] = await Promise.all([
        supabase.from("kyc_documents").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("kyc_status").eq("user_id", u.user!.id).maybeSingle(),
      ]);
      return { docs: docs.data ?? [], status: prof.data?.kyc_status ?? "pending" };
    },
  });
  const [docType, setDocType] = useState<typeof DOC_TYPES[number]["value"]>("national_id");
  const [uploading, setUploading] = useState(false);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Max 10MB per file");
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const ext = file.name.split(".").pop() || "bin";
      const path = `${uid}/${docType}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("kyc").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("kyc_documents").insert({
        user_id: uid, doc_type: docType, storage_path: path,
      });
      if (insErr) throw insErr;
      await supabase.from("profiles").update({ kyc_status: "in_review" }).eq("user_id", uid);
      toast.success("Document uploaded. We'll review shortly.");
      qc.invalidateQueries({ queryKey: ["my-kyc"] });
      qc.invalidateQueries({ queryKey: ["borrower-dashboard"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Verification</h1>
          <p className="text-sm text-muted-foreground">Upload clear photos of your documents to unlock loans.</p>
        </div>
        <AutoStatusPill status={data.status} />
      </header>

      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label>Document type</Label>
            <Select value={docType} onValueChange={(v) => setDocType(v as typeof docType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <label className="inline-flex">
            <input type="file" hidden accept="image/*,application/pdf" onChange={onUpload} disabled={uploading} />
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload"}
            </span>
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Uploaded documents</h2>
        {data.docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents yet.</p>
        ) : (
          <ul className="divide-y">
            {data.docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium capitalize">{d.doc_type.replace("_", " ")}</div>
                  <div className="text-xs text-muted-foreground">{d.storage_path.split("/").pop()}</div>
                  {d.rejection_reason && <div className="text-xs text-destructive">{d.rejection_reason}</div>}
                </div>
                <AutoStatusPill status={d.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
