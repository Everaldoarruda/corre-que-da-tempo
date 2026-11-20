import { cacheLife, cacheTag } from "next/cache";
import type { CheckinPayload, CheckinResult, CheckinStats, CheckinPublic } from "./checkin-types";

/**
 * Check-in lido e gravado numa planilha do Google por um Apps Script
 * (integrations/apps-script/checkin.gs). Sem banco de dados.
 *
 *   CHECKIN_SCRIPT_URL  URL do App da Web do Apps Script
 *   CHECKIN_SECRET      segredo gerado pela função setup() do script
 */
const SCRIPT_URL = process.env.CHECKIN_SCRIPT_URL;
const SECRET = process.env.CHECKIN_SECRET;

export const CHECKIN_TAG = "checkin";

export const EMPTY_STATS: CheckinStats = {
  ok: false,
  disponivel: false,
  aberto: false,
  exigeCodigo: false,
  config: { dia_semana: 3, abre: "19:30", fecha: "21:30", seguidores_instagram: 1227 },
  hoje: { data: "", adultos: 0, criancas: 0, total: 0 },
  treinos: [],
  corredores: [],
};

export function checkinConfigurado() {
  return Boolean(SCRIPT_URL && SECRET);
}

/** Consulta a planilha agora, sem cache (para a página de check-in). */
export async function fetchCheckinStatsLive(): Promise<CheckinStats> {
  if (!SCRIPT_URL || !SECRET) return EMPTY_STATS;
  try {
    const res = await fetch(`${SCRIPT_URL}?secret=${encodeURIComponent(SECRET)}`, { redirect: "follow" });
    const data = (await res.json()) as Omit<CheckinStats, "disponivel">;
    if (!data.ok) throw new Error(JSON.stringify(data));
    return { ...EMPTY_STATS, ...data, disponivel: true };
  } catch (err) {
    console.error("[checkin] falha ao ler a planilha:", err);
    return EMPTY_STATS;
  }
}

/** Mesma consulta com cache de 1 minuto (para a página inicial). Invalidada a cada novo check-in. */
export async function getCheckinStats(): Promise<CheckinStats> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });
  cacheTag(CHECKIN_TAG);
  return fetchCheckinStatsLive();
}

export function toPublic(s: CheckinStats): CheckinPublic {
  return {
    disponivel: s.disponivel,
    aberto: s.aberto,
    exigeCodigo: s.exigeCodigo,
    config: s.config,
    hoje: s.hoje,
    nomes: s.corredores.map((c) => c.nome).sort((a, b) => a.localeCompare(b, "pt-BR")),
  };
}

export async function postCheckin(payload: CheckinPayload): Promise<CheckinResult> {
  if (!SCRIPT_URL || !SECRET) return { ok: false, erro: "indisponivel", mensagem: "O check-in ainda não foi configurado." };
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, secret: SECRET }),
      redirect: "follow",
    });
    return (await res.json()) as CheckinResult;
  } catch (err) {
    console.error("[checkin] falha ao gravar:", err);
    return { ok: false, erro: "rede", mensagem: "Não foi possível registrar agora. Tente de novo em instantes." };
  }
}
