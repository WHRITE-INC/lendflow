// Borrower app shell with sidebar.
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Home, FileText, ShieldCheck, User2, LogOut, Wallet, Sun, Moon, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

const NAV = [
  { to: "/app", label: "Dashboard", icon: Home, exact: true },
  { to: "/app/loans", label: "Loans", icon: Wallet },
  { to: "/app/kyc", label: "Verification", icon: ShieldCheck },
  { to: "/app/profile", label: "Profile", icon: User2 },
];

function AppShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState(false);
  const [dark, setDark] = useState(() => typeof window !== "undefined" && document.documentElement.classList.contains("dark"));

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    })();
  }, []);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 font-display text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">A</span>
          Akiba
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" /> {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className="mt-4 flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-sm text-sidebar-foreground/90 hover:bg-sidebar-accent"
            >
              <ShieldQuestion className="size-4" /> Admin portal
            </Link>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex-1 justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent" onClick={toggleTheme}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />} {dark ? "Light" : "Dark"}
            </Button>
            <Button variant="ghost" size="sm" className="text-sidebar-foreground/80 hover:bg-sidebar-accent" onClick={signOut}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Link to="/app" className="flex items-center gap-2 font-display text-base font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-accent text-accent-foreground text-sm">A</span>
            Akiba
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4" /></Button>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </div>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 grid grid-cols-4 border-t bg-card lg:hidden">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={cn("flex flex-col items-center gap-1 py-3 text-xs", active ? "text-accent" : "text-muted-foreground")}>
                <Icon className="size-5" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
