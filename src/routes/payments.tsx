import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { IMG } from "@/lib/images";
import { ArrowRight, CreditCard, Send, Smartphone, Zap } from "lucide-react";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — LendFlow Africa" },
      { name: "description", content: "Pay bills, buy airtime and data, send money for free and manage every transaction from your LendFlow Africa wallet." },
      { property: "og:title", content: "Payments — LendFlow Africa" },
      { property: "og:description", content: "Bills, airtime, transfers and repayments in one wallet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Payments,
});

function Payments() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">Payments</div>
            <h1 className="display mt-3 text-4xl font-black tracking-tight sm:text-5xl">Money when you need it</h1>
            <p className="mt-4 max-w-xl text-lg text-[color:var(--color-muted)]">
              Settle bills, top up airtime and data, send money to family and repay your loan — all from
              your MTN MoMo or Airtel Money wallet, with zero transfer fees between LendFlow accounts.
            </p>
            <Link to="/apply" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={IMG.mobileMoney} alt="Customer completing a mobile money payment on her phone"
            className="h-80 w-full rounded-[2rem] object-cover shadow-[0_30px_70px_-30px_rgba(22,48,92,.5)]" />
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { i: <Zap />, t: "Pay bills instantly", b: "Electricity, water, pay TV and school fees settled in seconds." },
            { i: <Smartphone />, t: "Airtime & data", b: "Top up any network for yourself or someone else." },
            { i: <Send />, t: "Send money free", b: "Transfer to friends and family on LendFlow at no cost." },
            { i: <CreditCard />, t: "Deposits & withdrawals", b: "Move money between your wallet and your bank account." },
          ].map(c => (
            <div key={c.t} className="card card-lift p-7">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--color-navy)] text-white [&_svg]:h-5 [&_svg]:w-5">{c.i}</div>
              <h2 className="mt-5 text-lg font-bold">{c.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{c.b}</p>
            </div>
          ))}
        </div>

        <div className="card mt-16 grid items-center gap-10 overflow-hidden md:grid-cols-2">
          <img src={IMG.phoneUser} alt="Man repaying his LendFlow loan by mobile money" loading="lazy" className="h-full min-h-72 w-full object-cover" />
          <div className="p-8 lg:p-12">
            <h2 className="display text-3xl font-black tracking-tight">Repay your loan your way</h2>
            <p className="mt-3 text-[color:var(--color-muted)]">
              Weekly, fortnightly or monthly — choose the rhythm that matches your cash flow. Every
              repayment is receipted instantly and reflected on your dashboard in real time.
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
