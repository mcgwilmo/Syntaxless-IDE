"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPageShell, AuthPanel } from "@/components/site-shell";
import { useTheme } from "@/components/theme-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const { isLight } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Sign in to open your dashboard.");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router, supabase.auth]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus(error.message);
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
        description={status}
        className="page-enter"
        footer={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-500">
            <span>No account?</span>
            <Link href="/signup" className={isLight ? "text-slate-700 hover:text-slate-900" : "text-neutral-300 hover:text-white"}>
              Create one
            </Link>
            <span className="text-neutral-700">.</span>
            <Link href="/subscriptions" className={isLight ? "text-slate-700 hover:text-slate-900" : "text-neutral-300 hover:text-white"}>
              View pricing
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className={`w-full rounded-[1.5rem] border px-4 py-3 text-sm outline-none transition-colors ${
              isLight
                ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400/60"
                : "border-white/[0.08] bg-[#0d0d0d]/90 placeholder:text-neutral-600 focus:border-blue-400/40"
            }`}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={`w-full rounded-[1.5rem] border px-4 py-3 text-sm outline-none transition-colors ${
              isLight
                ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400/60"
                : "border-white/[0.08] bg-[#0d0d0d]/90 placeholder:text-neutral-600 focus:border-blue-400/40"
            }`}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-[1.5rem] border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 transition-all duration-300 hover:border-blue-300/40 hover:bg-blue-500/15 hover:text-white disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </AuthPanel>
    </AuthPageShell>
  );
}
