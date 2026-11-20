/** Tipos compartilhados entre o servidor e o navegador (sem dependências de servidor). */

export type TreinoDia = { data: string; adultos: number; criancas: number; total: number };

export type Corredor = {
  nome: string;
  /** Presenças no total */
  presencas: number;
  /** Presenças no mês atual */
  mes: number;
  primeiro: string;
  ultimo: string;
};

export type CheckinStats = {
  ok: boolean;
  /** false quando o check-in ainda não foi configurado ou a planilha não respondeu */
  disponivel: boolean;
  aberto: boolean;
  exigeCodigo: boolean;
  config: { dia_semana: number; abre: string; fecha: string; seguidores_instagram: number };
  hoje: TreinoDia;
  treinos: TreinoDia[];
  corredores: Corredor[];
};

/** O que a página de check-in recebe (só o necessário). */
export type CheckinPublic = Pick<CheckinStats, "disponivel" | "aberto" | "exigeCodigo" | "config" | "hoje"> & {
  nomes: string[];
};

export type CheckinPayload = {
  tipo: "Adulto" | "Criança";
  nome: string;
  responsavel?: string;
  codigo?: string;
  consentimento: boolean;
  origem?: "qr" | "site";
};

export type CheckinResult =
  | { ok: true; duplicado: boolean; nome: string; tipo: string; hoje: TreinoDia }
  | { ok: false; erro: string; mensagem?: string };

export const DIAS = ["", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"];

/** "2026-11-19" -> "19/11" */
export function formatDataBR(iso: string) {
  const [, m, d] = iso.split("-");
  return d && m ? `${d}/${m}` : iso;
}
