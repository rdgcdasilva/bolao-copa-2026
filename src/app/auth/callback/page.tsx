"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Autenticando...");

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        setStatus("Código não encontrado, redirecionando...");
        setTimeout(() => { window.location.href = "/login"; }, 1500);
        return;
      }

      setStatus("Trocando código por sessão...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setStatus(`Erro: ${error.message}`);
        console.error(error);
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }

      if (data.session) {
        setStatus("Sessão criada! Entrando...");
        // Pequeno delay para garantir que o cookie foi escrito
        setTimeout(() => { window.location.href = "/jogos"; }, 500);
      } else {
        setStatus("Sem sessão, redirecionando...");
        setTimeout(() => { window.location.href = "/login"; }, 1500);
      }
    }

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#009c3b] to-[#002776]">
      <div className="text-center text-white">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">{status}</p>
      </div>
    </div>
  );
}
