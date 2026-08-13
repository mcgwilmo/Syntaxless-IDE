"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPageShell, AuthPanel } from "@/components/site-shell";
import { Button, Callout, Field } from "@/design/primitives";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";

const RESTING_MESSAGE = "Sign in to open your dashboard.";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(RESTING_MESSAGE);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSupabaseSession(supabase).then((session) => {
      if (session) router.replace("/dashboard");
    });
  }, [router, supabase]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setHasError(false);
    setStatus("Signing you in…");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(error.message);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setStatus("Signed in.");
    router.push("/dashboard");
  }

  return (
    <AuthPageShell>
      <AuthPanel
        title="Welcome back"
        className="page-enter"
        footer={
          <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] text-[length:var(--text-sm)] text-[var(--text-soft)]">
            <span>No account yet?</span>
            <Link
              href="/signup"
              className="text-[var(--accent-text)] underline-offset-4 hover:underline"
            >
              Create one
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href="/subscriptions"
              className="text-[var(--accent-text)] underline-offset-4 hover:underline"
            >
              View pricing
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-[var(--space-4)]">
          <Callout tone={hasError ? "blocked" : "neutral"}>{status}</Callout>

          <Field
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={isLoading} fullWidth size="lg">
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </AuthPanel>
    </AuthPageShell>
  );
}
