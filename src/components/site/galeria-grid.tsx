"use client";

/* eslint-disable @next/next/no-img-element -- imagens servidas direto pelo Google Drive, sem passar pelo otimizador do Next */
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Download, Loader2, ImageOff } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { drivePhotoUrl, driveDirectUrl, downloadProxyUrl, downloadName, type DrivePhoto } from "@/lib/drive-urls";

const PAGE = 24;
/** Largura do JPEG baixado: ~3 MB, nítido para redes sociais e impressão 15x20. */
const DOWNLOAD_WIDTH = 2400;
const THUMB_WIDTH = 600;
const VIEW_WIDTH = 1600;

export function GaleriaGrid({ photos }: { photos: DrivePhoto[] }) {
  const [visible, setVisible] = useState(PAGE);
  const [active, setActive] = useState<number | null>(null);

  const go = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [active, go]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
        <ImageOff className="size-8" />
        <p>As fotos do último treino estão chegando. Volte daqui a pouco.</p>
      </div>
    );
  }

  const current = active === null ? null : photos[active];

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{photos.length} fotos</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {photos.slice(0, visible).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
            className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-card"
          >
            <button
              type="button"
              onClick={() => setActive(i)}
              className="absolute inset-0 size-full"
              aria-label={`Ampliar foto ${p.name}`}
            >
              <img
                src={drivePhotoUrl(p.id, THUMB_WIDTH)}
                alt={`Treino Corre que dá Tempo - ${p.name}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </button>
            <DownloadButton photo={p} className="absolute right-2 top-2" />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {visible < photos.length && (
          <Button size="lg" onClick={() => setVisible((v) => v + PAGE)} className="font-semibold">
            Carregar mais fotos ({photos.length - visible})
          </Button>
        )}
      </div>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[95svh] max-w-4xl overflow-hidden bg-black p-0 sm:max-w-4xl" showCloseButton>
          {current && (
            <div className="flex flex-col">
              <div className="relative flex h-[75svh] items-center justify-center">
                <img
                  key={current.id}
                  src={drivePhotoUrl(current.id, VIEW_WIDTH)}
                  alt={`Treino Corre que dá Tempo - ${current.name}`}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
                <Button size="icon-lg" variant="secondary" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full" onClick={() => go(-1)} aria-label="Foto anterior">
                  <ChevronLeft />
                </Button>
                <Button size="icon-lg" variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full" onClick={() => go(1)} aria-label="Próxima foto">
                  <ChevronRight />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border p-3">
                <DialogTitle className="truncate text-sm font-sans font-medium normal-case tracking-normal text-muted-foreground">
                  Foto {active! + 1} de {photos.length}
                </DialogTitle>
                <DownloadButton photo={current} withLabel />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Baixa o JPEG em 2400px direto do Google (o Google libera CORS nesse endereço),
 * então o download não passa pelo servidor do site. Se falhar, usa a rota /api/fotos do site.
 */
function DownloadButton({ photo, withLabel, className }: { photo: DrivePhoto; withLabel?: boolean; className?: string }) {
  const [busy, setBusy] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy(true);
    try {
      const res = await fetch(driveDirectUrl(photo.id, DOWNLOAD_WIDTH), { referrerPolicy: "no-referrer" });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = downloadName(photo.name);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
    } catch {
      window.location.href = downloadProxyUrl(photo);
    } finally {
      setBusy(false);
    }
  }

  const Icon = busy ? Loader2 : Download;
  return withLabel ? (
    <Button onClick={onClick} disabled={busy} className="shrink-0 font-semibold">
      <Icon data-icon="inline-start" className={busy ? "animate-spin" : undefined} />
      Baixar foto
    </Button>
  ) : (
    <Button
      onClick={onClick}
      disabled={busy}
      size="icon"
      className={`rounded-full shadow-lg shadow-black/40 ${className ?? ""}`}
      aria-label={`Baixar foto ${photo.name}`}
      title="Baixar foto em alta qualidade"
    >
      <Icon className={busy ? "animate-spin" : undefined} />
    </Button>
  );
}
