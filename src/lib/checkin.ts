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

/** Consulta a planilha agora, sem cache do Next. */
export async function fetchCheckinStatsLive(): Promise<CheckinStats> {
  if (!SCRIPT_URL || !SECRET) return EMPTY_STATS;
  try {
    const res = await fetch(`${SCRIPT_URL}?secret=${encodeURIComponent(SECRET)}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json()) as Omit<CheckinStats, "disponivel">;
    if (!data.ok) throw new Error(JSON.stringify(data));
    return { ...EMPTY_STATS, ...data, disponivel: true };
  } catch (err) {
    console.error("[checkin] falha ao ler a planilha:", err);
    return EMPTY_STATS;
  }
}

/**
 * Consulta compartilhada para a página de check-in: todos os celulares recebem o mesmo
 * resultado por até 15 s, e consultas simultâneas viram uma só. Assim a planilha recebe
 * poucas leituras por minuto, não importa quantas pessoas estejam com a tela aberta.
 */
const SHARED_TTL_MS = 15_000;
let shared: { at: number; data: CheckinStats } | null = null;
let inflight: Promise<CheckinStats> | null = null;

export async function getCheckinStatsShared(): Promise<CheckinStats> {
  if (shared && Date.now() - shared.at < SHARED_TTL_MS) return shared.data;
  if (!inflight) {
    inflight = fetchCheckinStatsLive()
      .then((data) => {
        if (data.disponivel) shared = { at: Date.now(), data };
        return data.disponivel ? data : (shared?.data ?? data);
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Atualiza a contagem compartilhada com o resultado de um check-in, sem nova leitura. */
export function updateSharedToday(hoje: CheckinStats["hoje"]) {
  if (shared) shared = { ...shared, data: { ...shared.data, hoje } };
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

/*
 * Gravação em lote: os check-ins que chegam juntos são enviados numa única execução do
 * Apps Script, que grava todas as linhas de uma vez. Cada servidor envia um lote por vez,
 * então um pico de 200 pessoas vira poucas execuções no Google, longe do limite de ~30 simultâneas.
 */
const BATCH_WAIT_MS = 400;
const BATCH_MAX = 25;
type Pending = { payload: CheckinPayload; resolve: (r: CheckinResult) => void };
const queue: Pending[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let sending = false;

const OCUPADO: CheckinResult = { ok: false, erro: "ocupado", mensagem: "Muita gente fazendo check-in agora. Tentando de novo..." };

export function postCheckin(payload: CheckinPayload): Promise<CheckinResult> {
  if (!SCRIPT_URL || !SECRET) {
    return Promise.resolve({ ok: false, erro: "indisponivel", mensagem: "O check-in ainda não foi configurado." });
  }
  return new Promise((resolve) => {
    queue.push({ payload, resolve });
    if (queue.length >= BATCH_MAX && !sending) {
      if (timer) clearTimeout(timer);
      timer = null;
      void flush();
    } else {
      schedule();
    }
  });
}

function schedule() {
  if (!timer && !sending) timer = setTimeout(() => void flush(), BATCH_WAIT_MS);
}

async function flush() {
  timer = null;
  if (sending) return;
  const items = queue.splice(0, BATCH_MAX);
  if (!items.length) return;
  sending = true;
  try {
    const results = await sendBatch(items.map((i) => i.payload));
    items.forEach((item, i) => item.resolve(results[i] ?? OCUPADO));
  } finally {
    sending = false;
    if (queue.length) schedule();
  }
}

/** true quando o Apps Script publicado ainda é a versão antiga, sem suporte a lotes. */
let scriptSemLote = false;

async function sendBatch(itens: CheckinPayload[]): Promise<CheckinResult[]> {
  if (scriptSemLote || itens.length === 1) {
    // Um por vez: funciona com qualquer versão do script
    const out: CheckinResult[] = [];
    for (const item of itens) out.push((await sendRaw(item)) as CheckinResult);
    return out;
  }
  const data = (await sendRaw({ itens })) as { resultados?: CheckinResult[]; erro?: string };
  if (Array.isArray(data.resultados) && data.resultados.length === itens.length) return data.resultados;
  if (data.erro === "ocupado") return itens.map(() => OCUPADO);
  // Resposta sem "resultados": o script publicado é a versão antiga. Reenvia um por vez.
  console.warn("[checkin] Apps Script sem suporte a lote; atualize integrations/apps-script/checkin.gs na planilha.");
  scriptSemLote = true;
  return sendBatch(itens);
}

async function sendRaw(body: object): Promise<unknown> {
  try {
    const res = await fetch(SCRIPT_URL!, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...body, secret: SECRET }),
      redirect: "follow",
      signal: AbortSignal.timeout(40_000),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      // O Google devolve uma página HTML quando está sobrecarregado
      console.error("[checkin] resposta não JSON do script:", res.status, text.slice(0, 120));
      return OCUPADO;
    }
  } catch (err) {
    console.error("[checkin] falha ao gravar:", err);
    return { ok: false, erro: "ocupado", mensagem: "Conexão lenta com a planilha. Tentando de novo..." };
  }
}
