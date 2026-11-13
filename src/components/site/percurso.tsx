"use client";

import Image from "next/image";
import { Flag, MapPin, Route, Timer, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionTitle, Reveal } from "./section";
import { RouteMap } from "./route-map";
import { SITE } from "@/lib/config";
import { ROUTE_DISTANCE_M, START, TURNAROUND } from "@/lib/route";

const distanceKm = (ROUTE_DISTANCE_M / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 });

const steps = [
  { icon: <Flag />, title: START.name, sub: "Linha do Tiro • Início / Final" },
  { icon: <Navigation />, title: "Ida", sub: "Pelas ruas da Linha do Tiro até Beberibe" },
  { icon: <MapPin />, title: TURNAROUND.name, sub: "Beberibe • Ponto de retorno" },
  { icon: <Timer />, title: "Volta", sub: `${distanceKm} km no total com apoio da equipe` },
];

const directionsUrl =
  `https://www.google.com/maps/dir/?api=1&travelmode=walking` +
  `&origin=${START.lat},${START.lng}&destination=${START.lat},${START.lng}` +
  `&waypoints=${TURNAROUND.lat},${TURNAROUND.lng}`;

export function Percurso() {
  return (
    <Section id="percurso" className="bg-black/40">
      <SectionTitle
        kicker="Percurso"
        title="Roteiro da corrida"
        description={`${START.name} (Linha do Tiro) até a ${TURNAROUND.name} (Beberibe) e volta. Trajeto real pelas ruas, cerca de ${distanceKm} km, com apoio da comunidade e da nossa equipe.`}
      />

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Mapa real (OpenStreetMap) com traçado e corredor animados */}
        <Reveal className="relative overflow-hidden rounded-xl border border-border bg-card p-3">
          <RouteMap />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <Stat label="Concentração" value={SITE.concentration} />
            <Stat label="Saída" value={SITE.start} />
            <Stat label="Distância" value={`${distanceKm} km`} />
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <Card>
                <CardContent className="flex items-center gap-4 py-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand text-black [&_svg]:size-5">{s.icon}</span>
                  <div>
                    <p className="font-heading text-lg">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
          <Reveal delay={0.4}>
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border">
              <Image src="/img/percurso.webp" alt="Arte oficial do roteiro da corrida" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </div>
            <div className="mt-4 grid gap-2">
              <Button className="w-full font-semibold" size="lg" nativeButton={false} render={<a href={directionsUrl} target="_blank" rel="noopener noreferrer" />}>
                <Route data-icon="inline-start" />
                Ver trajeto no Google Maps
              </Button>
              <Button variant="outline" className="w-full" nativeButton={false} render={<a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" />}>
                <MapPin data-icon="inline-start" />
                Ponto de encontro
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/50 py-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl text-brand">{value}</p>
    </div>
  );
}
