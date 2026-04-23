"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getOrCreateSubscription,
  type SubscriptionTier,
} from "@/lib/subscriptions";

export function useLearningCenterAccess() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [authResolved, setAuthResolved] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");
  const [isAuthed, setIsAuthed] = useState(false);
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadProjectCount() {
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      return count ?? 0;
    }

    async function bootstrap() {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session) {
          setIsAuthed(false);
          setCurrentTier("free");
          setProjectCount(null);
          setAuthResolved(true);
          router.replace("/login");
          return;
        }

        setIsAuthed(true);

        const record = await getOrCreateSubscription(
          supabase,
          session.user.id,
          session.user.email ?? ""
        );

        setCurrentTier(record.tier);
        setProjectCount(await loadProjectCount());
        setAuthResolved(true);
      } catch (error) {
        console.error(error);
        setAuthResolved(true);
        setCurrentTier("free");
        setProjectCount(null);
        setIsAuthed(false);
        router.replace("/login");
      }
    }

    void bootstrap();
  }, [router, supabase]);

  return {
    authResolved,
    currentTier,
    isAuthed,
    projectCount,
    setProjectCount,
    supabase,
  };
}
