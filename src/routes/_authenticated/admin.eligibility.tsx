import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getTierEligibility, type TierEligibility } from "@/lib/eligibility.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { EligibilityList } from "./eligibility";

export const Route = createFileRoute("/_authenticated/admin/eligibility")({
  head: () => ({ meta: [{ title: "Eligibility preview — Admin" }] }),
  component: AdminEligibility,
});

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  kyc_status: string;
  activation_status: string;
};

function AdminEligibility() {
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [rows, setRows] = useState<TierEligibility[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const evaluate = useServerFn(getTierEligibility);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select("id,first_name,last_name,phone,kyc_status,activation_status")
      .order("updated_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setErr(error.message);
        else setProfiles(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selected) {
      setRows(null);
      return;
    }
    setRows(null);
    setErr(null);
    evaluate({ data: { userId: selected.id } })
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, [selected, evaluate]);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      `${p.first_name ?? ""} ${p.last_name ?? ""}`.toLowerCase().includes(q) ||
      (p.phone ?? "").toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          <Sparkles className="size-6 text-emerald" /> Eligibility preview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a borrower to preview which loan tiers they qualify for under current tier rules.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label className="text-xs">Search borrowers</Label>
            <Input
              placeholder="Name, phone, or id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-[28rem] overflow-y-auto -mx-2">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-6 text-xs text-muted-foreground text-center">No borrowers.</p>
              ) : (
                filtered.map((p) => {
                  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unnamed";
                  const active = selected?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        active ? "bg-emerald/10 text-foreground" : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="font-medium text-foreground">{name}</div>
                      <div className="text-xs">
                        KYC: {p.kyc_status} · {p.activation_status}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          {!selected ? (
            <Card>
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Select a borrower to view their eligibility.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="py-4 text-sm">
                  <span className="font-medium text-foreground">
                    {`${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim() || "Unnamed"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    · KYC {selected.kyc_status} · Account {selected.activation_status}
                  </span>
                </CardContent>
              </Card>
              <EligibilityList rows={rows} err={err} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}