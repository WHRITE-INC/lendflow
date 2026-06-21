import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Smartphone, Zap, Globe2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Akiba Loans — Fast mobile money loans across Africa" },
      { name: "description", content: "Apply in 2 minutes. Funds straight to M-Pesa, MTN MoMo or Airtel Money. Trusted by borrowers in Kenya, Uganda, Tanzania, Rwanda, Ghana and Nigeria." },
      { property: "og:title", content: "Akiba Loans — Fast mobile money loans" },
      { property: "og:description", content: "Fair credit, instantly. Apply, get approved, and receive funds on your phone." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">A</span>
            Akiba Loans
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/auth" search={{ mode: "signup" }}><Button>Get started</Button></Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sidebar via-sidebar to-primary opacity-95" />
          <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,oklch(0.7_0.17_158/.4),transparent_50%)]" />
          <div className="mx-auto max-w-6xl px-4 py-24 text-sidebar-foreground sm:px-6 sm:py-32 lg:py-40">
            <span className="inline-flex items-center gap-2 rounded-full border border-sidebar-foreground/20 bg-sidebar-foreground/5 px-3 py-1 text-xs font-medium">
              <span className="size-1.5 rounded-full bg-accent" /> Trusted in 6 countries
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Fair credit, instantly. <span className="text-accent">On your phone.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-sidebar-foreground/75">
              Apply in two minutes. Get funds straight to your M-Pesa, MTN MoMo or Airtel Money wallet.
              Transparent rates. No hidden fees.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }}><Button size="lg" className="h-12 px-6">Apply now</Button></Link>
              <Link to="/auth"><Button size="lg" variant="outline" className="h-12 border-sidebar-foreground/20 bg-transparent px-6 text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground">I have an account</Button></Link>
            </div>

            <div className="mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
              <Stat n="120k+" l="borrowers served" />
              <Stat n="2 min" l="average approval" />
              <Stat n="6" l="African countries" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Why Akiba</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">A premium lending experience designed for the way Africa transacts — mobile-first, instant, transparent.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature icon={<Zap />} title="2-minute apply" body="Choose amount, pick a term, submit. We decide in minutes." />
            <Feature icon={<Smartphone />} title="Mobile money native" body="M-Pesa, MTN MoMo, Airtel Money — receive and repay from one place." />
            <Feature icon={<ShieldCheck />} title="Bank-grade security" body="Encrypted KYC, RLS-protected data, MFA-ready." />
            <Feature icon={<Globe2 />} title="Across the region" body="Kenya, Uganda, Tanzania, Rwanda, Ghana and Nigeria." />
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">How it works</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {["Verify", "Apply", "Repay"].map((step, i) => (
                <li key={step} className="rounded-2xl border bg-card p-6">
                  <div className="grid size-10 place-items-center rounded-lg bg-accent font-display text-lg font-semibold text-accent-foreground">{i + 1}</div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{step}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {i === 0 && "Sign up, complete profile, upload ID. Approved in minutes."}
                    {i === 1 && "Pick an amount and term. See total payable up front. Submit."}
                    {i === 2 && "Pay back from your wallet. Top up early to lower your interest."}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-sidebar p-10 text-sidebar-foreground sm:p-16">
            <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl">Borrow with dignity. Pay back with ease.</h2>
            <p className="mt-3 max-w-xl text-sidebar-foreground/70">Join thousands across Africa who use Akiba for life's moments — school fees, business stock, emergencies.</p>
            <Link to="/auth" search={{ mode: "signup" }} className="mt-6 inline-block"><Button size="lg" className="h-12 px-6">Create your account</Button></Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} Akiba Loans. Licensed digital lender.</span>
          <span>Mobile money loans across Africa.</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold tabular text-accent">{n}</div>
      <div className="text-sm text-sidebar-foreground/70">{l}</div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="grid size-10 place-items-center rounded-lg bg-accent/10 text-accent">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
