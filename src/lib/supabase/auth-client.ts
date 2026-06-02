// Cliente especial para login/callback — usa localStorage (funciona no mobile)
import { createClient } from "@supabase/supabase-js";

let authClient: ReturnType<typeof createClient> | null = null;

export function createAuthClient() {
  if (authClient) return authClient;
  authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    }
  );
  return authClient;
}
