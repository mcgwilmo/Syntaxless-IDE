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

const RESTING_MESSAGE =
  "Create an account to save your projects. Every new account starts on Free.";

/*
 * The footer links. Same treatment as the login page's footer.
 *
 * A link is not an object, so it does not travel on press the way Button does --
 * there is nothing here to push in. Its two states are carried by the underline
 * (hover) and a deepened accent (held), which is the most a run of text can do
 * without pretending to be a control.
 *
 * The global :focus-visible ring in globals.css covers keyboard focus, so there
 * is deliberately no per-link ring here. The transition is colour-only, and the
 * reduced-motion block in globals.css zeroes the travel tokens, so nothing here
 * moves for a reader who asked for less motion.
 */
const FOOTER_LINK = [
  "text-[var(--accent-text)] underline-offset-4",
  "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
  "hover:underline active:text-[var(--accent-hover)]",
].join(" ");

export default function SignupPage() {
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
    setStatus("Creating your account…");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setStatus(error.message);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setStatus("Account created. Your Free plan is assigned automatically.");
    setIsLoading(false);
    router.push("/login");
  }

  return (
    <AuthPageShell>
      <AuthPanel
        title="Create account"
        footer={
          // Muted rather than soft: AuthPanel renders this on the raised panel,
          // and soft is only measured against the page behind it.
          <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
            <span>Already have an account?</span>
            <Link href="/login" className={FOOTER_LINK}>
              Sign in
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
            autoComplete="new-password"
            hint="At least 6 characters."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" disabled={isLoading} fullWidth size="lg">
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </AuthPanel>
    </AuthPageShell>
  );
}
