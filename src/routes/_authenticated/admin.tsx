import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Users, FileCheck2, Layers } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ location }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw redirect({ to: "/dashboard" });
    if (location.pathname === "/admin") throw redirect({ to: "/admin/kyc" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-navy text-navy-foreground border-b border-black/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/admin/kyc" className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald" />
            <span className="font-semibold tracking-tight">LendFlow Admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/admin/kyc" icon={FileCheck2} label="KYC" />
            <span className="text-navy-foreground/30 px-2 text-xs">Tiers · Loans · Users (coming soon)</span>
          </nav>
          <Link to="/dashboard" className="text-xs text-navy-foreground/60 hover:text-navy-foreground">Exit admin</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-md text-navy-foreground/70 hover:text-navy-foreground hover:bg-white/5 inline-flex items-center gap-1.5"
      activeProps={{ className: "bg-white/10 text-navy-foreground" }}
    >
      <Icon className="size-4" /> {label}
    </Link>
  );
}

// satisfy lint for unused imports if tree-shaken
void Users; void Layers;