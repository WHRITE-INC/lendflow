import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney, COUNTRY_NAMES } from "@/lib/format";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { productSchema } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: ProductsAdmin,
});

type Product = {
  id?: string; name: string; description?: string | null;
  country: "KE"|"UG"|"TZ"|"RW"|"GH"|"NG";
  currency: "KES"|"UGX"|"TZS"|"RWF"|"GHS"|"NGN";
  min_amount: number; max_amount: number; interest_rate_pct: number;
  term_days: number; active: boolean;
};

const blank: Product = {
  name: "", description: "", country: "KE", currency: "KES",
  min_amount: 50000, max_amount: 500000, interest_rate_pct: 12.5, term_days: 30, active: true,
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("loan_products").select("*").order("country").order("name")).data ?? [],
  });
  const [editing, setEditing] = useState<Product | null>(null);

  async function save(p: Product) {
    const parsed = productSchema.safeParse({ ...p, description: p.description ?? "" });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (p.min_amount >= p.max_amount) return toast.error("Min must be less than max");
    const row = { ...parsed.data, description: parsed.data.description || null };
    const op = p.id
      ? supabase.from("loan_products").update(row).eq("id", p.id)
      : supabase.from("loan_products").insert(row);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function toggle(p: { id: string; active: boolean }) {
    await supabase.from("loan_products").update({ active: !p.active }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Loan products</h1>
        <Button onClick={() => setEditing(blank)}><Plus className="size-4" /> New product</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{COUNTRY_NAMES[p.country]} · {p.currency}</p>
              </div>
              <Switch checked={p.active} onCheckedChange={() => toggle({ id: p.id, active: p.active })} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 text-sm tabular">
              <span className="text-muted-foreground">Range</span><span className="text-right">{formatMoney(p.min_amount, p.currency)} – {formatMoney(p.max_amount, p.currency)}</span>
              <span className="text-muted-foreground">Rate</span><span className="text-right">{Number(p.interest_rate_pct)}%</span>
              <span className="text-muted-foreground">Term</span><span className="text-right">{p.term_days} days</span>
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(p as Product)}><Pencil className="size-3" /> Edit</Button>
          </Card>
        ))}
      </div>

      {editing && <EditorModal product={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function EditorModal({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const [p, setP] = useState(product);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold">{product.id ? "Edit product" : "New product"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <F label="Name"><Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></F>
          <F label="Country">
            <Select value={p.country} onValueChange={(v) => setP({ ...p, country: v as Product["country"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(COUNTRY_NAMES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Currency">
            <Select value={p.currency} onValueChange={(v) => setP({ ...p, currency: v as Product["currency"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["KES","UGX","TZS","RWF","GHS","NGN"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Min amount"><Input type="number" value={p.min_amount} onChange={(e) => setP({ ...p, min_amount: +e.target.value })} /></F>
          <F label="Max amount"><Input type="number" value={p.max_amount} onChange={(e) => setP({ ...p, max_amount: +e.target.value })} /></F>
          <F label="Interest %"><Input type="number" step="0.1" value={p.interest_rate_pct} onChange={(e) => setP({ ...p, interest_rate_pct: +e.target.value })} /></F>
          <F label="Term (days)"><Input type="number" value={p.term_days} onChange={(e) => setP({ ...p, term_days: +e.target.value })} /></F>
          <div className="sm:col-span-2"><F label="Description"><Input value={p.description ?? ""} onChange={(e) => setP({ ...p, description: e.target.value })} /></F></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(p)}>Save</Button>
        </div>
      </Card>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
