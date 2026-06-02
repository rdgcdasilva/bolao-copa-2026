"use client";

interface Props {
  modo?: "completo" | "resumo";
}

export default function RegrasBolao({ modo = "completo" }: Props) {
  if (modo === "resumo") {
    return (
      <div className="text-right text-xs text-green-200 space-y-0.5">
        <div>🏆 Exato = <strong>+3~+20pts</strong></div>
        <div>✅ Vencedor = <strong>+1~+8pts</strong></div>
        <div>💀 Invertido = <strong>-1~-5pts</strong></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-5">
      <p className="font-semibold text-[#ffdf00] text-xs text-center mb-2">📋 Regras de Pontuação</p>
      <div className="bg-white/10 rounded-xl overflow-hidden text-xs text-white">
        <div className="grid grid-cols-4 bg-white/10 font-semibold text-[10px] px-3 py-1.5 text-green-200">
          <span>Fase</span>
          <span className="text-center">🏆 Exato</span>
          <span className="text-center">✅ Vencedor</span>
          <span className="text-center">💀 Invertido</span>
        </div>
        {[
          { fase: "Grupos",    exato: "+3",  venc: "+1", inv: "-1" },
          { fase: "Oitavas",   exato: "+5",  venc: "+2", inv: "-2" },
          { fase: "Quartas",   exato: "+8",  venc: "+3", inv: "-3" },
          { fase: "Semifinal", exato: "+12", venc: "+5", inv: "-4" },
          { fase: "3º Lugar",  exato: "+12", venc: "+5", inv: "-4" },
          { fase: "Final",     exato: "+20", venc: "+8", inv: "-5" },
        ].map((r) => (
          <div key={r.fase} className="grid grid-cols-4 px-3 py-1.5 border-t border-white/10">
            <span>{r.fase}</span>
            <span className="text-center font-bold text-[#ffdf00]">{r.exato}</span>
            <span className="text-center text-green-300">{r.venc}</span>
            <span className="text-center text-red-300">{r.inv}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-green-300 text-center mt-2">
        💀 Invertido = placar exato ao contrário (ex: palpitou 2×0, saiu 0×2)
      </p>
    </div>
  );
}
