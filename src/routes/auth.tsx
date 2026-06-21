import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const search = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in — Akiba Loans" },
      { name: "description", content: "Sign in to Akiba Loans to apply for fast mobile-money loans across Africa." },
      { property: "og:title", content: "Akiba Loans — Sign in" },
      { property: "og:description", content: "Fast, fair digital loans across Kenya, Uganda, Tanzania, Rwanda, Ghana and Nigeria." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "signin" } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to Akiba.");
        navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/app",
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/reset-password",
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">A</span>
          Akiba Loans
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Fair credit, instantly. Built for Africa.
          </h2>
          <p className="mt-4 max-w-md text-sidebar-foreground/70">
            Apply in under two minutes. Get funds straight to your mobile money wallet.
            Transparent rates, no hidden fees.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-sidebar-foreground/80">
            <div>✓ M-Pesa, MTN MoMo, Airtel Money</div>
            <div>✓ Loans from KES 5k to KES 200k</div>
            <div>✓ Trusted by borrowers in 6 countries</div>
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/60">© Akiba Loans. Licensed digital lender.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold">
              {isSignup ? "Create account" : "Welcome back"}
            </h1>
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-accent hover:underline"
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup && (
                  <button type="button" onClick={handleReset} className="text-xs text-muted-foreground hover:text-accent">
                    Forgot?
                  </button>
                )}
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms and privacy policy.
          </p>
        </Card>
      </div>
    </div>
  );
}
