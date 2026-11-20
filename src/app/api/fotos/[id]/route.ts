import { drivePhotoUrl, downloadName } from "@/lib/drive-urls";

/**
 * Reserva para o download da galeria: busca o JPEG de 2400px no Google pelo servidor
 * e devolve como anexo. Só é usada se o download direto do navegador falhar.
 * GET /api/fotos/{id}?nome=DSC0001.ARW
 */
const ID = /^[\w-]{20,64}$/;
const WIDTH = 2400;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID.test(id)) return new Response("ID inválido", { status: 400 });

  const nome = new URL(request.url).searchParams.get("nome") ?? `foto-${id}.jpg`;
  const upstream = await fetch(drivePhotoUrl(id, WIDTH), { redirect: "follow" });
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !type.startsWith("image/")) {
    return new Response("Foto não encontrada", { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${downloadName(nome).replace(/[^\w.-]/g, "_")}"`,
      // O ID de um arquivo no Drive nunca muda de conteúdo: pode ficar em cache por 30 dias
      "Cache-Control": "public, max-age=2592000, immutable",
    },
  });
}
