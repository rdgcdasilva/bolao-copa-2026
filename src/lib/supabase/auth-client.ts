// Cliente de auth — implicit flow (sem PKCE, funciona em WKWebView/iOS)
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
