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

/*
 * The footer links.
 *
 * A link is not an object, so it does not travel on press the way Button does --
 * there is nothing here to push in. Its two states are carried by the underline
 * (hover) and a deepened accent (held), which is the most a run of text can do
 * without pretending to be a control.
 *
 * The global :focus-visible ring in globals.css covers keyboard focus, so there
 * is deliberately no per-link ring here.
 */
const FOOTER_LINK = [
  "text-[var(--accent-text)] underline-offset-4",
  "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
  "hover:underline active:text-[var(--accent-hover)]",
].join(" ");

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
        footer={
          /* Muted, not soft: AuthPanel is a raised panel, and soft text falls
             under AA against it in the dark theme. */
          <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
            <span>No account yet?</span>
            <Link href="/signup" className={FOOTER_LINK}>
              Create one
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/subscriptions" className={FOOTER_LINK}>
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
