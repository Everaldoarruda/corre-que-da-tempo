import { revalidateTag } from "next/cache";
import { CHECKIN_TAG, fetchCheckinStatsLive, postCheckin, toPublic } from "@/lib/checkin";
import type { CheckinPayload } from "@/lib/checkin-types";

/** Estado atual do check-in (aberto, contagem de hoje, nomes para sugestão). */
export async function GET() {
  const stats = await fetchCheckinStatsLive();
  return Response.json(toPublic(stats), { headers: { "Cache-Control": "no-store" } });
}

/** Registra um check-in na planilha. */
export async function POST(request: Request) {
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
  if (result.ok && !result.duplicado) revalidateTag(CHECKIN_TAG, "max");
  return Response.json(result, { status: result.ok ? 200 : 422, headers: { "Cache-Control": "no-store" } });
}
