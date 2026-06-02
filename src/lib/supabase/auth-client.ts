// Cliente de auth — usa localStorage (funciona no iOS Safari e Android)
import { createClient } from "@supabase/supabase-js";

let authClient: ReturnType<typeof createClient> | null = null;

export function createAuthClient() {
  if (typeof window === "undefined") return null as any;
  if (authClient) return authClient;
  authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        storage: window.localStorage,
      },
    }
  );
  return authClient;
}
