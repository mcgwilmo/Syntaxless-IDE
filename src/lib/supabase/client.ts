import {
  createClient,
  type Session,
  type SupabaseClient,
} from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function isInvalidRefreshTokenError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message)
      : "";

  return /invalid refresh token|refresh token not found/i.test(message);
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Expected NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

export async function getSupabaseSession(
  supabase = getSupabaseBrowserClient()
): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    return data.session;
  }

  if (isInvalidRefreshTokenError(error)) {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return null;
  }

  throw error;
}
