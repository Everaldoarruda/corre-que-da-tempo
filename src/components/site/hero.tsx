"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { animate, stagger } from "animejs";
import { CalendarDays, Clock, MapPin, Shirt, ArrowDown } from "lucide-react";
import { Instagram } from "./icons";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

const letters = (word: string) =>
  word.split("").map((ch, i) => (
    <span key={i} className="hero-letter inline-block" style={{ opacity: 0 }}>
      {ch === " " ? " " : ch}
    </span>
  ));

export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    // Anime.js: entrada letra por letra do título
    animate(titleRef.current.querySelectorAll(".hero-letter"), {
      opacity: [0, 1],
      translateY: [60, 0],
      rotate: [8, 0],
      ease: "outExpo",
      duration: 900,
      delay: stagger(40, { start: 200 }),
    });
  }, []);

  return (
    <section id="top" className="relative flex min-h-svh items-center overflow-hidden bg-grid pt-16">
      {/* fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 size-[520px] rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 size-[420px] rounded-full bg-brand-dark/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-3 brand-stripe" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1.2fr_1fr] md:px-6">
        <div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 border border-brand/50 bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand"
          >
            <span className="size-2 animate-pulse rounded-full bg-brand" />
            Corrida noturna • Linha do Tiro • Recife
          </motion.span>

          <h1 ref={titleRef} className="text-6xl leading-[0.9] sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="block">{letters("Corre")}</span>
            <span className="block text-3xl font-sans font-bold normal-case tracking-normal text-muted-foreground sm:text-4xl md:text-5xl">
              {letters("que dá")}
            </span>
            <span className="block text-brand">{letters("Tempo")}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl"
          >
            Esporte, saúde e diversão. Todas as quartas o paredão puxa e a Zona Norte corre junto:
            4 km do Campo do Café até a Praça da Convenção e volta.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button size="lg" className="h-12 px-6 text-base font-bold" nativeButton={false} render={<a href="#cadastro" />}>
              Quero correr
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base font-semibold" nativeButton={false} render={<a href="#ranking" />}>
              Ver ranking
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-4 text-base"
              nativeButton={false} render={<a href={SITE.instagram} target="_blank" rel="noopener noreferrer" />}
            >
              <Instagram data-icon="inline-start" />
              @correquedatempo__
            </Button>
          </motion.div>
        </div>

        {/* Cartão do evento */}
        <motion.aside
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          transition={{ delay: 0.6, duration: 0.7, type: "spring", bounce: 0.3 }}
          className="relative self-center border-4 border-brand bg-black p-6 shadow-[12px_12px_0_0_var(--brand)]"
        >
          <p className="font-heading text-2xl text-brand">Próximo treino</p>
          <ul className="mt-4 space-y-4">
            <InfoRow icon={<CalendarDays />} label="Quando" value="Quarta-feira" />
            <InfoRow icon={<Clock />} label="Concentração / Saída" value={`${SITE.concentration} / ${SITE.start}`} />
            <InfoRow icon={<MapPin />} label="Onde" value="Campo do Café, Linha do Tiro" />
            <InfoRow icon={<Shirt />} label="Uniforme" value="Todos de camisa preta" />
          </ul>
          <div className="mt-6 bg-brand px-3 py-2 text-center font-heading text-xl text-black">
            Paredão puxando
          </div>
        </motion.aside>
      </div>

      <motion.a
        href="#ranking"
        aria-label="Rolar para baixo"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-muted-foreground md:block"
      >
        <ArrowDown />
      </motion.a>
    </section>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center bg-brand/15 text-brand [&_svg]:size-5">{icon}</span>
      <span>
        <span className="block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="block font-semibold">{value}</span>
      </span>
    </li>
  );
}
