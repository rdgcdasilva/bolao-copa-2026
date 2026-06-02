"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Jogo, Perfil } from "@/types";
import { formatDataHora, bandeiraPais, labelFase, cn } from "@/lib/utils";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface Props {
  jogos: Jogo[];
  participantes: Partial<Perfil>[];
}

export default function AdminClient({ jogos, participantes }: Props) {
  const [aba, setAba] = useState<"jogos" | "participantes">("jogos");
  const [jogosState, setJogosState] = useState<Jogo[]>(jogos);
  const [editando, setEditando] = useState<{ jogoId: string; casa: string; fora: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const supabase = createClient();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function salvarResultado() {
    if (!editando) return;
    const casa = parseInt(editando.casa);
    const fora = parseInt(editando.fora);
    if (isNaN(casa) || isNaN(fora)) return;

    setSalvando(true);

    const { error } = await supabase
      .from("jogos")
      .update({ gols_casa: casa, gols_fora: fora, encerrado: true })
      .eq("id", editando.jogoId);

    if (!error) {
      // Calcular pontos via RPC
      await supabase.rpc("calcular_pontos", { jogo_id_param: editando.jogoId });

      setJogosState((prev) =>
        prev.map((j) =>
          j.id === editando.jogoId ? { ...j, gols_casa: casa, gols_fora: fora, encerrado: true } : j
        )
      );
      setEditando(null);
      showToast("✅ Resultado salvo e pontos calculados!");
    } else {
      showToast("❌ Erro ao salvar resultado.");
    }

    setSalvando(false);
  }

  async function reabrirJogo(jogoId: string) {
    await supabase
      .from("jogos")
      .update({ gols_casa: null, gols_fora: null, encerrado: false })
      .eq("id", jogoId);

    setJogosState((prev) =>
      prev.map((j) =>
        j.id === jogoId ? { ...j, gols_casa: null, gols_fora: null, encerrado: false } : j
      )
    );
    showToast("🔄 Jogo reaberto.");
  }

  async function toggleAdmin(userId: string, atual: boolean) {
    await supabase.from("perfis").update({ is_admin: !atual }).eq("id", userId);
    showToast(atual ? "Admin removido." : "✅ Admin adicionado!");
  }

  const fases = Array.from(new Set(jogosState.map((j) => j.fase)));

  return (
    <div className="max-w-lg mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#002776] px-4 pt-12 pb-4">
        <h1 className="text-white font-bold text-xl">🛡️ Painel Admin</h1>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setAba("jogos")}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition",
              aba === "jogos" ? "bg-[#ffdf00] text-[#002776]" : "bg-white/20 text-white")}
          >
            Jogos ({jogosState.length})
          </button>
          <button
            onClick={() => setAba("participantes")}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition",
              aba === "participantes" ? "bg-[#ffdf00] text-[#002776]" : "bg-white/20 text-white")}
          >
            Participantes ({participantes.length})
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* ABA JOGOS */}
        {aba === "jogos" && (
          <div className="space-y-6">
            {fases.map((fase) => (
              <div key={fase}>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  {labelFase(fase)}
                </h2>
                <div className="space-y-2">
                  {jogosState.filter((j) => j.fase === fase).map((jogo) => (
                    <div
                      key={jogo.id}
                      className={cn(
                        "bg-white rounded-2xl border p-4 shadow-sm",
                        jogo.encerrado ? "border-gray-200 opacity-80" : "border-blue-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{formatDataHora(jogo.data_hora)}</span>
                        {jogo.encerrado && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Encerrado</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{bandeiraPais(jogo.bandeira_casa)}</span>
                          <span className="text-sm font-semibold text-gray-700 truncate">{jogo.time_casa}</span>
                        </div>

                        <div className="mx-2 text-center font-bold text-gray-400 text-sm">
                          {jogo.encerrado
                            ? `${jogo.gols_casa} × ${jogo.gols_fora}`
                            : "vs"}
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-sm font-semibold text-gray-700 truncate">{jogo.time_fora}</span>
                          <span className="text-lg">{bandeiraPais(jogo.bandeira_fora)}</span>
                        </div>
                      </div>

                      {/* Editar resultado */}
                      {editando?.jogoId === jogo.id ? (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2">
                          <input
                            type="number" inputMode="numeric" min={0}
                            value={editando.casa}
                            onChange={(e) => setEditando({ ...editando, casa: e.target.value })}
                            className="w-12 h-10 text-center font-bold border-2 border-[#002776] rounded-lg focus:outline-none"
                          />
                          <span className="text-gray-400">×</span>
                          <input
                            type="number" inputMode="numeric" min={0}
                            value={editando.fora}
                            onChange={(e) => setEditando({ ...editando, fora: e.target.value })}
                            className="w-12 h-10 text-center font-bold border-2 border-[#002776] rounded-lg focus:outline-none"
                          />
                          <button
                            onClick={salvarResultado}
                            disabled={salvando}
                            className="flex-1 h-10 bg-[#009c3b] text-white rounded-lg text-sm font-semibold"
                          >
                            {salvando ? "…" : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setEditando(null)}
                            className="h-10 w-10 flex items-center justify-center text-gray-400 border rounded-lg"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          <button
                            onClick={() => setEditando({
                              jogoId: jogo.id,
                              casa: String(jogo.gols_casa ?? ""),
                              fora: String(jogo.gols_fora ?? ""),
                            })}
                            className="flex-1 h-9 bg-[#002776] text-white rounded-lg text-xs font-semibold"
                          >
                            {jogo.encerrado ? "Corrigir placar" : "Inserir resultado"}
                          </button>
                          {jogo.encerrado && (
                            <button
                              onClick={() => reabrirJogo(jogo.id)}
                              title="Reabrir jogo"
                              className="h-9 w-9 flex items-center justify-center text-gray-400 border rounded-lg"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA PARTICIPANTES */}
        {aba === "participantes" && (
          <div className="space-y-2">
            {participantes.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {p.nome?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800 truncate">{p.nome}</div>
                  <div className="text-xs text-gray-400 truncate">{p.email}</div>
                </div>
                <button
                  onClick={() => toggleAdmin(p.id!, p.is_admin!)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition",
                    p.is_admin ? "bg-[#ffdf00] text-[#002776]" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {p.is_admin ? "Admin" : "User"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
