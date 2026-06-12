import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getTierEligibility, type TierEligibility } from "@/lib/eligibility.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/eligibility")({
  head: () => ({ meta: [{ title: "Loan eligibility" }] }),
  component: EligibilityPage,
});

function EligibilityPage() {
  const fetchEligibility = useServerFn(getTierEligibility);
  const [rows, setRows] = useState<TierEligibility[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchEligibility({ data: {} })
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, [fetchEligibility]);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <Sparkles className="size-6 text-emerald" /> Your loan eligibility
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live evaluation against current tier rules and your outstanding loans.
          </p>
        </div>
        <EligibilityList rows={rows} err={err} />
      </main>
    </div>
  );
}

export function EligibilityList({
  rows,
  err,
}: {
  rows: TierEligibility[] | null;
  err: string | null;
}) {
  if (err) return <Card><CardContent className="py-10 text-sm text-destructive">{err}</CardContent></Card>;
  if (!rows)
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  if (rows.length === 0)
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground text-center">
          No active loan tiers configured.
        </CardContent>
      </Card>
    );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((r) => (
        <Card key={r.tier_id} className={r.eligible ? "border-emerald/40" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">{r.tier_name}</CardTitle>
              <Badge
                className={
                  r.eligible
                    ? "bg-emerald text-emerald-foreground"
                    : "bg-muted text-muted-foreground"
                }
              >
                {r.eligible ? (
                  <><CheckCircle2 className="size-3.5 mr-1" /> Eligible</>
                ) : (
                  <><XCircle className="size-3.5 mr-1" /> Not eligible</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Active loans</div>
                <div className="font-medium">{r.active_loan_count}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Outstanding</div>
                <div className="font-medium">K {r.outstanding_principal.toLocaleString()}</div>
              </div>
            </div>
            {r.reasons.length > 0 && (
              <ul className="space-y-1 border-t border-hairline pt-3 text-xs text-muted-foreground">
                {r.reasons.map((reason, i) => (
                  <li key={i} className="flex gap-2">
                    <XCircle className="size-3.5 shrink-0 text-destructive" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}