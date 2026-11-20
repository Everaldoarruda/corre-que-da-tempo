import { cacheLife } from "next/cache";
import type { DrivePhoto } from "./drive-urls";

export type { DrivePhoto };

/**
 * Galeria lida direto de uma pasta pública do Google Drive.
 * O fotógrafo só sobe as fotos na pasta; o site relê a lista a cada 5 minutos.
 *
 * - Com GOOGLE_API_KEY definida: usa a Drive API v3 oficial.
 * - Sem chave: usa a listagem pública da pasta (embeddedfolderview), que não é
 *   uma API oficial do Google e pode mudar. Defina a chave em produção.
 */
export const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID ?? "1-ASgh0ZXfT7l7VaOdPe4Ttcbv5VRu9NE";

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif|arw|cr2|cr3|nef|dng|raf|orf|rw2)$/i;

export async function listDrivePhotos(folderId: string = DRIVE_FOLDER_ID): Promise<DrivePhoto[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });

  try {
    const key = process.env.GOOGLE_API_KEY;
    const photos = key ? await viaApi(folderId, key) : await viaEmbed(folderId);
    // Ordem do nome do arquivo = ordem em que a câmera fotografou
    return photos.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true }));
  } catch (err) {
    console.error("[galeria] falha ao ler a pasta do Drive:", err);
    return [];
  }
}

async function viaApi(folderId: string, key: string): Promise<DrivePhoto[]> {
  const out: DrivePhoto[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: "nextPageToken, files(id, name)",
      pageSize: "1000",
      key,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { files: DrivePhoto[]; nextPageToken?: string };
    out.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return out;
}

async function viaEmbed(folderId: string): Promise<DrivePhoto[]> {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`);
  if (!res.ok) throw new Error(`embeddedfolderview ${res.status}`);
  const html = await res.text();
  const out: DrivePhoto[] = [];
  const entry = /id="entry-([\w-]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?class="flip-entry-title">([^<]+)</g;
  for (const m of html.matchAll(entry)) {
    const [, id, href, rawName] = m;
    if (href.includes("/folders/")) continue; // subpastas são ignoradas
    const name = decodeEntities(rawName.trim());
    if (IMAGE_EXT.test(name)) out.push({ id, name });
  }
  return out;
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
