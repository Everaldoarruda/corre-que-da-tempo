"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Camera } from "lucide-react";
import { Instagram } from "./icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Section, SectionTitle } from "./section";
import { gallery } from "@/lib/data";
import { SITE } from "@/lib/config";

export function Galeria() {
  const [active, setActive] = useState<(typeof gallery)[number] | null>(null);

  return (
    <Section id="galeria">
      <SectionTitle
        kicker="Galeria"
        title="A galera em ação"
        description="Registros dos treinos. Substitua os arquivos em public/img/galeria pelas fotos oficiais."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {gallery.map((g, i) => (
          <motion.button
            key={g.id}
            type="button"
            onClick={() => setActive(g)}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            className={`group relative overflow-hidden rounded-xl border border-border bg-card text-left ${
              i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""
            } aspect-square`}
            aria-label={g.caption}
          >
            <Image src={g.src} alt={g.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <p className="absolute bottom-3 left-3 translate-y-2 text-sm font-semibold opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
              <Camera className="mr-1 inline size-4 text-brand" />
              {g.caption}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" size="lg" nativeButton={false} render={<a href={SITE.instagram} target="_blank" rel="noopener noreferrer" />}>
          <Instagram data-icon="inline-start" />
          Ver mais no Instagram
        </Button>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0" showCloseButton>
          {active && (
            <div className="relative aspect-square w-full md:aspect-[4/3]">
              <Image src={active.src} alt={active.alt} fill className="object-contain" />
              <DialogTitle className="absolute bottom-0 inset-x-0 bg-black/70 p-4 font-heading text-xl">
                {active.caption}
              </DialogTitle>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}
