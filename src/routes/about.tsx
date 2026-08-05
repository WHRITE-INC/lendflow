import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { IMG } from "@/lib/images";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — LendFlow Africa" },
      { name: "description", content: "LendFlow Africa is a venture-backed digital lender building the next generation of financial services for Africa, serving Zambia, Ghana and Kenya." },
      { property: "og:title", content: "About us — LendFlow Africa" },
      { property: "og:description", content: "Building the next generation of financial services for Africa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">About us</div>
            <h1 className="display mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Building the next generation of financial services for Africa
            </h1>
            <p className="mt-4 text-lg text-[color:var(--color-muted)]">
              LendFlow Africa is a venture-backed digital lender making credit simple, fast and fair.
              We serve individuals, small businesses and farmers across Zambia, Ghana and Kenya from a
              single mobile-first platform.
            </p>
            <Link to="/apply" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold">
              Apply for a loan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={IMG.team} alt="The LendFlow Africa team at work in Lusaka"
            className="h-80 w-full rounded-[2rem] object-cover shadow-[0_30px_70px_-30px_rgba(22,48,92,.5)]" />
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[["Our mission", "Give every African household and small business access to fair, transparent credit — with no hidden interest."],
            ["Our approach", "One consolidated identity verification, instant limits and mobile money disbursement, so nobody has to visit a branch."],
            ["Our promise", "0% interest, one honest commitment, and a full refund if we cannot fund you."]].map(([t, b]) => (
            <div key={t} className="card p-8">
              <h2 className="display text-2xl font-black tracking-tight">{t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-muted)]">{b}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[IMG.handshake, IMG.meeting, IMG.market].map((src, i) => (
            <img key={i} src={src} alt="LendFlow Africa clients and team" loading="lazy"
              className="h-56 w-full rounded-3xl object-cover" />
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
