// Admin shell: gated by has_role check, with sidebar.
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Users, FileCheck2, Boxes, Receipt, Banknote, TrendingUp, ScrollText, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    const allowed = roles?.some((r) => r.role === "admin" || r.role === "reviewer");
    if (!allowed) throw redirect({ to: "/app" });
  },
  component: AdminShell,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/applications", label: "Applications", icon: FileCheck2 },
  { to: "/admin/loans", label: "Loans", icon: Banknote },
  { to: "/admin/collections", label: "Collections", icon: Receipt },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/kyc", label: "KYC queue", icon: FileCheck2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText },
];

function AdminShell() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">A</span>
            Admin
          </div>
          <Link to="/app" className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"><ArrowLeft className="inline size-3" /> App</Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}>
                <Icon className="size-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8 sm:py-10"><Outlet /></main>
    </div>
  );
}
