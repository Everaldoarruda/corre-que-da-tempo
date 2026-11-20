import { Suspense } from "react";
import { Section, SectionTitle } from "./section";
import { GaleriaGrid } from "./galeria-grid";
import { ShieldCheck } from "lucide-react";
import { listDrivePhotos } from "@/lib/drive";
import { whatsappLink } from "@/lib/config";

/** Galeria lida da pasta pública do Google Drive (atualiza a cada 5 minutos). */
export function Galeria() {
  return (
    <Section id="galeria">
      <SectionTitle
        kicker="Galeria"
        title="A galera em ação"
        description="Fotos oficiais dos treinos. Toque no ícone de download para salvar a sua foto em alta qualidade."
      />
      <p className="mb-6 flex items-start gap-2 rounded-lg border border-border bg-card/60 p-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
        <span>
          Os treinos são fotografados e as fotos ficam públicas nesta galeria, conforme a LGPD. Não quer aparecer em
          alguma foto?{" "}
          <a
            href={whatsappLink("Olá! Quero pedir a remoção de uma foto minha da galeria do site. Nome do arquivo ou descrição da foto: ")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Peça a remoção pelo WhatsApp
          </a>
          .
        </span>
      </p>
      <Suspense fallback={<GaleriaSkeleton />}>
        <GaleriaFotos />
      </Suspense>
    </Section>
  );
}

async function GaleriaFotos() {
  const photos = await listDrivePhotos();
  return <GaleriaGrid photos={photos} />;
}

function GaleriaSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-card" />
      ))}
    </div>
  );
}
