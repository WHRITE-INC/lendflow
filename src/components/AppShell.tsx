import { Link, useNavigate } from "@tanstack/react-router";
import { Brand } from "@/components/Brand";
import { signOut, type Account } from "@/lib/demo-auth";
import { LogOut } from "lucide-react";

export function AppShell({ user, subtitle, children }:
  { user: Account; subtitle: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-white/85 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3.5">
          <Link to="/" className="min-w-0"><Brand /></Link>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold leading-tight">{user.name}</div>
              <div className="text-xs text-[color:var(--color-muted)]">{subtitle}</div>
            </div>
            <button
              onClick={() => { signOut(); navigate({ to: "/auth" }); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-line)] px-4 py-2 text-xs font-bold text-[color:var(--color-navy)] hover:bg-[color:var(--color-sky)]">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

export function KpiCard({ label, value, hint, tone = "mint" }:
  { label: string; value: string; hint?: string; tone?: "mint" | "sky" | "sun" }) {
  const bg = tone === "mint" ? "bg-[color:var(--color-mint)]" : tone === "sky" ? "bg-[color:var(--color-sky)]" : "bg-amber-50";
  return (
    <div className={`card p-5 ${bg}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{label}</div>
      <div className="mt-1.5 text-3xl font-black tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-[color:var(--color-muted)]">{hint}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-[color:var(--color-mint)] text-[color:var(--color-leaf-dark)]",
    verified: "bg-[color:var(--color-mint)] text-[color:var(--color-leaf-dark)]",
    pending: "bg-amber-50 text-amber-700",
    unverified: "bg-[color:var(--color-sky)] text-[color:var(--color-navy)]",
    rejected: "bg-red-50 text-red-600",
    under_review: "bg-[color:var(--color-sky)] text-[color:var(--color-navy)]",
    awaiting_commitment: "bg-amber-50 text-amber-700",
    declined: "bg-red-50 text-red-600",
  };
  const label = status.replace(/_/g, " ");
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${map[status] ?? "bg-[color:var(--color-sky)]"}`}>
      {label}
    </span>
  );
}
