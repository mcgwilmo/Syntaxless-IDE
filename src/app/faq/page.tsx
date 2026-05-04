"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";

export default function FaqRedirectPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    async function redirectToTarget() {
      const session = await getSupabaseSession(supabase);

      router.replace(session ? "/resources" : "/login");
    }

    void redirectToTarget();
  }, [router, supabase]);

  return null;
}
