"use client";

import { useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Megaphone } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ads } from "@/lib/data";
import { Reveal } from "./section";

/** Carrossel de anúncios dos fornecedores (autoplay, pausa ao passar o mouse). */
export function Anuncios() {
  const [plugin] = useState(() => Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
      <Reveal>
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Megaphone className="size-4 text-brand" /> Parceiros e fornecedores
        </div>
        <Carousel plugins={[plugin]} opts={{ loop: true, align: "start" }} className="w-full">
          <CarouselContent>
            {ads.map((ad) => (
              <CarouselItem key={ad.id} className="md:basis-1/2">
                <a
                  href={ad.href}
                  className="group relative block aspect-[12/5] overflow-hidden rounded-xl border border-border bg-card"
                >
                  <Image
                    src={ad.image}
                    alt={ad.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                    <div>
                      <p className="font-heading text-2xl text-brand">{ad.title}</p>
                      <p className="text-sm text-zinc-200">{ad.subtitle}</p>
                    </div>
                    <Button size="sm" className="shrink-0 font-semibold">{ad.cta}</Button>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 hidden md:inline-flex" />
          <CarouselNext className="-right-3 hidden md:inline-flex" />
        </Carousel>
      </Reveal>
    </div>
  );
}
