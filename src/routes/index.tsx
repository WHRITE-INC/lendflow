import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Zap,
  Banknote,
  FileSignature,
  Smartphone,
  Lock,
  Wallet,
  BadgeCheck,
  MessagesSquare,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import testimonialImg from "@/assets/testimonial.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LendFlow Zambia — Fast Mobile Money Loans" },
      {
        name: "description",
        content:
          "Register, verify your identity, choose a promotion package, and access affordable digital loans direct to your mobile money wallet.",
      },
      { property: "og:title", content: "LendFlow Zambia — Fast Mobile Money Loans" },
      {
        property: "og:description",
        content:
          "Register, verify your identity, choose a promotion package, and access affordable digital loans direct to your mobile money wallet.",
      },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="size-9 rounded-xl bg-navy shadow-lg shadow-navy/15 flex items-center justify-center">
        <div className="size-3 rounded-full bg-emerald" />
      </div>
      <span className="text-xl font-bold text-navy tracking-tight">LendFlow</span>
    </Link>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-hairline bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground hover:text-navy transition-colors"
          >
            Login
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="bg-emerald text-emerald-foreground text-sm font-medium py-2 px-4 rounded-md flex items-center gap-2 ring-1 ring-emerald shadow-lg shadow-emerald/20 hover:bg-emerald/90 transition-all hover:-translate-y-0.5"
          >
            Apply Now
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function AnimatedLoanPhone() {
  const [showSuccess, setShowSuccess] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 1500);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem]">
      <div className="lendflow-float relative">
        <div className="relative mx-auto h-[34rem] w-[17rem] overflow-hidden rounded-[2.75rem] border-[9px] border-navy bg-navy shadow-2xl shadow-navy/25">
          <div className="absolute left-1/2 top-0 z-10 h-7 w-28 -translate-x-1/2 rounded-b-3xl bg-navy" />
          <div className="h-full bg-gradient-to-br from-surface via-white to-emerald/10 px-5 pb-5 pt-12">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald/10 ring-1 ring-emerald/15">
                  <Wallet className="size-4 text-emerald" />
                </div>
                <span className="text-sm font-semibold text-navy">LendFlow</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">9:41</span>
            </div>

            <div className="mb-4 rounded-2xl bg-white p-5 shadow-xl shadow-navy/10 ring-1 ring-black/5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Loan Amount (ZMW)
              </div>
              <div className="mb-4 text-3xl font-bold text-navy">K 5,000</div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full w-2/3 rounded-full bg-emerald" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-navy p-4 text-navy-foreground shadow-lg shadow-navy/20">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-navy-foreground/65">Repayment Period</span>
                  <span className="text-sm font-semibold">6 Months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy-foreground/65">Total Repayment</span>
                  <span className="text-lg font-semibold text-emerald">K 6,200</span>
                </div>
              </div>

              <div
                className="rounded-2xl bg-white p-4 shadow-lg shadow-navy/10 ring-1 ring-black/5 transition-all duration-500"
                style={{
                  transform: showSuccess ? "scale(1.03)" : "scale(1)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald/10">
                      <Banknote className="size-5 text-emerald" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy">Receive Funds</div>
                      <div className="text-xs text-muted-foreground">
                        Funds land in your Airtel or MTN wallet within minutes.
                      </div>
                    </div>
                  </div>
                  {showSuccess ? (
                    <CheckCircle className="size-5 text-emerald animate-in fade-in zoom-in duration-300" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lendflow-float-slow absolute -right-2 top-12 flex size-16 items-center justify-center rounded-2xl bg-emerald text-emerald-foreground shadow-xl shadow-emerald/25 sm:-right-8">
        <Zap className="size-8" />
      </div>
      <div className="lendflow-float absolute -bottom-3 -left-1 flex size-14 items-center justify-center rounded-2xl bg-white text-emerald shadow-xl shadow-navy/10 ring-1 ring-black/5 sm:-left-8">
        <TrendingUp className="size-7" />
      </div>
    </div>
  );
}

const steps = [
  {
    n: "01",
    title: "Create Account",
    desc: "Register with your NRC, phone number and email in under two minutes.",
  },
  {
    n: "02",
    title: "Verify Identity",
    desc: "Upload your NRC and a selfie for secure KYC verification.",
  },
  {
    n: "03",
    title: "Choose Package",
    desc: "Select a promotion package and pay securely by MTN MoMo or Airtel Money.",
  },
  { n: "04", title: "Apply For Loan", desc: "Choose your amount, purpose and repayment term." },
  {
    n: "05",
    title: "Receive Funds",
    desc: "Funds land in your Airtel or MTN wallet within minutes.",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Fast Approval",
    desc: "Automated underwriting returns decisions in minutes, not days.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    desc: "Bank-grade encryption and compliance with Zambian data laws.",
  },
  {
    icon: Smartphone,
    title: "Mobile Money Payments",
    desc: "Direct disbursement and repayment via Airtel and MTN.",
  },
  {
    icon: Banknote,
    title: "Transparent Pricing",
    desc: "Every fee shown up front. No hidden charges, no surprises.",
  },
  {
    icon: FileSignature,
    title: "Flexible Repayment",
    desc: "Choose terms from 1 to 12 months that match your cashflow.",
  },
  {
    icon: Lock,
    title: "Trusted Technology",
    desc: "Built for the Zambian market with regional regulatory readiness.",
  },
];

const testimonials = [
  {
    quote:
      "LendFlow has fundamentally changed how I manage my small business inventory. The application was seamless and the funds arrived in minutes.",
    name: "Chansa Musonda",
    role: "Entrepreneur, Lusaka",
  },
  {
    quote:
      "I needed school fees urgently. I applied at midnight and the money was in my MTN wallet before sunrise. Incredible.",
    name: "Mwila Banda",
    role: "Teacher, Kitwe",
  },
  {
    quote:
      "Transparent rates, no hidden fees, and the repayment schedule is easy to follow. This is how digital credit should work.",
    name: "Joseph Phiri",
    role: "Logistics Manager, Ndola",
  },
];

const faqs = [
  {
    q: "What are the requirements to apply?",
    a: "You must be a Zambian citizen aged 18 or older, with a valid NRC and an active Airtel or MTN mobile money account registered in your name.",
  },
  {
    q: "How long does approval take?",
    a: "Most applications are processed automatically. Successful applicants typically receive funds within 15 minutes of signing the loan agreement.",
  },
  {
    q: "What loan amounts are available?",
    a: "Loan limits depend on your activation tier and eligibility. Tiers and maximum amounts are configurable and reviewed periodically.",
  },
  {
    q: "How do I repay my loan?",
    a: "Repayments are made via Airtel Money, MTN Mobile Money, or bank transfer using the unique reference shown on your dashboard.",
  },
  {
    q: "Is my data secure?",
    a: "We use bank-grade encryption and comply with Zambian data protection requirements. Your personal and financial information remains private.",
  },
  {
    q: "Will LendFlow expand to other countries?",
    a: "Yes. The platform is built to support Ghana, Kenya, Uganda and Tanzania, with country-specific currencies, fees and rules.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald/10">
      <Nav />

      {/* Hero */}
      <section className="lendflow-grid relative overflow-hidden px-6 py-20 lg:py-28">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald shadow-lg shadow-navy/5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
              Built for Zambia. Ready for Africa.
            </div>
            <h1 className="max-w-[12ch] text-5xl font-bold leading-tight text-navy text-balance md:text-7xl">
              Get Access To Fast Mobile Money Loans
            </h1>
            <p className="max-w-[52ch] text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
              Register, verify your identity, activate your account, and access affordable digital
              loans directly to your mobile money wallet.
            </p>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="group inline-flex items-center justify-center rounded-lg bg-navy px-8 py-3 text-base font-medium text-navy-foreground shadow-xl shadow-navy/20 ring-1 ring-navy transition-all hover:-translate-y-0.5 hover:bg-navy/95"
              >
                Apply Now
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg bg-white/90 px-8 py-3 text-base font-medium text-navy shadow-lg shadow-navy/5 ring-1 ring-hairline transition-all hover:-translate-y-0.5 hover:bg-surface-muted"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="relative min-h-[37rem]">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white via-emerald/10 to-navy/10 shadow-2xl shadow-navy/10 ring-1 ring-black/5" />
            <div className="relative flex h-full min-h-[37rem] items-center justify-center px-6 py-10">
              <AnimatedLoanPhone />
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl rounded-2xl bg-white/85 p-6 shadow-xl shadow-navy/10 ring-1 ring-black/5 backdrop-blur-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Interest
              </div>
              <div className="text-2xl font-bold text-navy">3.5%</div>
            </div>
            <div className="space-y-2 border-hairline md:border-x md:px-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Service Fee
              </div>
              <div className="text-2xl font-bold text-navy">K 150</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Repayment
              </div>
              <div className="text-2xl font-bold text-emerald">K 6,200</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative overflow-hidden py-24 bg-navy">
        <div className="lendflow-dots absolute inset-0 opacity-80" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative mb-16">
            <h2 className="text-3xl md:text-4xl font-medium text-navy-foreground mb-4 text-balance">
              How It Works
            </h2>
            <p className="text-navy-foreground/60 text-pretty max-w-[44ch]">
              Five simple steps from application to mobile money disbursement.
            </p>
          </div>
          <div className="relative grid gap-4 md:grid-cols-5">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group flex min-h-64 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.07]"
              >
                <div className="mb-8 text-5xl font-medium text-emerald/35 transition-colors group-hover:text-emerald">
                  {s.n}
                </div>
                <h3 className="text-lg font-medium text-navy-foreground">{s.title}</h3>
                <p className="mt-3 text-sm text-navy-foreground/60 leading-relaxed text-pretty">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="lendflow-grid py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-medium text-navy text-balance">
              Benefits Designed For You
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex aspect-square flex-col gap-8 rounded-2xl bg-white/90 p-8 shadow-xl shadow-navy/5 ring-1 ring-black/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-navy/10 sm:p-10"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald/10 shadow-lg shadow-emerald/10 ring-1 ring-emerald/15 transition-all group-hover:bg-emerald group-hover:text-emerald-foreground">
                  <Icon className="size-6 text-emerald transition-colors group-hover:text-emerald-foreground" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-xl font-medium text-navy mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                    {desc}
                  </p>
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
            <span className="text-emerald font-medium text-sm tracking-wider uppercase mb-6 block">
              Success Stories
            </span>
            <blockquote className="text-3xl font-medium text-navy leading-tight text-balance mb-8">
              &ldquo;LendFlow has fundamentally changed how I manage my small business inventory.
              The application was seamless and the funds arrived in minutes.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full overflow-hidden ring-1 ring-black/5">
                <img
                  src={testimonialImg}
                  alt="Chansa Musonda"
                  width={48}
                  height={48}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-navy">Chansa Musonda</div>
                <div className="text-xs text-muted-foreground">Entrepreneur, Lusaka</div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald/20 to-navy/10" />
              <img
                src={testimonialImg}
                alt="A Zambian business owner in her Lusaka office"
                width={1280}
                height={960}
                loading="lazy"
                className="relative w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl shadow-navy/10 ring-1 ring-black/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Additional testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {testimonials.slice(1).map((t) => (
            <figure
              key={t.name}
              className="flex flex-col gap-6 rounded-2xl bg-card p-8 shadow-xl shadow-navy/5 ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10"
            >
              <blockquote className="text-base text-navy leading-relaxed text-pretty">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto">
                <div className="text-sm font-semibold text-navy">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
          <figure className="lendflow-dots flex flex-col gap-6 rounded-2xl bg-navy p-8 text-navy-foreground shadow-2xl shadow-navy/20">
            <BadgeCheck className="size-6 text-emerald" />
            <blockquote className="text-base leading-relaxed text-pretty">
              Designed for tens of thousands of borrowers — with country-configurable rules ready
              for Ghana, Kenya, Uganda and Tanzania.
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
                      <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed text-pretty max-w-[52ch]">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
            <div
              id="contact"
              className="lendflow-dots h-fit rounded-2xl bg-navy p-8 text-navy-foreground shadow-2xl shadow-navy/20 md:p-12"
            >
              <h2 className="text-2xl font-medium mb-4">Still have questions?</h2>
              <p className="text-navy-foreground/60 mb-8 text-sm">
                Our support team is available 24/7. Reach out by WhatsApp, phone or email.
              </p>
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
              Fast. Secure. Accessible credit. Empowering the Zambian economy through digital
              lending.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-navy uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-xs text-muted-foreground hover:text-emerald"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <Link to="/auth" className="text-xs text-muted-foreground hover:text-emerald">
                    Apply
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-navy uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-xs text-muted-foreground hover:text-emerald">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs text-muted-foreground hover:text-emerald">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-hairline flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LendFlow Zambia Limited.
          </p>
          <p className="text-xs text-muted-foreground">A digital credit provider.</p>
        </div>
      </footer>
    </div>
  );
}
