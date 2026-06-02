"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Jogo, Palpite, Perfil } from "@/types";
import { formatDataHora, jogoAberto, bandeiraPais, labelFase, cn, PONTUACAO } from "@/lib/utils";
import RegrasBolao from "@/components/RegrasBolao";

interface Props {
  jogosIniciais: Jogo[];
  palpitesIniciais: Palpite[];
  userId: string;
  perfil: Perfil | null;
}

export default function JogosClient({ jogosIniciais, palpitesIniciais, userId, perfil }: Props) {
  const [jogos, setJogos] = useState<Jogo[]>(jogosIniciais);
  const [palpites, setPalpites] = useState<Map<string, Palpite>>(
    new Map(palpitesIniciais.map((p) => [p.jogo_id, p]))
  );
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Map<string, { casa: string; fora: string }>>(new Map());
  const [faseFiltro, setFaseFiltro] = useState<string>("grupos");
  const [mostrarRegras, setMostrarRegras] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("jogos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "jogos" }, (payload) => {
        setJogos((prev) =>
          prev.map((j) => (j.id === (payload.new as Jogo).id ? (payload.new as Jogo) : j))
        );
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "palpites", filter: `user_id=eq.${userId}` }, (payload) => {
        const p = payload.new as Palpite;
        setPalpites((prev) => new Map(prev).set(p.jogo_id, p));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase]);

  const handleSalvar = useCallback(async (jogoId: string) => {
    const draft = drafts.get(jogoId);
    if (!draft) return;

    const casa = parseInt(draft.casa);
    const fora = parseInt(draft.fora);
    if (isNaN(casa) || isNaN(fora) || casa < 0 || fora < 0) return;

    setSaving((prev) => new Set(prev).add(jogoId));

    const { data, error } = await supabase
      .from("palpites")
      .upsert({ user_id: userId, jogo_id: jogoId, gols_casa: casa, gols_fora: fora }, { onConflict: "user_id,jogo_id" })
      .select()
      .single();

    if (!error && data) {
      setPalpites((prev) => new Map(prev).set(jogoId, data));
      setDrafts((prev) => { const m = new Map(prev); m.delete(jogoId); return m; });
    }

    setSaving((prev) => { const s = new Set(prev); s.delete(jogoId); return s; });
  }, [drafts, userId, supabase]);

  const fases = Array.from(new Set(jogos.map((j) => j.fase)));
  const jogosFiltrados = jogos.filter((j) => j.fase === faseFiltro);
  const grupos = Array.from(new Set(jogosFiltrados.map((j) => j.grupo).filter(Boolean)));

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#009c3b] to-[#002776] px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">⚽ Bolão 2026</h1>
            <p className="text-green-200 text-xs mt-0.5">Olá, {perfil?.nome?.split(" ")[0]}!</p>
          </div>
          <button onClick={() => setMostrarRegras((v) => !v)}
            className="text-xs text-green-200 underline underline-offset-2">
            📋 Ver regras
          </button>
        </div>

        {/* Regras expansíveis */}
        {mostrarRegras && (
          <div className="mt-2">
            <RegrasBolao />
          </div>
        )}

        {/* Filtro de fase */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {fases.map((fase) => (
            <button
              key={fase}
              onClick={() => setFaseFiltro(fase)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition",
                faseFiltro === fase
                  ? "bg-[#ffdf00] text-[#002776]"
                  : "bg-white/20 text-white"
              )}
            >
              {labelFase(fase)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de jogos */}
      <div className="px-4 py-4 space-y-6">
        {(grupos.length > 0 ? grupos : [null]).map((grupo) => {
          const jogosGrupo = grupo
            ? jogosFiltrados.filter((j) => j.grupo === grupo)
            : jogosFiltrados;

          return (
            <div key={grupo ?? "sem-grupo"}>
              {grupo && (
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Grupo {grupo}
                </h2>
              )}
              <div className="space-y-3">
                {jogosGrupo.map((jogo) => {
                  const palpite = palpites.get(jogo.id);
                  const draft = drafts.get(jogo.id);
                  const aberto = jogoAberto(jogo.data_hora);
                  const isSaving = saving.has(jogo.id);
                  const temDraft = !!draft;

                  const valorCasa = draft?.casa ?? (palpite ? String(palpite.gols_casa) : "");
                  const valorFora = draft?.fora ?? (palpite ? String(palpite.gols_fora) : "");

                  return (
                    <div
                      key={jogo.id}
                      className={cn(
                        "bg-white rounded-2xl shadow-sm border overflow-hidden",
                        jogo.encerrado ? "border-gray-200" : aberto ? "border-[#009c3b]/30" : "border-orange-200"
                      )}
                    >
                      {/* Status bar */}
                      <div className={cn(
                        "px-4 py-1.5 flex justify-between items-center text-xs",
                        jogo.encerrado ? "bg-gray-100 text-gray-500" : aberto ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                      )}>
                        <span>{formatDataHora(jogo.data_hora)}</span>
                        <span className="font-medium">
                          {jogo.encerrado ? "Encerrado" : aberto ? "Aberto para palpite" : "Em andamento"}
                        </span>
                      </div>

                      <div className="px-4 py-4">
                        {/* Times e placar */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Time casa */}
                          <div className="flex-1 text-center">
                            <div className="text-2xl mb-1">{bandeiraPais(jogo.bandeira_casa)}</div>
                            <div className="text-xs font-semibold text-gray-700 leading-tight">
                              {jogo.time_casa}
                            </div>
                          </div>

                          {/* Placar oficial / palpite */}
                          <div className="flex flex-col items-center gap-1.5">
                            {jogo.encerrado ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-800">{jogo.gols_casa}</span>
                                <span className="text-gray-400">×</span>
                                <span className="text-2xl font-bold text-gray-800">{jogo.gols_fora}</span>
                              </div>
                            ) : (
                              <span className="text-gray-300 font-bold text-lg">vs</span>
                            )}

                            {/* Seu palpite (resultado exibido) */}
                            {palpite && jogo.encerrado && (
                              <div className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                palpite.pontos > 1   ? "bg-[#ffdf00] text-[#002776]" :
                                palpite.pontos === 1 ? "bg-green-100 text-green-700" :
                                palpite.pontos < 0   ? "bg-red-200 text-red-800" :
                                "bg-red-100 text-red-600"
                              )}>
                                {palpite.pontos > 1  ? `🏆 +${palpite.pontos} pts` :
                                 palpite.pontos === 1 ? `✅ +${palpite.pontos} pt` :
                                 palpite.pontos < 0  ? `💀 ${palpite.pontos} pt` : "❌ 0 pts"}
                              </div>
                            )}
                          </div>

                          {/* Time fora */}
                          <div className="flex-1 text-center">
                            <div className="text-2xl mb-1">{bandeiraPais(jogo.bandeira_fora)}</div>
                            <div className="text-xs font-semibold text-gray-700 leading-tight">
                              {jogo.time_fora}
                            </div>
                          </div>
                        </div>

                        {/* Input de palpite */}
                        {aberto && !jogo.encerrado && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400 text-center mb-2">Seu palpite</p>
                            <div className="flex items-center justify-center gap-3">
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={99}
                                value={valorCasa}
                                onChange={(e) => {
                                  setDrafts((prev) => {
                                    const m = new Map(prev);
                                    const cur = m.get(jogo.id) ?? { casa: valorCasa, fora: valorFora };
                                    m.set(jogo.id, { ...cur, casa: e.target.value });
                                    return m;
                                  });
                                }}
                                className="w-14 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#009c3b] focus:outline-none"
                                placeholder="0"
                              />
                              <span className="text-gray-400 font-bold">×</span>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={99}
                                value={valorFora}
                                onChange={(e) => {
                                  setDrafts((prev) => {
                                    const m = new Map(prev);
                                    const cur = m.get(jogo.id) ?? { casa: valorCasa, fora: valorFora };
                                    m.set(jogo.id, { ...cur, fora: e.target.value });
                                    return m;
                                  });
                                }}
                                className="w-14 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#009c3b] focus:outline-none"
                                placeholder="0"
                              />
                              <button
                                onClick={() => handleSalvar(jogo.id)}
                                disabled={!temDraft || isSaving}
                                className={cn(
                                  "px-4 h-12 rounded-xl text-sm font-semibold transition",
                                  temDraft && !isSaving
                                    ? "bg-[#009c3b] text-white active:bg-green-700"
                                    : "bg-gray-100 text-gray-400"
                                )}
                              >
                                {isSaving ? "…" : palpite ? "Atualizar" : "Salvar"}
                              </button>
                            </div>
                            {palpite && !draft && (
                              <p className="text-xs text-center text-gray-400 mt-2">
                                Palpite salvo: {palpite.gols_casa} × {palpite.gols_fora}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Palpite salvo (jogo encerrado) */}
                        {palpite && jogo.encerrado && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
                            Seu palpite: {palpite.gols_casa} × {palpite.gols_fora}
                          </div>
                        )}

                        {/* Jogo fechado sem palpite */}
                        {!aberto && !jogo.encerrado && !palpite && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-center text-xs text-orange-500">
                            Prazo encerrado — você não palpitou
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
