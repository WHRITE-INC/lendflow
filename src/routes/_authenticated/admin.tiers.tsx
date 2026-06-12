import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Layers, Plus, Pencil, Trash2, Loader2, Power, PowerOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/tiers")({
  head: () => ({ meta: [{ title: "Loan tiers — Admin" }] }),
  component: AdminTiers,
});

type Tier = {
  id: string;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  interest_rate: number;
  processing_fee: number;
  activation_fee: number;
  is_active: boolean;
  sort_order: number;
  max_active_loans: number;
  max_outstanding_principal: number | null;
  min_repayment_frequency_days: number;
  max_repayment_frequency_days: number;
  min_age: number;
  required_kyc_status: string;
  required_activation_status: string;
};

type Draft = Omit<Tier, "id"> & { id?: string };

const emptyDraft: Draft = {
  name: "",
  description: "",
  min_amount: 500,
  max_amount: 5000,
  min_term_months: 1,
  max_term_months: 6,
  interest_rate: 10,
  processing_fee: 0,
  activation_fee: 0,
  is_active: true,
  sort_order: 0,
  max_active_loans: 1,
  max_outstanding_principal: null,
  min_repayment_frequency_days: 7,
  max_repayment_frequency_days: 31,
  min_age: 18,
  required_kyc_status: "approved",
  required_activation_status: "active",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-ZM", { maximumFractionDigits: 0 }).format(n);

function AdminTiers() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loan_tiers")
      .select(
        "id,name,description,min_amount,max_amount,min_term_months,max_term_months,interest_rate,processing_fee,activation_fee,is_active,sort_order,max_active_loans,max_outstanding_principal,min_repayment_frequency_days,max_repayment_frequency_days,min_age,required_kyc_status,required_activation_status",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setTiers((data as Tier[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setDraft({ ...emptyDraft, sort_order: tiers.length + 1 });
    setOpen(true);
  };
  const openEdit = (t: Tier) => {
    setDraft({ ...t });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name.trim()) return toast.error("Name is required");
    if (draft.max_amount < draft.min_amount) return toast.error("Max amount must be ≥ min");
    if (draft.max_term_months < draft.min_term_months) return toast.error("Max term must be ≥ min");
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      description: draft.description?.trim() || null,
      min_amount: Number(draft.min_amount),
      max_amount: Number(draft.max_amount),
      min_term_months: Number(draft.min_term_months),
      max_term_months: Number(draft.max_term_months),
      interest_rate: Number(draft.interest_rate),
      processing_fee: Number(draft.processing_fee),
      activation_fee: Number(draft.activation_fee),
      is_active: draft.is_active,
      sort_order: Number(draft.sort_order),
      max_active_loans: Number(draft.max_active_loans),
      max_outstanding_principal:
        draft.max_outstanding_principal === null || Number.isNaN(Number(draft.max_outstanding_principal))
          ? null
          : Number(draft.max_outstanding_principal),
      min_repayment_frequency_days: Number(draft.min_repayment_frequency_days),
      max_repayment_frequency_days: Number(draft.max_repayment_frequency_days),
      min_age: Number(draft.min_age),
      required_kyc_status: draft.required_kyc_status,
      required_activation_status: draft.required_activation_status,
    };
    const { error } = draft.id
      ? await supabase.from("loan_tiers").update(payload).eq("id", draft.id)
      : await supabase.from("loan_tiers").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(draft.id ? "Tier updated" : "Tier created");
    setOpen(false);
    void load();
  };

  const toggleActive = async (t: Tier) => {
    const { error } = await supabase
      .from("loan_tiers")
      .update({ is_active: !t.is_active })
      .eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success(!t.is_active ? "Tier activated" : "Tier deactivated");
    void load();
  };

  const remove = async (t: Tier) => {
    if (!confirm(`Delete tier "${t.name}"?`)) return;
    const { error } = await supabase.from("loan_tiers").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success("Tier deleted");
    void load();
  };

  const summary = useMemo(
    () => ({
      total: tiers.length,
      active: tiers.filter((t) => t.is_active).length,
    }),
    [tiers],
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <Layers className="size-6 text-emerald" /> Loan tiers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure loan products without code changes. {summary.active} active of {summary.total}.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
          <Plus className="size-4" /> New tier
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : tiers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No loan tiers yet. Create your first to make loans available to borrowers.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tiers.map((t) => (
            <Card key={t.id} className={t.is_active ? "" : "opacity-60"}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    {t.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                    )}
                  </div>
                  <Badge variant={t.is_active ? "default" : "secondary"} className={t.is_active ? "bg-emerald text-emerald-foreground" : ""}>
                    {t.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Amount" value={`K ${fmt(t.min_amount)} – K ${fmt(t.max_amount)}`} />
                  <Stat label="Term" value={`${t.min_term_months}–${t.max_term_months} mo`} />
                  <Stat label="Interest" value={`${t.interest_rate}% / mo`} />
                  <Stat label="Processing" value={`K ${fmt(t.processing_fee)}`} />
                  <Stat label="Activation" value={`K ${fmt(t.activation_fee)}`} />
                  <Stat label="Max active" value={`${t.max_active_loans} loan${t.max_active_loans === 1 ? "" : "s"}`} />
                  <Stat
                    label="Outstanding cap"
                    value={t.max_outstanding_principal == null ? "None" : `K ${fmt(t.max_outstanding_principal)}`}
                  />
                  <Stat label="Repay every" value={`${t.min_repayment_frequency_days}–${t.max_repayment_frequency_days} days`} />
                  <Stat label="Min age" value={`${t.min_age}`} />
                  <Stat label="Requires" value={`KYC ${t.required_kyc_status}`} />
                </dl>
                <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(t)}>
                    {t.is_active ? <PowerOff className="size-3.5" /> : <Power className="size-3.5" />}
                    {t.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(t)}
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit tier" : "New tier"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" className="col-span-2">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Description" className="col-span-2">
              <Textarea
                rows={2}
                value={draft.description ?? ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
            <Field label="Min amount (K)">
              <Input
                type="number"
                value={draft.min_amount}
                onChange={(e) => setDraft({ ...draft, min_amount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max amount (K)">
              <Input
                type="number"
                value={draft.max_amount}
                onChange={(e) => setDraft({ ...draft, max_amount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Min term (months)">
              <Input
                type="number"
                value={draft.min_term_months}
                onChange={(e) => setDraft({ ...draft, min_term_months: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max term (months)">
              <Input
                type="number"
                value={draft.max_term_months}
                onChange={(e) => setDraft({ ...draft, max_term_months: Number(e.target.value) })}
              />
            </Field>
            <Field label="Interest rate (% / month)">
              <Input
                type="number"
                step="0.01"
                value={draft.interest_rate}
                onChange={(e) => setDraft({ ...draft, interest_rate: Number(e.target.value) })}
              />
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
              />
            </Field>
            <Field label="Processing fee (K)">
              <Input
                type="number"
                value={draft.processing_fee}
                onChange={(e) => setDraft({ ...draft, processing_fee: Number(e.target.value) })}
              />
            </Field>
            <Field label="Activation fee (K)">
              <Input
                type="number"
                value={draft.activation_fee}
                onChange={(e) => setDraft({ ...draft, activation_fee: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max active loans per borrower">
              <Input
                type="number"
                min={1}
                value={draft.max_active_loans}
                onChange={(e) => setDraft({ ...draft, max_active_loans: Number(e.target.value) })}
              />
            </Field>
            <Field label="Outstanding principal cap (K, blank = no cap)">
              <Input
                type="number"
                value={draft.max_outstanding_principal ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    max_outstanding_principal: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Min repayment frequency (days)">
              <Input
                type="number"
                min={1}
                value={draft.min_repayment_frequency_days}
                onChange={(e) => setDraft({ ...draft, min_repayment_frequency_days: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max repayment frequency (days)">
              <Input
                type="number"
                min={1}
                value={draft.max_repayment_frequency_days}
                onChange={(e) => setDraft({ ...draft, max_repayment_frequency_days: Number(e.target.value) })}
              />
            </Field>
            <Field label="Minimum age">
              <Input
                type="number"
                min={18}
                value={draft.min_age}
                onChange={(e) => setDraft({ ...draft, min_age: Number(e.target.value) })}
              />
            </Field>
            <Field label="Required KYC status">
              <Input
                value={draft.required_kyc_status}
                onChange={(e) => setDraft({ ...draft, required_kyc_status: e.target.value })}
              />
            </Field>
            <Field label="Required activation status">
              <Input
                value={draft.required_activation_status}
                onChange={(e) => setDraft({ ...draft, required_activation_status: e.target.value })}
              />
            </Field>
            <Field label="Sort order">
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
              />
            </Field>
            <div className="col-span-2 flex items-center justify-between rounded-lg border border-hairline p-3">
              <div>
                <Label className="text-sm">Active</Label>
                <p className="text-xs text-muted-foreground">Borrowers see only active tiers.</p>
              </div>
              <Switch
                checked={draft.is_active}
                onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-emerald text-emerald-foreground hover:bg-emerald/90"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {draft.id ? "Save changes" : "Create tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}