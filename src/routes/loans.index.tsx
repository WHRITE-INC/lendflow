import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PRODUCTS } from "@/lib/products";
import { IMG } from "@/lib/images";
import { money } from "@/lib/ui";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/loans/")({
  head: () => ({
    meta: [
      { title: "Loan options — LendFlow Africa" },
      { name: "description", content: "Personal, business, agri, civil servant, salary advance, asset finance and invoice discounting loans from K500 to K1,000,000 at 0% interest." },
      { property: "og:title", content: "Loan options — LendFlow Africa" },
      { property: "og:description", content: "Flexible loan options made for individuals, businesses and farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoansIndex,
});

function LoansIndex() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">Our loans</div>
            <h1 className="display mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Flexible loan options, made for you
            </h1>
            <p className="mt-4 max-w-xl text-lg text-[color:var(--color-muted)]">
              Whatever you are funding — stock, seed, school fees or a new truck — there is a LendFlow
              product for it. Every loan is 0% interest with one transparent commitment.
            </p>
            <Link to="/apply" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold">
              Apply now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={IMG.entrepreneur} alt="Small business owner reviewing her LendFlow loan options"
            className="h-80 w-full rounded-[2rem] object-cover shadow-[0_30px_70px_-30px_rgba(22,48,92,.5)]" />
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map(p => (
            <article key={p.slug} className="card card-lift overflow-hidden">
              <img src={p.image} alt={`${p.name} from LendFlow Africa`} loading="lazy" className="h-44 w-full object-cover" />
              <div className="p-6">
                {p.comingSoon && <span className="mb-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">Coming soon</span>}
                <h2 className="text-lg font-bold">{p.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{p.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="rounded-full bg-[color:var(--color-sky)] px-2.5 py-1 text-[color:var(--color-navy)]">{money(p.min)}–{money(p.max)}</span>
                  <span className="rounded-full bg-[color:var(--color-mint)] px-2.5 py-1 text-[color:var(--color-leaf-dark)]">up to {p.maxTerm} months</span>
                </div>
                <Link to="/loans/$slug" params={{ slug: p.slug }}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-leaf-dark)] hover:gap-2.5">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="card mt-16 grid gap-8 p-8 md:grid-cols-2 lg:p-12">
          <div>
            <h2 className="display text-3xl font-black tracking-tight">Loan requirements</h2>
            <p className="mt-3 text-[color:var(--color-muted)]">
              We keep it simple. One consolidated verification covers your identity for every product.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {["Aged 18 or older with a valid national ID or passport",
              "An active MTN MoMo or Airtel Money wallet in your name",
              "Proof of income — payslip, bank statement or business records",
              "A completed LendFlow identity verification (one tap on your dashboard)"].map(t => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-leaf)]" />
                <span className="text-[color:var(--color-muted)]">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
