import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Percent,
  Shield,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/loans-calculator")({
  head: () => ({
    meta: [
      { title: "Loan Calculator — LendFlow Zambia" },
      {
        name: "description",
        content:
          "Estimate your repayments and compare instant mobile money loan offers across Zambian lenders.",
      },
    ],
  }),
  component: LoansCalculatorPage,
});

interface LoanOffer {
  id: string;
  provider: string;
  interestRate: number;
  apr: number;
  processingFee: number;
  earlyRepayment: boolean;
  featured?: boolean;
}

const baseOffers: LoanOffer[] = [
  {
    id: "1",
    provider: "LendFlow Prime",
    interestRate: 8.5,
    apr: 9.1,
    processingFee: 0,
    earlyRepayment: true,
    featured: true,
  },
  {
    id: "2",
    provider: "Kwacha Capital",
    interestRate: 10.25,
    apr: 11.0,
    processingFee: 150,
    earlyRepayment: true,
  },
  {
    id: "3",
    provider: "Zamloan Express",
    interestRate: 12.5,
    apr: 13.4,
    processingFee: 300,
    earlyRepayment: false,
  },
];

function calcMonthly(principal: number, ratePct: number, months: number) {
  const r = ratePct / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  const p = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.round(p);
}

const fmtZmw = (n: number) =>
  new Intl.NumberFormat("en-ZM", { maximumFractionDigits: 0 }).format(n);

function PhoneMockup() {
  const steps = [
    { title: "Enter Amount", subtitle: "How much do you need?", icon: DollarSign },
    { title: "Select Term", subtitle: "Choose your repayment period", icon: Calendar },
    { title: "Compare Offers", subtitle: "See personalised rates", icon: TrendingUp },
    { title: "Instant Approval", subtitle: "Funds to your wallet", icon: CheckCircle2 },
  ] as const;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((p) => (p + 1) % steps.length), 3000);
    return () => clearInterval(id);
  }, [steps.length]);
  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="relative mx-auto w-[280px]">
      <div className="relative rounded-[2.75rem] bg-navy p-3 shadow-2xl shadow-navy/30">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-surface aspect-[9/19]">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-navy" />
          <div className="flex h-full flex-col px-6 pt-10">
            <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
              <span>9:41</span>
              <span>LendFlow</span>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald text-emerald-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{current.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{current.subtitle}</p>
                  <div className="mt-6 flex gap-1.5">
                    {steps.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === step ? "w-6 bg-emerald" : "w-1.5 bg-hairline"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="pb-6">
              <div className="h-10 rounded-xl bg-navy/90" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ offer, amount, term, index }: { offer: LoanOffer; amount: number; term: number; index: number }) {
  const monthly = calcMonthly(amount, offer.interestRate, term);
  const total = monthly * term;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className={offer.featured ? "border-emerald/40 ring-1 ring-emerald/30" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{offer.provider}</CardTitle>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Verified lender
              </div>
            </div>
            {offer.featured && <Badge className="bg-emerald text-emerald-foreground">Best offer</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-muted p-4">
            <div>
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="text-xl font-semibold text-foreground">K {fmtZmw(monthly)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rate</p>
              <p className="text-xl font-semibold text-foreground">{offer.interestRate}%</p>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Total repayment" value={`K ${fmtZmw(total)}`} />
            <Row label="APR" value={`${offer.apr}%`} />
            <Row
              label="Processing fee"
              value={offer.processingFee === 0 ? "Free" : `K ${fmtZmw(offer.processingFee)}`}
            />
            <Row label="Early repayment" value={offer.earlyRepayment ? "Allowed" : "Not allowed"} />
          </dl>
          <Button className="w-full" asChild>
            <Link to="/dashboard">
              Apply now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function LoansCalculatorPage() {
  const [amount, setAmount] = useState(5000);
  const [term, setTerm] = useState(12);

  const offers = useMemo(() => baseOffers, []);
  const best = useMemo(() => {
    const monthly = calcMonthly(amount, offers[0].interestRate, term);
    return { monthly, total: monthly * term, interest: monthly * term - amount };
  }, [amount, term, offers]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-hairline bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
            LendFlow <span className="text-emerald">Zambia</span>
          </Link>
          <Button asChild variant="outline">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-6 py-16">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-muted px-3 py-1 text-xs font-medium text-foreground">
              <Zap className="h-3.5 w-3.5 text-emerald" />
              Instant approval in 60 seconds
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Borrow with clarity.
              <span className="block text-emerald">Repay with confidence.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              Compare personalised loan offers from trusted Zambian lenders. Transparent rates,
              mobile-money disbursement, and funds in your wallet within 24 hours.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Feature icon={Shield} title="Bank-level security" sub="256-bit encryption" />
              <Feature icon={Clock} title="24/7 support" sub="Always here to help" />
            </div>
            <Button size="lg" className="mt-8 bg-emerald text-emerald-foreground hover:bg-emerald/90" asChild>
              <Link to="/auth">
                Get started <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <PhoneMockup />
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald" />
              Loan calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <Slider
                  label="Loan amount"
                  value={amount}
                  min={500}
                  max={50000}
                  step={500}
                  display={`K ${fmtZmw(amount)}`}
                  onChange={setAmount}
                />
                <Slider
                  label="Loan term"
                  value={term}
                  min={3}
                  max={36}
                  step={1}
                  display={`${term} months`}
                  onChange={setTerm}
                />
              </div>
              <div className="rounded-xl bg-navy p-6 text-navy-foreground">
                <p className="text-xs uppercase tracking-wider text-navy-foreground/70">
                  Estimated monthly payment
                </p>
                <p className="mt-2 text-4xl font-semibold">K {fmtZmw(best.monthly)}</p>
                <p className="mt-1 text-xs text-navy-foreground/70">Based on best available rate</p>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
                  <div>
                    <p className="text-navy-foreground/70">Total interest</p>
                    <p className="mt-1 font-semibold">K {fmtZmw(best.interest)}</p>
                  </div>
                  <div>
                    <p className="text-navy-foreground/70">Total repayment</p>
                    <p className="mt-1 font-semibold">K {fmtZmw(best.total)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-3">
          <Stat icon={Percent} value="8.5%" label="Lowest rate" />
          <Stat icon={CheckCircle2} value="95%" label="Approval rate" />
          <Stat icon={Smartphone} value="<24h" label="Wallet disbursement" />
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Available loan offers
            </h2>
            <p className="text-sm text-muted-foreground">Updated in real time</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {offers.map((o, i) => (
              <OfferCard key={o.id} offer={o} amount={amount} term={term} index={i} />
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          All rates are subject to approval and may vary based on credit assessment.
        </p>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof Shield;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-hairline bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Percent; value: string; label: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm font-semibold text-emerald">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-hairline accent-emerald"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>
          {label.includes("amount") ? `K ${fmtZmw(min)}` : `${min} mo`}
        </span>
        <span>
          {label.includes("amount") ? `K ${fmtZmw(max)}` : `${max} mo`}
        </span>
      </div>
    </div>
  );
}