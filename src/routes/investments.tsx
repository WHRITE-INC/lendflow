import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { IMG } from "@/lib/images";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/investments")({
  head: () => ({
    meta: [
      { title: "Investments — LendFlow Africa" },
      { name: "description", content: "Lend to creditworthy African borrowers through LendFlow Africa and earn rewarding, transparent returns on a diversified portfolio." },
      { property: "og:title", content: "Investments — LendFlow Africa" },
      { property: "og:description", content: "Earn rewarding returns by lending to creditworthy borrowers." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: IMG.invest },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: IMG.invest },
    ],
  }),
  component: Investments,
});

function Investments() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">Investments</div>
            <h1 className="display mt-3 text-4xl font-black tracking-tight sm:text-5xl">Earn by lending to others</h1>
            <p className="mt-4 max-w-xl text-lg text-[color:var(--color-muted)]">
              Put your money to work behind vetted African entrepreneurs and farmers. Build a
              diversified portfolio, track performance live, and withdraw to your wallet.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Target returns of 12–18% per year", "Every borrower fully KYC verified",
                "Diversify across hundreds of loans", "Withdraw to mobile money or bank"].map(t => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-leaf)]" />
                  <span className="text-[color:var(--color-muted)]">{t}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold">
              Join the waitlist <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={IMG.invest} alt="Investor reviewing a LendFlow Africa portfolio dashboard"
            className="h-96 w-full rounded-[2rem] object-cover shadow-[0_30px_70px_-30px_rgba(22,48,92,.5)]" />
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[["1", "Fund your account", "Deposit from mobile money or bank transfer in minutes."],
            ["2", "Choose your risk band", "Pick conservative, balanced or growth portfolios."],
            ["3", "Earn monthly", "Interest is credited monthly as borrowers repay."]].map(([n, t, b]) => (
            <div key={t} className="card p-8">
              <div className="display grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--color-navy)] text-lg font-black text-white">{n}</div>
              <h2 className="mt-5 text-lg font-bold">{t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{b}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
