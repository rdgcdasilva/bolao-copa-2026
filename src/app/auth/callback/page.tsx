"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Autenticando...");

  useEffect(() => {
    async function handleCallback() {
      const supabase = createAuthClient();

      // Com implicit flow, o token vem no hash da URL (#access_token=...)
      // detectSessionInUrl: true faz o cliente processar automaticamente
      // Aguarda o cliente processar o hash
      await new Promise((r) => setTimeout(r, 800));

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setStatus("Erro ao autenticar. Tente novamente.");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }

      setStatus("Sincronizando sessão...");

      // Sincroniza a sessão com o servidor (seta cookies para SSR)
      const res = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });

      if (res.ok) {
        setStatus("Bem-vindo! Entrando no bolão...");
        window.location.href = "/jogos";
      } else {
        setStatus("Erro ao sincronizar. Tente novamente.");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
      }
    }

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#009c3b] to-[#002776]">
      <div className="text-center text-white px-6">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">{status}</p>
      </div>
    </div>
  );
}
