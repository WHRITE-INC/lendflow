import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { cn } from "@/lib/utils";
import { PRODUCTS } from "@/lib/products";
import { currentUser, signOut, useRealtime, type Account } from "@/lib/demo-auth";
import { ChevronDown, LogOut, Menu, X, LayoutDashboard } from "lucide-react";

const NAV = [
  { to: "/loans", label: "Loans" },
  { to: "/payments", label: "Payments" },
  { to: "/investments", label: "Investments" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const liveUser = useRealtime<Account | null>(() => currentUser());
  const [mounted, setMounted] = useState(false);
  const user = mounted ? liveUser : null;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = () => { signOut(); setMenu(false); navigate({ to: "/" }); };

  return (
    <header className={cn("sticky top-0 z-40 border-b transition",
      scrolled ? "border-[color:var(--color-line)] bg-white/90 shadow-sm backdrop-blur-xl" : "border-transparent bg-white/60 backdrop-blur")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Link to="/" aria-label="LendFlow Africa home"><Brand /></Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <Link to="/loans" className="nav-link inline-flex items-center gap-1">
              Loans <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            <div className="invisible absolute left-0 top-full w-[30rem] pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="card grid grid-cols-2 gap-1 p-3">
                {PRODUCTS.slice(0, 8).map(p => (
                  <Link key={p.slug} to="/loans/$slug" params={{ slug: p.slug }}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[color:var(--color-navy)] hover:bg-[color:var(--color-mint)]">
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {NAV.slice(1).map(n => (
            <Link key={n.to} to={n.to} className="nav-link">{n.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative hidden sm:block">
              <button onClick={() => setMenu(m => !m)}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm font-bold text-[color:var(--color-navy)] hover:bg-[color:var(--color-sky)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[color:var(--color-navy)] text-[11px] font-black text-white">
                  {user.name.charAt(0)}
                </span>
                {user.name.split(" ")[0]}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {menu && (
                <div className="card absolute right-0 mt-2 w-56 overflow-hidden p-1.5">
                  <Link to={user.role === "manager" ? "/manager" : "/dashboard"} onClick={() => setMenu(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-[color:var(--color-mint)]">
                    <LayoutDashboard className="h-4 w-4" /> {user.role === "manager" ? "Manager console" : "My dashboard"}
                  </Link>
                  <button onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" search={{ mode: "signin" }}
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-[color:var(--color-navy)] hover:bg-[color:var(--color-sky)] sm:block">
              Sign in
            </Link>
          )}
          <Link to="/apply" className="btn-primary rounded-full px-5 py-2.5 text-sm font-bold">
            Apply for a loan
          </Link>
          <button onClick={() => setOpen(o => !o)} aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--color-line)] lg:hidden">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[color:var(--color-line)] bg-white px-5 py-4 lg:hidden">
          <div className="grid gap-1">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[color:var(--color-mint)]">{n.label}</Link>
            ))}
            {user ? (
              <>
                <Link to={user.role === "manager" ? "/manager" : "/dashboard"} onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[color:var(--color-mint)]">Dashboard</Link>
                <button onClick={() => { setOpen(false); logout(); }}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50">Log out</button>
              </>
            ) : (
              <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[color:var(--color-mint)]">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--color-line)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm text-[color:var(--color-muted)]">
            LendFlow Africa is a digital lender providing fast, affordable and transparent credit
            to individuals and small businesses across Zambia, Ghana and Kenya.
          </p>
        </div>
        <FooterCol title="Products" links={[
          { to: "/loans", label: "Loans" }, { to: "/payments", label: "Payments" },
          { to: "/investments", label: "Investments" }, { to: "/apply", label: "Apply now" },
        ]} />
        <FooterCol title="Company" links={[
          { to: "/about", label: "About us" }, { to: "/about", label: "Careers" },
          { to: "/loans", label: "Loan requirements" },
        ]} />
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">Contact</div>
          <address className="mt-4 space-y-1 text-sm not-italic text-[color:var(--color-muted)]">
            <div>Cairo Road, Suite 4</div>
            <div>Lusaka · Zambia</div>
            <div>hello@lendflowafrica.com</div>
          </address>
        </div>
      </div>
      <div className="border-t border-[color:var(--color-line)] px-5 py-6 text-center text-xs text-[color:var(--color-muted)] lg:px-8">
        Representative example: borrow K10,000 over 12 months at 0% interest with a 12% commitment
        (K1,200) — total repaid K10,000. © {new Date().getFullYear()} LendFlow Africa. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-leaf-dark)]">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
