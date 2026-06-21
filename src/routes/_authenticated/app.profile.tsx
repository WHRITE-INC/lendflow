import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { profileSchema } from "@/lib/schemas";
import { COUNTRY_DIAL, COUNTRY_NAMES } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Akiba" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("user_id", u.user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    full_name: "", country: "KE" as "KE"|"UG"|"TZ"|"RW"|"GH"|"NG",
    phone_e164: "", national_id: "", date_of_birth: "", address: "", employment: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name ?? "",
      country: (profile.country ?? "KE") as typeof form.country,
      phone_e164: profile.phone_e164 ?? "",
      national_id: profile.national_id ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      address: profile.address ?? "",
      employment: profile.employment ?? "",
    });
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update(parsed.data).eq("user_id", u.user!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["my-profile"] });
    qc.invalidateQueries({ queryKey: ["borrower-dashboard"] });
  }

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Your profile</h1>
        <p className="text-sm text-muted-foreground">Complete your details to qualify for higher loan limits.</p>
      </header>

      <Card className="p-6">
        <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></Field>
          <Field label="Country">
            <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v as typeof form.country })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(COUNTRY_NAMES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v} ({COUNTRY_DIAL[k]})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone (E.164)" hint={`Example: ${COUNTRY_DIAL[form.country]}7XXXXXXXX`}>
            <Input value={form.phone_e164} onChange={(e) => setForm({ ...form, phone_e164: e.target.value })} required placeholder={`${COUNTRY_DIAL[form.country]}…`} />
          </Field>
          <Field label="National ID"><Input value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} required /></Field>
          <Field label="Date of birth"><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
          <Field label="Employment"><Input value={form.employment} onChange={(e) => setForm({ ...form, employment: e.target.value })} placeholder="Employed / Self-employed / Other" /></Field>
          <div className="sm:col-span-2">
            <Field label="Address"><Textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
