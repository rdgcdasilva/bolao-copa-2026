// Cliente de auth — usa implicit flow para funcionar no iOS Safari
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
        flowType: "implicit",
        detectSessionInUrl: true,
        persistSession: true,
      },
    }
  );
  return authClient;
}
