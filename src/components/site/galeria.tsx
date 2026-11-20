import { Suspense } from "react";
import { Section, SectionTitle } from "./section";
import { GaleriaGrid } from "./galeria-grid";
import { listDrivePhotos } from "@/lib/drive";

/** Galeria lida da pasta pública do Google Drive (atualiza a cada 5 minutos). */
export function Galeria() {
  return (
    <Section id="galeria">
      <SectionTitle
        kicker="Galeria"
        title="A galera em ação"
        description="Fotos oficiais dos treinos. Toque no ícone de download para salvar a sua foto em alta qualidade."
      />
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
