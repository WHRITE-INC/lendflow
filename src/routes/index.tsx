import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PRODUCTS } from "@/lib/products";
import { IMG } from "@/lib/images";
import { money } from "@/lib/ui";
import { cn } from "@/lib/utils";
import {
  ArrowRight, ShieldCheck, Zap, Wallet, TrendingUp, Star, CheckCircle2, ChevronDown,
  Smartphone, PiggyBank, CreditCard, Send,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LendFlow Africa | Fast, Affordable Loans for Every African" },
      { name: "description", content: "Personal, business and agri loans from K500 to K1,000,000 at 0% interest. Apply online, verify once, and get funded to your MTN MoMo or Airtel Money wallet." },
      { property: "og:title", content: "LendFlow Africa | Fast, Affordable Loans" },
      { property: "og:description", content: "0% interest loans funded straight to your mobile money wallet across Zambia, Ghana and Kenya." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: IMG.heroWoman },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: IMG.heroWoman },
    ],
  }),
  component: Home,
});

function useCounter(target: number, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function Home() {
  const [amount, setAmount] = useState(15000);
  const [term, setTerm] = useState(12);
  const [pct, setPct] = useState(12);
  const commitment = Math.round((amount * pct) / 100);
  const disbursed = useCounter(50);
  const clients = useCounter(38);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div className="rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-leaf)]/30 bg-[color:var(--color-mint)] px-3.5 py-1.5 text-xs font-bold text-[color:var(--color-leaf-dark)]">
              <Zap className="h-3.5 w-3.5" /> Approved in 30 seconds · 0% interest
            </div>
            <h1 className="display mt-6 text-[2.75rem] font-black leading-[1.02] tracking-tight sm:text-6xl">
              Fast, affordable loans for <span className="gradient-text">every African</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--color-muted)]">
              Borrow from K500 to K1,000,000 for yourself, your business or your farm. Verify your
              identity once, pay a 10–15% commitment, and receive your money on MTN MoMo or Airtel Money.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/apply" className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold">
                Apply for a loan <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/loans" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white px-7 py-3.5 text-sm font-bold text-[color:var(--color-navy)] transition hover:bg-[color:var(--color-sky)]">
                Explore loan options
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              <Metric label="Disbursed" value={`K${disbursed}M+`} icon={<TrendingUp className="h-4 w-4" />} />
              <Metric label="Clients served" value={`${clients}k+`} icon={<Star className="h-4 w-4" />} />
              <Metric label="Interest" value="0%" icon={<ShieldCheck className="h-4 w-4" />} />
            </dl>
          </div>

          <div className="rise relative">
            <img src={IMG.heroWoman} alt="Zambian market entrepreneur using her mobile phone to receive a LendFlow loan"
              className="h-[26rem] w-full rounded-[2rem] object-cover shadow-[0_30px_70px_-30px_rgba(22,48,92,.55)] lg:h-[32rem]" />
            <div className="card absolute -bottom-8 left-4 w-[19rem] p-5 sm:left-8">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--color-mint)] text-[color:var(--color-leaf-dark)]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-[color:var(--color-muted)]">Disbursed to Airtel Money</div>
                  <div className="text-lg font-black tabular-nums">K15,000.00</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-line)]">
                <div className="h-full w-[86%] rounded-full bg-[color:var(--color-leaf)]" />
              </div>
              <div className="mt-2 text-[11px] text-[color:var(--color-muted)]">Repayment 86% complete · 0% interest</div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Pillar icon={<Wallet />} title="Borrow" body="Access instant and flexible loans made for you and your business." to="/loans" cta="Apply now" />
          <Pillar icon={<Send />} title="Pay" body="Pay bills, buy airtime, transfer money and manage every transaction." to="/payments" cta="Get started" />
          <Pillar icon={<PiggyBank />} title="Invest" body="Lend to creditworthy borrowers and enjoy rewarding, steady returns." to="/investments" cta="Learn more" />
        </div>
      </section>

      {/* STEPS */}
      <section className="border-y border-[color:var(--color-line)] bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Header eyebrow="How it works" title="Easy steps to get your loan" center />
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {[
              { t: "Easy application", b: "Apply right here on the website — no branch visit, no paperwork." },
              { t: "One-tap verification", b: "A single Verify button confirms your identity. Approval syncs to your dashboard in real time." },
              { t: "Flexible options", b: "Choose your loan type, amount and repayment plan that fits your cash flow." },
              { t: "Smooth disbursement", b: "Once approved, funds go straight to your mobile money wallet." },
            ].map((s, i) => (
              <div key={s.t} className="relative">
                <div className="display grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--color-navy)] text-lg font-black text-white">{i + 1}</div>
                <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Header eyebrow="Our loans" title="Flexible loan options, made for you" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.slice(0, 4).map(p => (
            <article key={p.slug} className="card card-lift overflow-hidden">
              <img src={p.image} alt={`${p.name} — LendFlow Africa`} loading="lazy" className="h-40 w-full object-cover" />
              <div className="p-6">
                {p.comingSoon && <span className="mb-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">Coming soon</span>}
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{p.blurb}</p>
                <Link to="/loans/$slug" params={{ slug: p.slug }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-leaf-dark)] hover:gap-2.5">
                  Apply now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/loans" className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--color-navy)] hover:gap-3">
            View all loans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="border-y border-[color:var(--color-line)] bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <Header eyebrow="Loan calculator" title="Know exactly what you'll repay" />
            <p className="mt-4 max-w-lg text-[color:var(--color-muted)]">
              LendFlow charges no interest at all. Instead you pay a one-time commitment of 10–15% of the
              amount you request — then you repay only the principal.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["0% interest on every tier", "Commitment refunded in full if declined",
                "No penalty for early settlement", "Repay by MTN MoMo or Airtel Money"].map(t => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-leaf)]" />
                  <span className="text-[color:var(--color-muted)]">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-7">
            <SliderRow label="Loan amount" display={money(amount)} min={500} max={250000} step={500} value={amount} onChange={setAmount} />
            <SliderRow label="Repayment term" display={`${term} months`} min={1} max={36} step={1} value={term} onChange={setTerm} className="mt-7" />
            <SliderRow label="Commitment (10–15%)" display={`${pct}%`} min={10} max={15} step={1} value={pct} onChange={setPct} className="mt-7" />
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <Box label="Commitment" value={money(commitment)} highlight />
              <Box label="Monthly" value={money(amount / term)} />
              <Box label="Total repaid" value={money(amount)} />
            </div>
            <Link to="/apply" className="btn-primary mt-7 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold">
              Get this loan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* APP / EVERYTHING */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Header eyebrow="One platform" title="Everything you need, in one place" center />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <ImageFeature img={IMG.phoneUser} alt="Young man checking his LendFlow loan on a smartphone"
            title="Get cash fast" body="Need money in a pinch? Sign up, verify once and get a decision in minutes." />
          <ImageFeature img={IMG.mobileMoney} alt="Customer paying a bill with mobile money"
            title="Pay bills your way" body="Settle bills instantly or choose to buy now and pay later with Bill Credit." />
          <ImageFeature img={IMG.invest} alt="Investor reviewing returns on a laptop"
            title="Earn by lending" body="Build a portfolio by lending to creditworthy borrowers and earn rewarding returns." />
        </div>
      </section>

      {/* IMPACT */}
      <section className="border-y border-[color:var(--color-line)] bg-[color:var(--color-navy)] py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <img src={IMG.solarFarm} alt="Solar-powered irrigation on a Zambian smallholder farm"
            loading="lazy" className="h-80 w-full rounded-[2rem] object-cover" />
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-lime)]">Our impact</div>
            <h2 className="display mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Growing prosperity in rural Africa
            </h2>
            <p className="mt-4 text-white/75">
              Over 70% of LendFlow borrowers are women running micro and small businesses. Our agri
              financing has funded solar-powered irrigation, certified seed and mechanisation for
              thousands of smallholder farms.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[["70%", "Women borrowers"], ["38k+", "Clients served"], ["3", "Countries live"]].map(([v, l]) => (
                <div key={l}>
                  <div className="display text-3xl font-black text-[color:var(--color-lime)]">{v}</div>
                  <div className="mt-1 text-xs text-white/70">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Header eyebrow="Client stories" title="Trusted by entrepreneurs" center />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { n: "Mary Phiri", r: "Farmer, Chipata", img: IMG.farming, q: "My agri loan paid for seed and fertiliser. The commitment was clear up front and there was no interest at all." },
            { n: "Joseph Banda", r: "Shop owner, Lusaka", img: IMG.shopOwner, q: "I verified my ID with one tap and my limit unlocked the same afternoon. Money hit my MoMo wallet that evening." },
            { n: "Grace Zulu", r: "Tailor, Kitwe", img: IMG.market, q: "LendFlow is the first lender that told me exactly what I would repay before I signed anything." },
          ].map(t => (
            <figure key={t.n} className="card card-lift p-7">
              <div className="flex gap-0.5 text-[color:var(--color-sun)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-[color:var(--color-muted)]">&ldquo;{t.q}&rdquo;</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <img src={t.img} alt={t.n} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-bold">{t.n}</div>
                  <div className="text-xs text-[color:var(--color-muted)]">{t.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-20 lg:px-8">
        <Header eyebrow="Support" title="Got questions? We can help" center />
        <div className="mt-10 space-y-3">
          {FAQS.map(f => (
            <details key={f.q} className="acc card group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-bold">
                {f.q}
                <ChevronDown className="chev h-4 w-4 shrink-0 text-[color:var(--color-muted)] transition-transform" />
              </summary>
              <div className="acc-content">
                <p className="pt-3 text-sm leading-relaxed text-[color:var(--color-muted)]">{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="card overflow-hidden bg-[color:var(--color-mint)] p-10 text-center lg:p-16">
          <h2 className="display text-3xl font-black tracking-tight sm:text-4xl">Money when you need it</h2>
          <p className="mx-auto mt-3 max-w-xl text-[color:var(--color-muted)]">
            Join thousands of Africans who fund their goals with LendFlow — 0% interest, one honest commitment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/apply" className="btn-primary rounded-full px-8 py-3.5 text-sm font-bold">Apply for a loan</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="btn-navy rounded-full px-8 py-3.5 text-sm font-bold">Create an account</Link>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="overflow-hidden py-10">
        <div className="marquee-track gap-14 px-6">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <span key={i} className="display whitespace-nowrap text-lg font-black tracking-widest text-[color:var(--color-muted)]/45">{p}</span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ---------- primitives ---------- */
function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{icon}{label}</dt>
      <dd className="display mt-1 text-2xl font-black tracking-tight">{value}</dd>
    </div>
  );
}

function Pillar({ icon, title, body, to, cta }: { icon: React.ReactNode; title: string; body: string; to: string; cta: string }) {
  return (
    <div className="card card-lift p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--color-navy)] text-white [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <h3 className="display mt-6 text-2xl font-black tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{body}</p>
      <Link to={to} className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[color:var(--color-leaf-dark)] hover:gap-2.5">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ImageFeature({ img, alt, title, body }: { img: string; alt: string; title: string; body: string }) {
  return (
    <article className="card card-lift overflow-hidden">
      <img src={img} alt={alt} loading="lazy" className="h-52 w-full object-cover" />
      <div className="p-7">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{body}</p>
      </div>
    </article>
  );
}

export function Header({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={cn(center && "mx-auto max-w-2xl text-center")}>
      <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-leaf-dark)]">{eyebrow}</div>
      <h2 className="display mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function SliderRow({ label, display, min, max, step, value, onChange, className }: {
  label: string; display: string; min: number; max: number; step: number;
  value: number; onChange: (n: number) => void; className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-[color:var(--color-muted)]">{label}</label>
        <span className="text-lg font-bold tabular-nums">{display}</span>
      </div>
      <input type="range" aria-label={label} className="slider mt-3" min={min} max={max} step={step}
        value={value} onChange={e => onChange(Number(e.target.value))} style={{ ["--val" as string]: `${pct}%` }} />
    </div>
  );
}

function Box({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-sky)] px-3 py-4",
      highlight && "border-[color:var(--color-leaf)]/40 bg-[color:var(--color-mint)]")}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{label}</div>
      <div className="mt-1 text-lg font-black tabular-nums">{value}</div>
    </div>
  );
}

const FAQS = [
  { q: "What is the longest repayment period?", a: "36 months on personal, business, civil servant and asset finance loans. Salary advances run to 3 months and invoice discounting to 6 months." },
  { q: "Tell me about your services", a: "LendFlow Africa is a digital lender offering personal, business, agri, civil servant, salary advance, asset finance and invoice discounting products, plus payments and an investment marketplace." },
  { q: "How do I open an account?", a: "Register with your email and phone number, tap Verify on your dashboard to confirm your identity, and start applying. Verification approval reaches your dashboard in real time." },
  { q: "Do you really charge 0% interest?", a: "Yes. There is no interest. You pay a one-time commitment of 10–15% of the amount you request before disbursement, and then repay only the principal." },
  { q: "Can I repay my loan early?", a: "Yes — settle early at any time with no penalties or extra charges." },
];

const PARTNERS = ["MTN MOMO", "AIRTEL MONEY", "ZANACO", "FLUTTERWAVE", "STANBIC", "ABSA", "BANK OF ZAMBIA"];
