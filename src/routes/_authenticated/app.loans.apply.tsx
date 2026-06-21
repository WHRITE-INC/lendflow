import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format";
import { computeLoan } from "@/lib/loans/calc";
import { applicationSchema } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/app/loans/apply")({
  head: () => ({ meta: [{ title: "Apply for a loan — Akiba" }] }),
  component: ApplyPage,
});

function ApplyPage() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useQuery({
    queryKey: ["loan-products-eligible"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: prof } = await supabase.from("profiles").select("country, kyc_status").eq("user_id", u.user!.id).maybeSingle();
      const q = supabase.from("loan_products").select("*").eq("active", true);
      const { data } = prof?.country ? await q.eq("country", prof.country) : await q;
      return { products: data ?? [], profile: prof };
    },
  });
  const [productId, setProductId] = useState<string | null>(null);
  const product = products?.products.find((p) => p.id === productId);
  const [amount, setAmount] = useState(0);
  const [term, setTerm] = useState(30);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setAmount(Math.round((product.min_amount + product.max_amount) / 2));
      setTerm(product.term_days);
    }
  }, [productId, product]);

  const summary = useMemo(() => {
    if (!product) return null;
    return computeLoan(amount, Number(product.interest_rate_pct), term);
  }, [product, amount, term]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    const parsed = applicationSchema.safeParse({
      product_id: product.id,
      requested_amount: amount,
      term_days: term,
      purpose,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (amount < product.min_amount || amount > product.max_amount) {
      return toast.error(`Amount must be between ${formatMoney(product.min_amount, product.currency)} and ${formatMoney(product.max_amount, product.currency)}`);
    }
    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("loan_applications").insert({
      user_id: u.user!.id,
      product_id: product.id,
      requested_amount: amount,
      term_days: term,
      purpose,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Application submitted");
    navigate({ to: "/app/loans" });
  }

  if (isLoading || !products) return <div className="text-muted-foreground">Loading products…</div>;
  if (!products.profile?.country) {
    return (
      <Card className="mx-auto max-w-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Complete your profile first</h2>
        <p className="mt-2 text-sm text-muted-foreground">We need your country and details before showing loan options.</p>
        <Button asChild className="mt-4"><a href="/app/profile">Go to profile</a></Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Apply for a loan</h1>
        <p className="text-sm text-muted-foreground">Pick a product, choose your amount and term.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {products.products.map((p) => (
          <button
            type="button"
            key={p.id}
            onClick={() => setProductId(p.id)}
            className={"rounded-2xl border p-5 text-left transition hover:border-accent " + (productId === p.id ? "border-accent bg-accent/5" : "bg-card")}
          >
            <div className="font-display text-lg font-semibold">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.description}</div>
            <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
              <span className="text-muted-foreground">Range</span>
              <span className="tabular text-right">{formatMoney(p.min_amount, p.currency)} – {formatMoney(p.max_amount, p.currency)}</span>
              <span className="text-muted-foreground">Rate</span><span className="tabular text-right">{Number(p.interest_rate_pct)}%</span>
              <span className="text-muted-foreground">Term</span><span className="tabular text-right">{p.term_days} days</span>
            </div>
          </button>
        ))}
      </div>

      {product && summary && (
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Amount</Label>
                <span className="font-display text-xl font-semibold tabular">{formatMoney(amount, product.currency)}</span>
              </div>
              <Slider min={product.min_amount} max={product.max_amount} step={Math.max(1, Math.round((product.max_amount - product.min_amount) / 100))}
                value={[amount]} onValueChange={([v]) => setAmount(v)} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Term (days)</Label>
                <span className="font-display text-xl font-semibold tabular">{term}</span>
              </div>
              <Input type="number" min={7} max={product.term_days} value={term} onChange={(e) => setTerm(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Purpose</Label>
              <Textarea rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} required minLength={3} placeholder="e.g. School fees, business stock, emergency" />
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <div className="grid grid-cols-2 gap-2 tabular">
                <span className="text-muted-foreground">Principal</span><span className="text-right">{formatMoney(summary.principal, product.currency)}</span>
                <span className="text-muted-foreground">Interest</span><span className="text-right">{formatMoney(summary.interest, product.currency)}</span>
                <span className="text-muted-foreground">Total payable</span><span className="text-right font-semibold">{formatMoney(summary.total, product.currency)}</span>
                <span className="text-muted-foreground">Due date</span><span className="text-right">{summary.dueDate}</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
