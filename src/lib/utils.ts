import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDataHora(dataHora: string): string {
  const d = new Date(dataHora);
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function jogoAberto(dataHora: string): boolean {
  return new Date(dataHora) > new Date();
}

export function bandeiraPais(codigo: string | null): string {
  if (!codigo) return "🏳️";
  const map: Record<string, string> = {
    BR: "🇧🇷", DE: "🇩🇪", AR: "🇦🇷", FR: "🇫🇷", PT: "🇵🇹",
    ES: "🇪🇸", IT: "🇮🇹", NL: "🇳🇱", BE: "🇧🇪", HR: "🇭🇷",
    PL: "🇵🇱", CH: "🇨🇭", MX: "🇲🇽", CA: "🇨🇦", US: "🇺🇸",
    UY: "🇺🇾", CO: "🇨🇴", EC: "🇪🇨", PE: "🇵🇪", VE: "🇻🇪",
    CL: "🇨🇱", MA: "🇲🇦", SN: "🇸🇳", NG: "🇳🇬", GH: "🇬🇭",
    CM: "🇨🇲", EG: "🇪🇬", KE: "🇰🇪", JP: "🇯🇵", KR: "🇰🇷",
    SA: "🇸🇦", IR: "🇮🇷", AU: "🇦🇺", NZ: "🇳🇿", NO: "🇳🇴",
    TR: "🇹🇷", ZA: "🇿🇦", CZ: "🇨🇿", BA: "🇧🇦", QA: "🇶🇦",
    HT: "🇭🇹", PY: "🇵🇾", CI: "🇨🇮", CW: "🇨🇼", SE: "🇸🇪",
    TN: "🇹🇳", IQ: "🇮🇶", DZ: "🇩🇿", AT: "🇦🇹", JO: "🇯🇴",
    CD: "🇨🇩", UZ: "🇺🇿", PA: "🇵🇦", CV: "🇨🇻",
    "GB-ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "GB-SCT": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  };
  return map[codigo] ?? "🏳️";
}

// Pontuação por fase
export const PONTUACAO: Record<string, { exato: number; vencedor: number; invertido: number }> = {
  grupos:   { exato: 3,  vencedor: 1, invertido: -1 },
  oitavas:  { exato: 5,  vencedor: 2, invertido: -2 },
  quartas:  { exato: 8,  vencedor: 3, invertido: -3 },
  semis:    { exato: 12, vencedor: 5, invertido: -4 },
  terceiro: { exato: 12, vencedor: 5, invertido: -4 },
  final:    { exato: 20, vencedor: 8, invertido: -5 },
};

export function labelFase(fase: string): string {
  const map: Record<string, string> = {
    grupos: "Fase de Grupos",
    oitavas: "Oitavas de Final",
    quartas: "Quartas de Final",
    semis: "Semifinal",
    terceiro: "3º Lugar",
    final: "Final",
  };
  return map[fase] ?? fase;
}
