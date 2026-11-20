import { revalidateTag } from "next/cache";
import { CHECKIN_TAG, getCheckinStatsShared, postCheckin, toPublic, updateSharedToday } from "@/lib/checkin";
import type { CheckinPayload } from "@/lib/checkin-types";

/** Estado atual do check-in (aberto, contagem de hoje, nomes para sugestão). */
export async function GET() {
  const stats = await getCheckinStatsShared();
  return Response.json(toPublic(stats), {
    headers: {
      // A CDN da Vercel serve a mesma resposta a todos por 15 s
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
    },
  });
}

/*
 * Proteções contra abuso:
 * - Só aceita envios feitos pelo próprio site (cabeçalho Origin do navegador).
 * - Limita excesso por endereço de internet. O limite é folgado de propósito: na concentração,
 *   muitos celulares da mesma operadora podem sair pelo mesmo endereço.
 * - Contra check-in feito de casa, ligue o código do dia na aba Config da planilha.
 */
const LIMITE_POR_IP = Number(process.env.CHECKIN_LIMITE_POR_IP ?? 40); // só aumente para teste de carga local
const JANELA_MS = 60_000;
const tentativas = new Map<string, { n: number; ate: number }>();

function excedeuLimite(ip: string) {
  const agora = Date.now();
  if (tentativas.size > 5_000) {
    for (const [k, v] of tentativas) if (v.ate < agora) tentativas.delete(k);
  }
  const t = tentativas.get(ip);
  if (!t || t.ate < agora) {
    tentativas.set(ip, { n: 1, ate: agora + JANELA_MS });
    return false;
  }
  t.n++;
  return t.n > LIMITE_POR_IP;
}

function origemValida(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Registra um check-in na planilha. */
export async function POST(request: Request) {
  if (!origemValida(request)) {
    return Response.json({ ok: false, erro: "origem", mensagem: "Faça o check-in pelo site." }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (excedeuLimite(ip)) {
    return Response.json(
      { ok: false, erro: "limite", mensagem: "Muitas tentativas seguidas. Espere um minuto e tente de novo." },
      { status: 429 },
    );
  }
  if (Number(request.headers.get("content-length") ?? 0) > 2_000) {
    return Response.json({ ok: false, erro: "grande" }, { status: 413 });
  }

  let body: Partial<CheckinPayload>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "json_invalido" }, { status: 400 });
  }

  const str = (v: unknown, max = 60) => (typeof v === "string" ? v.slice(0, max) : "");
  const payload: CheckinPayload = {
    tipo: body.tipo === "Criança" ? "Criança" : "Adulto",
    nome: str(body.nome),
    responsavel: str(body.responsavel),
    codigo: str(body.codigo, 30),
    consentimento: body.consentimento === true,
    origem: body.origem === "qr" ? "qr" : "site",
  };

  const result = await postCheckin(payload);
  if (result.ok) {
    updateSharedToday(result.hoje);
    if (!result.duplicado) revalidateTag(CHECKIN_TAG, "max");
  }
  const status = result.ok ? 200 : result.erro === "ocupado" ? 503 : 422;
  return Response.json(result, { status, headers: { "Cache-Control": "no-store" } });
}
