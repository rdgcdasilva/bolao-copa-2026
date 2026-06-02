"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Autenticando...");

  useEffect(() => {
    const supabase = createAuthClient();

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        // Tenta detectar sessão pelo hash (fallback)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("Sessão detectada! Entrando...");
          setTimeout(() => { window.location.href = "/jogos"; }, 300);
        } else {
          setStatus("Código não encontrado.");
          setTimeout(() => { window.location.href = "/login"; }, 1500);
        }
        return;
      }

      setStatus("Verificando credenciais...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        // Tenta pegar sessão existente mesmo com erro
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.location.href = "/jogos";
          return;
        }
        setStatus("Erro ao autenticar. Redirecionando...");
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }

      if (data.session) {
        setStatus("Bem-vindo! Entrando no bolão...");
        setTimeout(() => { window.location.href = "/jogos"; }, 300);
      } else {
        window.location.href = "/login";
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
