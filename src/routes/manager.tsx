import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { KpiCard, StatusPill } from "@/components/AppShell";
import {
  allUsers, currentUser, listApplications, money, reviewKyc, updateApplication, useRealtime,
  type Account, type Application,
} from "@/lib/demo-auth";

export const Route = createFileRoute("/manager")({
  head: () => ({
    meta: [
      { title: "Manager console — LendFlow Africa" },
      { name: "description", content: "Approve client identity verifications and reconcile mobile money commitments on LendFlow Africa loan applications." },
      { property: "og:title", content: "Manager console — LendFlow Africa" },
      { property: "og:description", content: "Verification queue and loan decisions in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  component: Manager,
});

function Manager() {
  const navigate = useNavigate();
  const user = useRealtime<Account | null>(() => currentUser());
  const users = useRealtime<Account[]>(() => allUsers());
  const apps = useRealtime<Application[]>(() => listApplications());
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/auth", search: { mode: "signin" } });
    else if (user.role !== "manager") navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  if (!user || user.role !== "manager") return null;

  const clients = users.filter(u => u.role === "client");
  const pending = clients.filter(u => u.kyc === "pending");
  const review = apps.filter(a => a.status === "under_review");
  const collected = apps.reduce((s, a) => s + a.commitment, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <h1 className="display text-3xl font-black tracking-tight">Manager console</h1>
        <p className="mt-1 text-[color:var(--color-muted)]">
          Verifications and decisions sync to client dashboards in real time.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Clients" value={String(clients.length)} tone="sky" />
          <KpiCard label="Verifications pending" value={String(pending.length)} tone="sun" />
          <KpiCard label="Loans in review" value={String(review.length)} />
          <KpiCard label="Commitments collected" value={money(collected)} />
        </div>

        <section className="card mt-8 overflow-hidden">
          <div className="border-b border-[color:var(--color-line)] px-6 py-4">
            <h2 className="text-lg font-bold">Identity verification queue</h2>
          </div>
          {clients.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[color:var(--color-muted)]">No client accounts yet.</p>
          ) : (
            <div className="divide-y divide-[color:var(--color-line)]">
              {clients.map(c => (
                <div key={c.email} className="grid gap-3 px-6 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs text-[color:var(--color-muted)]">{c.email} · {c.phone ?? "no phone"} · KYC: {c.kyc}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => reviewKyc(c.email, "verified")} disabled={c.kyc === "verified"}
                      className="btn-primary rounded-full px-4 py-2 text-xs font-bold disabled:opacity-40">Approve</button>
                    <button onClick={() => reviewKyc(c.email, "rejected", "Details did not match our records.")} disabled={c.kyc === "rejected"}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card mt-8 overflow-hidden">
          <div className="border-b border-[color:var(--color-line)] px-6 py-4">
            <h2 className="text-lg font-bold">Loan applications</h2>
          </div>
          <div className="divide-y divide-[color:var(--color-line)]">
            {apps.map(a => (
              <div key={a.id} className="grid gap-3 px-6 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="font-bold">{a.id} · {a.name} · {money(a.amount)}</div>
                  <div className="text-xs text-[color:var(--color-muted)]">
                    {a.product} · {a.term} months · commitment {money(a.commitment)} ({a.commitmentPct}%) via {a.provider} {a.msisdn}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={a.status} />
                  <button onClick={() => updateApplication(a.id, { status: "approved" })} disabled={a.status === "approved"}
                    className="btn-primary rounded-full px-4 py-2 text-xs font-bold disabled:opacity-40">Approve</button>
                  <button onClick={() => updateApplication(a.id, { status: "declined" })} disabled={a.status === "declined"}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
