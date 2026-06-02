"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Autenticando...");

  useEffect(() => {
    async function handleCallback() {
      const supabase = createAuthClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        setStatus("Sem código de autenticação.");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }

      setStatus("Verificando credenciais...");

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        setStatus("Erro ao autenticar. Tente novamente.");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }

      setStatus("Sincronizando sessão...");

      // Sincroniza a sessão com o servidor (seta cookies)
      const res = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });

      if (res.ok) {
        setStatus("Bem-vindo! Entrando no bolão...");
        window.location.href = "/jogos";
      } else {
        setStatus("Erro ao sincronizar sessão.");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
      }
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
