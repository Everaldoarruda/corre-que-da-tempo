/** Helpers sem dependência de servidor, usados pelo componente da galeria no navegador. */
export type DrivePhoto = { id: string; name: string };

/** JPEG gerado pelo Google na largura pedida (funciona também para arquivos RAW). */
export function drivePhotoUrl(id: string, width: number) {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

/** Nome do arquivo baixado: sempre .jpg, já que o download é a versão JPEG. */
export function downloadName(name: string) {
  return name.replace(/\.[^.]+$/, "") + ".jpg";
}

/** Endereço direto do JPEG no Google, que libera download pelo navegador (CORS).
 * Não é um endereço documentado pelo Google: por isso há a rota /api/fotos como reserva. */
export function driveDirectUrl(id: string, width: number) {
  return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

/** Rota do próprio site que baixa a foto pelo servidor (reserva). */
export function downloadProxyUrl(photo: DrivePhoto) {
  return `/api/fotos/${photo.id}`;
}
