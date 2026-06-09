import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Zap, Banknote, FileSignature, Smartphone, Lock, Wallet, BadgeCheck, MessagesSquare, Mail, Phone, ArrowRight } from "lucide-react";
import testimonialImg from "@/assets/testimonial.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LendFlow Zambia — Fast Mobile Money Loans" },
      { name: "description", content: "Register, verify your identity, activate your account, and access affordable digital loans direct to your mobile money wallet." },
      { property: "og:title", content: "LendFlow Zambia — Fast Mobile Money Loans" },
      { property: "og:description", content: "Register, verify your identity, activate your account, and access affordable digital loans direct to your mobile money wallet." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="size-6 bg-navy rounded-sm flex items-center justify-center">
        <div className="size-2 bg-emerald rounded-full" />
      </div>
      <span className="font-semibold text-navy tracking-tight">LendFlow</span>
    </Link>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-navy transition-colors">
            Login
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="bg-emerald text-emerald-foreground text-sm font-medium py-2 px-4 rounded-md flex items-center gap-2 ring-1 ring-emerald hover:bg-emerald/90 transition-colors"
          >
            Apply Now
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

const steps = [
  { n: "01", title: "Create Account", desc: "Register with your NRC, phone number and email in under two minutes." },
  { n: "02", title: "Verify Identity", desc: "Upload your NRC and a selfie for secure KYC verification." },
  { n: "03", title: "Activate Membership", desc: "Pay a one-time activation fee to unlock your loan tier." },
  { n: "04", title: "Apply For Loan", desc: "Choose your amount, purpose and repayment term." },
  { n: "05", title: "Receive Funds", desc: "Funds land in your Airtel or MTN wallet within minutes." },
];

const benefits = [
  { icon: Zap, title: "Fast Approval", desc: "Automated underwriting returns decisions in minutes, not days." },
  { icon: ShieldCheck, title: "Secure Platform", desc: "Bank-grade encryption and compliance with Zambian data laws." },
  { icon: Smartphone, title: "Mobile Money Payments", desc: "Direct disbursement and repayment via Airtel and MTN." },
  { icon: Banknote, title: "Transparent Pricing", desc: "Every fee shown up front. No hidden charges, no surprises." },
  { icon: FileSignature, title: "Flexible Repayment", desc: "Choose terms from 1 to 12 months that match your cashflow." },
  { icon: Lock, title: "Trusted Technology", desc: "Built for the Zambian market with regional regulatory readiness." },
];

const testimonials = [
  {
    quote: "LendFlow has fundamentally changed how I manage my small business inventory. The application was seamless and the funds arrived in minutes.",
    name: "Chansa Musonda",
    role: "Entrepreneur, Lusaka",
  },
  {
    quote: "I needed school fees urgently. I applied at midnight and the money was in my MTN wallet before sunrise. Incredible.",
    name: "Mwila Banda",
    role: "Teacher, Kitwe",
  },
  {
    quote: "Transparent rates, no hidden fees, and the repayment schedule is easy to follow. This is how digital credit should work.",
    name: "Joseph Phiri",
    role: "Logistics Manager, Ndola",
  },
];

const faqs = [
  { q: "What are the requirements to apply?", a: "You must be a Zambian citizen aged 18 or older, with a valid NRC and an active Airtel or MTN mobile money account registered in your name." },
  { q: "How long does approval take?", a: "Most applications are processed automatically. Successful applicants typically receive funds within 15 minutes of signing the loan agreement." },
  { q: "What loan amounts are available?", a: "Loan limits depend on your activation tier and eligibility. Tiers and maximum amounts are configurable and reviewed periodically." },
  { q: "How do I repay my loan?", a: "Repayments are made via Airtel Money, MTN Mobile Money, or bank transfer using the unique reference shown on your dashboard." },
  { q: "Is my data secure?", a: "We use bank-grade encryption and comply with Zambian data protection requirements. Your personal and financial information remains private." },
  { q: "Will LendFlow expand to other countries?", a: "Yes. The platform is built to support Ghana, Kenya, Uganda and Tanzania, with country-specific currencies, fees and rules." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald/10">
      <Nav />

      {/* Hero */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald/5 border border-emerald/10 text-emerald text-xs font-medium tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
              </span>
              Built for Zambia. Ready for Africa.
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold text-navy leading-tight text-balance max-w-[20ch]">
              Get Access To Fast Mobile Money Loans
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-[52ch]">
              Register, verify your identity, activate your account, and access affordable digital loans directly to your mobile money wallet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="bg-navy text-navy-foreground text-base font-medium py-3 px-8 rounded-lg ring-1 ring-navy hover:bg-navy/95 transition-colors"
              >
                Apply Now
              </Link>
              <a
                href="#how-it-works"
                className="bg-card text-navy text-base font-medium py-3 px-8 rounded-lg ring-1 ring-hairline hover:bg-surface-muted transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Loan visual card */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl ring-1 ring-black/5 shadow-xl shadow-navy/5 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loan Amount (ZMW)</label>
                    <div className="text-3xl font-medium text-navy">K 5,000</div>
                    <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-emerald rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Repayment Period</label>
                    <div className="text-xl font-medium text-navy">6 Months</div>
                  </div>
                </div>
                <div className="bg-surface-muted rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-hairline">
                    <span className="text-sm text-muted-foreground">Monthly Interest</span>
                    <span className="text-sm font-semibold text-navy">3.5%</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-hairline">
                    <span className="text-sm text-muted-foreground">Service Fee</span>
                    <span className="text-sm font-semibold text-navy">K 150</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium text-navy">Total Repayment</span>
                    <span className="text-xl font-semibold text-emerald">K 6,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-navy-foreground mb-4 text-balance">How It Works</h2>
            <p className="text-navy-foreground/60 text-pretty max-w-[44ch]">
              Five simple steps from application to mobile money disbursement.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-5">
            {steps.map((s) => (
              <div key={s.n} className="space-y-4 group">
                <div className="text-5xl font-medium text-emerald/30 group-hover:text-emerald/60 transition-colors">{s.n}</div>
                <h3 className="text-lg font-medium text-navy-foreground">{s.title}</h3>
                <p className="text-sm text-navy-foreground/60 leading-relaxed text-pretty">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-medium text-navy text-balance">Benefits Designed For You</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-1">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-10 bg-card ring-1 ring-black/5 flex flex-col gap-8 aspect-square">
                <div className="size-10 bg-emerald/10 rounded-lg flex items-center justify-center">
                  <Icon className="size-5 text-emerald" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-xl font-medium text-navy mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial featured */}
      <section className="py-24 bg-surface-muted/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="text-emerald font-medium text-sm tracking-wider uppercase mb-6 block">Success Stories</span>
            <blockquote className="text-3xl font-medium text-navy leading-tight text-balance mb-8">
              &ldquo;LendFlow has fundamentally changed how I manage my small business inventory. The application was seamless and the funds arrived in minutes.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full overflow-hidden ring-1 ring-black/5">
                <img src={testimonialImg} alt="Chansa Musonda" width={48} height={48} loading="lazy" className="size-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold text-navy">Chansa Musonda</div>
                <div className="text-xs text-muted-foreground">Entrepreneur, Lusaka</div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <img
              src={testimonialImg}
              alt="A Zambian business owner in her Lusaka office"
              width={1280}
              height={960}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover rounded-2xl ring-1 ring-black/5"
            />
          </div>
        </div>
      </section>

      {/* Additional testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {testimonials.slice(1).map((t) => (
            <figure key={t.name} className="p-8 bg-card ring-1 ring-black/5 rounded-2xl flex flex-col gap-6">
              <blockquote className="text-base text-navy leading-relaxed text-pretty">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-auto">
                <div className="text-sm font-semibold text-navy">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
          <figure className="p-8 bg-navy text-navy-foreground rounded-2xl flex flex-col gap-6">
            <BadgeCheck className="size-6 text-emerald" />
            <blockquote className="text-base leading-relaxed text-pretty">
              Designed for tens of thousands of borrowers — with country-configurable rules ready for Ghana, Kenya, Uganda and Tanzania.
            </blockquote>
            <figcaption className="mt-auto text-xs uppercase tracking-wider text-navy-foreground/60">
              Africa-Ready Architecture
            </figcaption>
          </figure>
        </div>
      </section>

      {/* FAQ + Contact */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h2 className="text-3xl font-medium text-navy">Frequently Asked Questions</h2>
              <div className="divide-y divide-hairline">
                {faqs.map((f) => (
                  <details key={f.q} className="group py-5">
                    <summary className="list-none flex justify-between items-center cursor-pointer gap-6">
                      <span className="text-base font-medium text-navy">{f.q}</span>
                      <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                    </summary>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed text-pretty max-w-[52ch]">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div id="contact" className="bg-navy rounded-2xl p-8 md:p-12 text-navy-foreground h-fit">
              <h2 className="text-2xl font-medium mb-4">Still have questions?</h2>
              <p className="text-navy-foreground/60 mb-8 text-sm">Our support team is available 24/7. Reach out by WhatsApp, phone or email.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Phone className="size-4 text-emerald shrink-0" />
                  <span className="text-sm font-medium">+260 971 000 000</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Mail className="size-4 text-emerald shrink-0" />
                  <span className="text-sm font-medium">support@lendflow.zm</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <Wallet className="size-4 text-emerald shrink-0" />
                  <span className="text-sm font-medium">Stand 12345, Cairo Road, Lusaka</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 bg-emerald text-emerald-foreground py-3 rounded-lg font-medium ring-1 ring-emerald ring-offset-2 ring-offset-navy hover:bg-emerald/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessagesSquare className="size-4" />
                Message on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-muted border-t border-hairline py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <Logo />
            <p className="text-xs text-muted-foreground max-w-[32ch]">
              Fast. Secure. Accessible credit. Empowering the Zambian economy through digital lending.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-navy uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-xs text-muted-foreground hover:text-emerald">How It Works</a></li>
                <li><Link to="/auth" className="text-xs text-muted-foreground hover:text-emerald">Apply</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-navy uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-xs text-muted-foreground hover:text-emerald">Privacy Policy</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-emerald">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-hairline flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} LendFlow Zambia Limited.</p>
          <p className="text-xs text-muted-foreground">A digital credit provider.</p>
        </div>
      </footer>
    </div>
  );
}
