"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RankingEntry } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  rankingInicial: RankingEntry[];
  userId: string;
}

export default function RankingClient({ rankingInicial, userId }: Props) {
  const [ranking, setRanking] = useState<RankingEntry[]>(rankingInicial);
  const supabase = createClient();

  async function recarregarRanking() {
    const { data } = await supabase
      .from("ranking")
      .select("*, perfis(*)")
      .order("total_pontos", { ascending: false })
      .order("acertos_exatos", { ascending: false });
    if (data) setRanking(data);
  }

  useEffect(() => {
    const channel = supabase
      .channel("ranking-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ranking" }, recarregarRanking)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "perfis" }, recarregarRanking)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const medalhas = ["🥇", "🥈", "🥉"];
  const myPosition = ranking.findIndex((r) => r.user_id === userId) + 1;
  const myEntry = ranking.find((r) => r.user_id === userId);

  const totalParticipantes = ranking.length;
  const premioTotal = totalParticipantes * 100;
  const premio1 = premioTotal * 0.5;
  const premio2 = premioTotal * 0.3;
  const premio3 = premioTotal * 0.2;

  function formatReais(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#002776] to-[#009c3b] px-4 pt-12 pb-6">
        <h1 className="text-white font-bold text-xl">🏆 Ranking ao vivo</h1>
        <p className="text-blue-200 text-xs mt-0.5">Atualizado em tempo real</p>

        {/* Card de premiação */}
        <div className="mt-4 bg-[#ffdf00] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#002776] font-bold text-sm">💰 Premiação total</p>
              <p className="text-[#002776]/70 text-xs">{totalParticipantes} participante{totalParticipantes !== 1 ? "s" : ""} × R$100</p>
            </div>
            <div className="text-[#002776] font-black text-2xl">
              {formatReais(premioTotal)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { pos: "1º", emoji: "🥇", pct: "50%", valor: premio1, nome: ranking[0]?.perfis?.nome?.split(" ")[0] },
              { pos: "2º", emoji: "🥈", pct: "30%", valor: premio2, nome: ranking[1]?.perfis?.nome?.split(" ")[0] },
              { pos: "3º", emoji: "🥉", pct: "20%", valor: premio3, nome: ranking[2]?.perfis?.nome?.split(" ")[0] },
            ].map(({ pos, emoji, pct, valor, nome }) => (
              <div key={pos} className="bg-[#002776] rounded-xl p-2.5 text-center">
                <div className="text-lg">{emoji}</div>
                <div className="text-[#ffdf00] font-bold text-sm">{formatReais(valor)}</div>
                <div className="text-white/70 text-[10px]">{pct}</div>
                {nome && <div className="text-white text-[10px] font-medium truncate mt-0.5">{nome}</div>}
              </div>
            ))}
          </div>
          <p className="text-[#002776]/60 text-[10px] text-center mt-2">
            +R$100 por novo participante · atualiza em tempo real
          </p>
        </div>

        {/* Minha posição */}
        {myEntry && (
          <div className="mt-3 bg-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="text-2xl font-bold text-[#ffdf00]">
              {myPosition}º
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">Sua posição</div>
              <div className="text-blue-200 text-xs">
                {myEntry.total_pontos} pts · {myEntry.acertos_exatos} exatos · {myEntry.acertos_resultado} certos
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{myEntry.total_pontos}</div>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="px-4 py-4 space-y-2">
        {ranking.map((entry, index) => {
          const isMe = entry.user_id === userId;
          const pos = index + 1;

          return (
            <div
              key={entry.user_id}
              className={cn(
                "flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border transition",
                isMe ? "border-[#009c3b] ring-1 ring-[#009c3b]/30" : "border-gray-100"
              )}
            >
              {/* Posição */}
              <div className="w-8 text-center">
                {pos <= 3 ? (
                  <span className="text-xl">{medalhas[pos - 1]}</span>
                ) : (
                  <span className="text-sm font-bold text-gray-400">{pos}º</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {entry.perfis?.avatar_url ? (
                  <Image
                    src={entry.perfis.avatar_url}
                    alt={entry.perfis.nome}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                    {entry.perfis?.nome?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>

              {/* Nome e stats */}
              <div className="flex-1 min-w-0">
                <div className={cn("font-semibold text-sm truncate", isMe && "text-[#009c3b]")}>
                  {entry.perfis?.nome ?? "—"}
                  {isMe && <span className="ml-1 text-xs font-normal text-gray-400">(você)</span>}
                </div>
                <div className="text-xs text-gray-400">
                  {entry.acertos_exatos} exatos · {entry.acertos_resultado} certos · {entry.jogos_palpitados} palpites
                </div>
              </div>

              {/* Pontos */}
              <div className={cn(
                "text-xl font-bold",
                pos === 1 ? "text-[#ffdf00]" : isMe ? "text-[#009c3b]" : "text-gray-700"
              )}>
                {entry.total_pontos}
                <span className="text-xs font-normal text-gray-400 ml-0.5">pts</span>
              </div>
            </div>
          );
        })}

        {ranking.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🏆</div>
            <p>Nenhum ponto ainda. Faça seus palpites!</p>
          </div>
        )}
      </div>
    </div>
  );
}
