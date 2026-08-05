import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getProduct, PRODUCTS } from "@/lib/products";
import { money } from "@/lib/ui";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/loans/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    const p = loaderData;
    return {
      meta: p ? [
        { title: `${p.name} — LendFlow Africa` },
        { name: "description", content: p.blurb },
        { property: "og:title", content: `${p.name} — LendFlow Africa` },
        { property: "og:description", content: p.blurb },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ] : [],
    };
  },
  errorComponent: () => <Fallback title="Something went wrong" />,
  notFoundComponent: () => <Fallback title="Loan product not found" />,
  component: ProductPage,
});

function ProductPage() {
  const p = Route.useLoaderData();
  const others = PRODUCTS.filter(x => x.slug !== p.slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <Link to="/loans" className="text-sm font-bold text-[color:var(--color-muted)] hover:text-[color:var(--color-navy)]">← All loans</Link>
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="display text-4xl font-black tracking-tight sm:text-5xl">{p.name}</h1>
            <p className="mt-4 text-lg text-[color:var(--color-muted)]">{p.blurb}</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <Fact label="From" value={money(p.min)} />
              <Fact label="Up to" value={money(p.max)} />
              <Fact label="Term" value={`${p.maxTerm} mo`} />
            </div>
            <ul className="mt-7 space-y-3 text-sm">
              {p.bullets.map(b => (
                <li key={b} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-leaf)]" />
                  <span className="text-[color:var(--color-muted)]">{b}</span>
                </li>
              ))}
            </ul>
            <Link to="/apply" className="btn-primary mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold">
              Apply for this loan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={p.image} alt={`${p.name} borrower`} className="h-96 w-full rounded-[2rem] object-cover shadow-[0_30px_70px_-30px_rgba(22,48,92,.5)]" />
        </div>

        <h2 className="display mt-20 text-2xl font-black tracking-tight">Other loan options</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {others.map(o => (
            <Link key={o.slug} to="/loans/$slug" params={{ slug: o.slug }} className="card card-lift overflow-hidden">
              <img src={o.image} alt={o.name} loading="lazy" className="h-36 w-full object-cover" />
              <div className="p-5">
                <div className="font-bold">{o.name}</div>
                <div className="mt-1 text-sm text-[color:var(--color-muted)]">{money(o.min)} – {money(o.max)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-mint)] px-3 py-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{label}</div>
      <div className="mt-1 text-lg font-black tabular-nums">{value}</div>
    </div>
  );
}

function Fallback({ title }: { title: string }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="display text-3xl font-black">{title}</h1>
        <Link to="/loans" className="btn-primary mt-6 inline-block rounded-full px-6 py-3 text-sm font-bold">Browse all loans</Link>
      </div>
      <SiteFooter />
    </div>
  );
}
