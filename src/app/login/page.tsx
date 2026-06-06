"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Unable to sign in.");
        setPending(false);
        return;
      }
      // Full navigation so the gated server layout re-reads the new cookie.
      router.replace("/overview");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Wordmark showTagline glyphSize={24} className="text-ink" />

          <div className="mt-12">
            <p className="label label-muted">Operator Access</p>
            <h1 className="display mt-3 text-5xl">Command Center</h1>
            <p className="serif mt-4 text-lg text-ink-muted">
              Sign in to the Omakase operator console.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="label label-muted">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="operator@omakase.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="label label-muted">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="login-password"
              />
            </div>

            {error && (
              <p
                className="font-mono text-xs text-critical"
                role="alert"
                data-testid="login-error"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={pending}
              className={cn("mt-2 w-full", pending && "opacity-70")}
              data-testid="login-submit"
            >
              {pending ? "Signing in…" : "Enter Console"}
            </Button>
          </form>

          <div className="mt-10 border border-hairline bg-card p-4">
            <p className="label label-muted">Demo Credentials</p>
            <dl className="mt-3 flex flex-col gap-1 font-mono text-xs text-ink">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">email</dt>
                <dd>any valid email</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">password</dt>
                <dd className="text-accent">omakase</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <footer className="border-t border-hairline px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
          Omakase · お任せ · Demo console · Fictional data
        </p>
      </footer>
    </main>
  );
}
