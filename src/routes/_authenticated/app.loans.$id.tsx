import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutoStatusPill } from "@/components/status-pill";
import { formatDate, formatMoney } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";
import { initiateRepayment, verifyRepayment } from "@/lib/repayments.functions";

export const Route = createFileRoute("/_authenticated/app/loans/$id")({
  head: () => ({ meta: [{ title: "Loan — Akiba" }] }),
  component: LoanDetail,
});

function LoanDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const initiate = useServerFn(initiateRepayment);
  const verify = useServerFn(verifyRepayment);

  const { data, isLoading } = useQuery({
    queryKey: ["loan-detail", id],
    queryFn: async () => {
      const [loan, schedule, txs] = await Promise.all([
        supabase.from("loans").select("*, loan_products(name)").eq("id", id).maybeSingle(),
        supabase.from("repayment_schedules").select("*").eq("loan_id", id).order("installment_no"),
        supabase.from("transactions").select("*").eq("loan_id", id).order("created_at", { ascending: false }),
      ]);
      return { loan: loan.data, schedule: schedule.data ?? [], txs: txs.data ?? [] };
    },
  });

  const [amount, setAmount] = useState<number>(0);
  const [provider, setProvider] = useState<"mtn" | "airtel" | "mpesa">("mpesa");
  const [msisdn, setMsisdn] = useState("");
  const [paying, setPaying] = useState(false);

  const repayMutation = useMutation({
    mutationFn: async () => {
      const initRes = await initiate({ data: { loan_id: id, amount, provider, msisdn } });
      // Poll verify up to ~10s
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const v = await verify({ data: { transaction_id: initRes.transaction_id } });
        if (v.status !== "pending") return v.status;
      }
      return "pending";
    },
    onSuccess: (status) => {
      if (status === "success") toast.success("Payment received");
      else if (status === "failed") toast.error("Payment failed");
      else toast.info("Payment pending — check back shortly");
      qc.invalidateQueries({ queryKey: ["loan-detail", id] });
      qc.invalidateQueries({ queryKey: ["borrower-dashboard"] });
      router.invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Payment failed"),
    onSettled: () => setPaying(false),
  });

  if (isLoading || !data) return <div className="text-muted-foreground">Loading…</div>;
  if (!data.loan) return <div>Loan not found. <Link to="/app/loans" className="text-accent">Back</Link></div>;
  const l = data.loan;
  const product = (l as unknown as { loan_products?: { name: string } }).loan_products;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">{product?.name ?? "Loan"}</h1>
          <p className="text-sm text-muted-foreground">{l.id}</p>
        </div>
        <AutoStatusPill status={l.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Principal" value={formatMoney(l.principal, l.currency)} />
        <Stat label="Interest" value={formatMoney(l.interest, l.currency)} />
        <Stat label="Total payable" value={formatMoney(l.total_payable, l.currency)} />
        <Stat label="Outstanding" value={formatMoney(l.outstanding, l.currency)} tone="accent" />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Timeline</h2>
        <Timeline status={l.status} />
      </Card>

      {l.status === "active" && (
        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Make a payment</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); if (!amount || !msisdn) return toast.error("Fill all fields"); setPaying(true); repayMutation.mutate(); }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <div className="space-y-1.5">
              <Label>Amount ({l.currency})</Label>
              <Input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} max={l.outstanding} min={1} required />
            </div>
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as typeof provider)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="mtn">MTN MoMo</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input value={msisdn} onChange={(e) => setMsisdn(e.target.value)} placeholder="+2547XXXXXXXX" required />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={paying} size="lg">
                {paying ? "Authorizing…" : `Pay ${amount ? formatMoney(amount, l.currency) : ""}`}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">A push notification will appear on your phone to authorize the transfer.</p>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Repayment schedule</h2>
        <ul className="divide-y">
          {data.schedule.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Installment {s.installment_no}</div>
                <div className="text-xs text-muted-foreground">Due {formatDate(s.due_date)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular">{formatMoney(s.amount_paid, l.currency)} / {formatMoney(s.amount_due, l.currency)}</span>
                <AutoStatusPill status={s.status} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Transactions</h2>
        {data.txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="divide-y">
            {data.txs.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium capitalize">{t.direction} · {t.provider}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(t.created_at)} · {t.provider_ref ?? "—"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular">{formatMoney(t.amount, t.currency)}</span>
                  <AutoStatusPill status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "accent" }) {
  return (
    <div className={"rounded-2xl border p-5 " + (tone === "accent" ? "border-accent/30 bg-accent/5" : "bg-card")}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold tabular">{value}</div>
    </div>
  );
}

const STAGES = ["pending_disbursement", "active", "completed"];
function Timeline({ status }: { status: string }) {
  const idx = STAGES.indexOf(status);
  const failed = status === "defaulted" || status === "written_off";
  return (
    <ol className="flex items-center">
      {STAGES.map((s, i) => {
        const reached = !failed && i <= (idx < 0 ? 0 : idx);
        return (
          <li key={s} className="flex flex-1 items-center">
            <div className={"grid size-8 place-items-center rounded-full border text-xs " + (reached ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground")}>
              {i + 1}
            </div>
            <span className="ml-2 mr-3 hidden text-sm capitalize sm:inline">{s.replace(/_/g, " ")}</span>
            {i < STAGES.length - 1 && <div className={"h-px flex-1 " + (reached ? "bg-accent" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
