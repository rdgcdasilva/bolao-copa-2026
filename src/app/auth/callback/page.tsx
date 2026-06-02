"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Entrando...");

  useEffect(() => {
    const supabase = createAuthClient();

    async function handleCallback() {
      // Aguarda um momento para o Supabase processar o token da URL
      await new Promise((r) => setTimeout(r, 500));

      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        setStatus("Bem-vindo! Carregando...");
        window.location.href = "/jogos";
        return;
      }

      // Tenta trocar código se vier via PKCE (fallback)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { data, error: exchError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchError && data.session) {
          window.location.href = "/jogos";
          return;
        }
      }

      setStatus("Não foi possível autenticar. Redirecionando...");
      setTimeout(() => { window.location.href = "/login"; }, 2000);
    }

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#009c3b] to-[#002776]">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">{status}</p>
      </div>
    </div>
  );
}
