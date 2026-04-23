"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function FaqRedirectPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    async function redirectToTarget() {
      const { data } = await supabase.auth.getSession();

      router.replace(data.session ? "/resources" : "/login");
    }

    void redirectToTarget();
  }, [router, supabase]);

  return null;
}
