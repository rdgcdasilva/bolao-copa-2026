"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Jogo, Perfil, Fase } from "@/types";
import { formatDataHora, bandeiraPais, labelFase, cn } from "@/lib/utils";
import { XCircle, RefreshCw, PlusCircle, Trash2 } from "lucide-react";
import RegrasBolao from "@/components/RegrasBolao";

interface Props {
  jogos: Jogo[];
  participantes: Partial<Perfil>[];
}

const FASES_MATA_MATA: { value: Fase; label: string }[] = [
  { value: "dezesseis", label: "16-avos de Final" },
  { value: "oitavas", label: "Oitavas de Final" },
  { value: "quartas", label: "Quartas de Final" },
  { value: "semis", label: "Semifinal" },
  { value: "terceiro", label: "3º Lugar" },
  { value: "final", label: "Final" },
];

const PAISES: { codigo: string; nome: string }[] = [
  { codigo: "BR", nome: "Brasil" }, { codigo: "AR", nome: "Argentina" },
  { codigo: "FR", nome: "França" }, { codigo: "DE", nome: "Alemanha" },
  { codigo: "PT", nome: "Portugal" }, { codigo: "ES", nome: "Espanha" },
  { codigo: "NL", nome: "Holanda" }, { codigo: "BE", nome: "Bélgica" },
  { codigo: "GB-ENG", nome: "Inglaterra" }, { codigo: "IT", nome: "Itália" },
  { codigo: "HR", nome: "Croácia" }, { codigo: "CH", nome: "Suíça" },
  { codigo: "MX", nome: "México" }, { codigo: "CA", nome: "Canadá" },
  { codigo: "US", nome: "EUA" }, { codigo: "UY", nome: "Uruguai" },
  { codigo: "CO", nome: "Colômbia" }, { codigo: "EC", nome: "Equador" },
  { codigo: "MA", nome: "Marrocos" }, { codigo: "SN", nome: "Senegal" },
  { codigo: "NG", nome: "Nigéria" }, { codigo: "GH", nome: "Gana" },
  { codigo: "EG", nome: "Egito" }, { codigo: "JP", nome: "Japão" },
  { codigo: "KR", nome: "Coreia do Sul" }, { codigo: "SA", nome: "Arábia Saudita" },
  { codigo: "IR", nome: "Irã" }, { codigo: "AU", nome: "Austrália" },
  { codigo: "NZ", nome: "Nova Zelândia" }, { codigo: "NO", nome: "Noruega" },
  { codigo: "TR", nome: "Turquia" }, { codigo: "ZA", nome: "África do Sul" },
  { codigo: "CZ", nome: "Rep. Tcheca" }, { codigo: "BA", nome: "Bósnia" },
  { codigo: "QA", nome: "Qatar" }, { codigo: "GB-SCT", nome: "Escócia" },
  { codigo: "HT", nome: "Haiti" }, { codigo: "PY", nome: "Paraguai" },
  { codigo: "CI", nome: "Costa do Marfim" }, { codigo: "CW", nome: "Curaçao" },
  { codigo: "SE", nome: "Suécia" }, { codigo: "TN", nome: "Tunísia" },
  { codigo: "IQ", nome: "Iraque" }, { codigo: "DZ", nome: "Argélia" },
  { codigo: "AT", nome: "Áustria" }, { codigo: "JO", nome: "Jordânia" },
  { codigo: "CD", nome: "Rep. Dem. Congo" }, { codigo: "UZ", nome: "Uzbequistão" },
  { codigo: "PA", nome: "Panamá" }, { codigo: "CV", nome: "Cabo Verde" },
  { codigo: "KE", nome: "Quênia" },
];

export default function AdminClient({ jogos, participantes }: Props) {
  const [aba, setAba] = useState<"jogos" | "participantes" | "novojogo">("jogos");
  const [jogosState, setJogosState] = useState<Jogo[]>(jogos);
  const [editando, setEditando] = useState<{ jogoId: string; casa: string; fora: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Novo jogo
  const [novoJogo, setNovoJogo] = useState({
    fase: "oitavas" as Fase,
    time_casa: "",
    bandeira_casa: "",
    time_fora: "",
    bandeira_fora: "",
    data: "",
    hora: "",
  });
  const [salvandoNovo, setSalvandoNovo] = useState(false);

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
      await supabase.rpc("calcular_pontos", { jogo_id_param: editando.jogoId });
      setJogosState((prev) =>
        prev.map((j) => j.id === editando.jogoId ? { ...j, gols_casa: casa, gols_fora: fora, encerrado: true } : j)
      );
      setEditando(null);
      showToast("✅ Resultado salvo e pontos calculados!");
    } else {
      showToast("❌ Erro ao salvar resultado.");
    }
    setSalvando(false);
  }

  async function reabrirJogo(jogoId: string) {
    await supabase.from("jogos").update({ gols_casa: null, gols_fora: null, encerrado: false }).eq("id", jogoId);
    setJogosState((prev) => prev.map((j) => j.id === jogoId ? { ...j, gols_casa: null, gols_fora: null, encerrado: false } : j));
    showToast("🔄 Jogo reaberto.");
  }

  async function apagarJogo(jogoId: string, fase: string) {
    if (fase === "grupos") {
      showToast("❌ Jogos da fase de grupos não podem ser apagados.");
      return;
    }
    if (!confirm("Apagar este jogo? Os palpites também serão removidos.")) return;
    const { error } = await supabase.from("jogos").delete().eq("id", jogoId);
    if (!error) {
      setJogosState((prev) => prev.filter((j) => j.id !== jogoId));
      showToast("🗑️ Jogo apagado.");
    } else {
      showToast("❌ Erro ao apagar jogo.");
    }
  }

  async function toggleAdmin(userId: string, atual: boolean) {
    await supabase.from("perfis").update({ is_admin: !atual }).eq("id", userId);
    showToast(atual ? "Admin removido." : "✅ Admin adicionado!");
  }

  async function criarNovoJogo() {
    if (!novoJogo.time_casa || !novoJogo.time_fora || !novoJogo.data || !novoJogo.hora) {
      showToast("❌ Preencha todos os campos!");
      return;
    }

    setSalvandoNovo(true);
    const data_hora = `${novoJogo.data}T${novoJogo.hora}:00-03:00`;
    const maxOrdem = Math.max(...jogosState.map((j) => j.ordem), 0);

    const { data, error } = await supabase
      .from("jogos")
      .insert({
        fase: novoJogo.fase,
        grupo: null,
        time_casa: novoJogo.time_casa,
        time_fora: novoJogo.time_fora,
        bandeira_casa: novoJogo.bandeira_casa || null,
        bandeira_fora: novoJogo.bandeira_fora || null,
        data_hora,
        ordem: maxOrdem + 1,
        encerrado: false,
      })
      .select()
      .single();

    if (!error && data) {
      setJogosState((prev) => [...prev, data]);
      setNovoJogo({ fase: "oitavas", time_casa: "", bandeira_casa: "", time_fora: "", bandeira_fora: "", data: "", hora: "" });
      showToast("✅ Jogo criado!");
      setAba("jogos");
    } else {
      showToast("❌ Erro ao criar jogo.");
    }
    setSalvandoNovo(false);
  }

  const fases = Array.from(new Set(jogosState.map((j) => j.fase)));

  return (
    <div className="max-w-lg mx-auto">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#002776] px-4 pt-12 pb-4">
        <h1 className="text-white font-bold text-xl">🛡️ Painel Admin</h1>

        {/* Regras de pontuação */}
        <RegrasBolao />

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {[
            { id: "jogos", label: `Jogos (${jogosState.length})` },
            { id: "novojogo", label: "+ Novo Jogo" },
            { id: "participantes", label: `Participantes (${participantes.length})` },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setAba(id as typeof aba)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition",
                aba === id ? "bg-[#ffdf00] text-[#002776]" : "bg-white/20 text-white")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">

        {/* ABA NOVO JOGO */}
        {aba === "novojogo" && (
          <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm space-y-4">
            <h2 className="font-bold text-[#002776] flex items-center gap-2">
              <PlusCircle size={18} /> Adicionar Jogo do Mata-mata
            </h2>

            <div>
              <label className="text-xs text-gray-500 font-medium">Fase</label>
              <select value={novoJogo.fase}
                onChange={(e) => setNovoJogo({ ...novoJogo, fase: e.target.value as Fase })}
                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#002776]">
                {FASES_MATA_MATA.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Time Casa</label>
                <select value={novoJogo.bandeira_casa}
                  onChange={(e) => {
                    const p = PAISES.find((p) => p.codigo === e.target.value);
                    setNovoJogo({ ...novoJogo, bandeira_casa: e.target.value, time_casa: p?.nome ?? "" });
                  }}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#002776]">
                  <option value="">Selecione...</option>
                  {PAISES.map((p) => <option key={p.codigo} value={p.codigo}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Time Fora</label>
                <select value={novoJogo.bandeira_fora}
                  onChange={(e) => {
                    const p = PAISES.find((p) => p.codigo === e.target.value);
                    setNovoJogo({ ...novoJogo, bandeira_fora: e.target.value, time_fora: p?.nome ?? "" });
                  }}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#002776]">
                  <option value="">Selecione...</option>
                  {PAISES.map((p) => <option key={p.codigo} value={p.codigo}>{p.nome}</option>)}
                </select>
              </div>
            </div>

            {novoJogo.time_casa && novoJogo.time_fora && (
              <div className="text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl py-2">
                {bandeiraPais(novoJogo.bandeira_casa)} {novoJogo.time_casa} × {novoJogo.time_fora} {bandeiraPais(novoJogo.bandeira_fora)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Data</label>
                <input type="date" value={novoJogo.data}
                  onChange={(e) => setNovoJogo({ ...novoJogo, data: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#002776]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Horário (Brasília)</label>
                <input type="time" value={novoJogo.hora}
                  onChange={(e) => setNovoJogo({ ...novoJogo, hora: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#002776]" />
              </div>
            </div>

            <button onClick={criarNovoJogo} disabled={salvandoNovo}
              className="w-full h-12 bg-[#009c3b] text-white rounded-xl font-semibold text-sm disabled:opacity-60">
              {salvandoNovo ? "Criando..." : "✅ Criar Jogo"}
            </button>
          </div>
        )}

        {/* ABA JOGOS */}
        {aba === "jogos" && (
          <div className="space-y-6">
            {fases.map((fase) => (
              <div key={fase}>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{labelFase(fase)}</h2>
                <div className="space-y-2">
                  {jogosState.filter((j) => j.fase === fase).map((jogo) => (
                    <div key={jogo.id} className={cn("bg-white rounded-2xl border p-4 shadow-sm",
                      jogo.encerrado ? "border-gray-200 opacity-80" : "border-blue-200")}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{formatDataHora(jogo.data_hora)}</span>
                        {jogo.encerrado && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Encerrado</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{bandeiraPais(jogo.bandeira_casa)}</span>
                          <span className="text-sm font-semibold text-gray-700 truncate">{jogo.time_casa}</span>
                        </div>
                        <div className="mx-2 text-center font-bold text-gray-400 text-sm">
                          {jogo.encerrado ? `${jogo.gols_casa} × ${jogo.gols_fora}` : "vs"}
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-sm font-semibold text-gray-700 truncate">{jogo.time_fora}</span>
                          <span className="text-lg">{bandeiraPais(jogo.bandeira_fora)}</span>
                        </div>
                      </div>

                      {editando?.jogoId === jogo.id ? (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2">
                          <input type="number" inputMode="numeric" min={0} value={editando.casa}
                            onChange={(e) => setEditando({ ...editando, casa: e.target.value })}
                            className="w-12 h-10 text-center font-bold border-2 border-[#002776] rounded-lg focus:outline-none" />
                          <span className="text-gray-400">×</span>
                          <input type="number" inputMode="numeric" min={0} value={editando.fora}
                            onChange={(e) => setEditando({ ...editando, fora: e.target.value })}
                            className="w-12 h-10 text-center font-bold border-2 border-[#002776] rounded-lg focus:outline-none" />
                          <button onClick={salvarResultado} disabled={salvando}
                            className="flex-1 h-10 bg-[#009c3b] text-white rounded-lg text-sm font-semibold">
                            {salvando ? "…" : "Confirmar"}
                          </button>
                          <button onClick={() => setEditando(null)}
                            className="h-10 w-10 flex items-center justify-center text-gray-400 border rounded-lg">
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          <button onClick={() => setEditando({ jogoId: jogo.id, casa: String(jogo.gols_casa ?? ""), fora: String(jogo.gols_fora ?? "") })}
                            className="flex-1 h-9 bg-[#002776] text-white rounded-lg text-xs font-semibold">
                            {jogo.encerrado ? "Corrigir placar" : "Inserir resultado"}
                          </button>
                          {jogo.encerrado && (
                            <button onClick={() => reabrirJogo(jogo.id)} title="Reabrir jogo"
                              className="h-9 w-9 flex items-center justify-center text-gray-400 border rounded-lg">
                              <RefreshCw size={16} />
                            </button>
                          )}
                          {jogo.fase !== "grupos" && (
                            <button onClick={() => apagarJogo(jogo.id, jogo.fase)} title="Apagar jogo"
                              className="h-9 w-9 flex items-center justify-center text-red-400 border border-red-200 rounded-lg">
                              <Trash2 size={16} />
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
                <button onClick={() => toggleAdmin(p.id!, p.is_admin!)}
                  className={cn("px-3 py-1 rounded-full text-xs font-semibold transition",
                    p.is_admin ? "bg-[#ffdf00] text-[#002776]" : "bg-gray-100 text-gray-500")}>
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
