export type Fase = "grupos" | "dezesseis" | "oitavas" | "quartas" | "semis" | "terceiro" | "final";

export interface Perfil {
  id: string;
  nome: string;
  avatar_url: string | null;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Jogo {
  id: string;
  fase: Fase;
  grupo: string | null;
  time_casa: string;
  time_fora: string;
  bandeira_casa: string | null;
  bandeira_fora: string | null;
  data_hora: string;
  gols_casa: number | null;
  gols_fora: number | null;
  encerrado: boolean;
  ordem: number;
}

export interface Palpite {
  id: string;
  user_id: string;
  jogo_id: string;
  gols_casa: number;
  gols_fora: number;
  pontos: number;
  created_at: string;
  updated_at: string;
}

export interface RankingEntry {
  user_id: string;
  total_pontos: number;
  acertos_exatos: number;
  acertos_resultado: number;
  jogos_palpitados: number;
  updated_at: string;
  perfis: Perfil;
}
