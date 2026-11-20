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
  if (result.ok) {
    updateSharedToday(result.hoje);
    if (!result.duplicado) revalidateTag(CHECKIN_TAG, "max");
  }
  const status = result.ok ? 200 : result.erro === "ocupado" ? 503 : 422;
  return Response.json(result, { status, headers: { "Cache-Control": "no-store" } });
}
