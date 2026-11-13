"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { animate } from "animejs";

const stats = [
  { value: 1227, suffix: "+", label: "Seguidores" },
  { value: 138, suffix: "", label: "Corredores por treino" },
  { value: 4, suffix: " km", label: "Percurso" },
  { value: 14, suffix: "", label: "Treinos realizados" },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView || !ref.current) return;
    // Anime.js: contador numérico
    ref.current.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? "";
      const obj = { v: 0 };
      animate(obj, {
        v: target,
        duration: 1800,
        ease: "outExpo",
        modifier: (v: number) => Math.round(v),
        onUpdate: () => {
          el.textContent = obj.v.toLocaleString("pt-BR") + suffix;
        },
      });
    });
  }, [inView]);

  return (
    <div ref={ref} className="border-y border-border bg-black/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-8 text-center">
            <p className="font-heading text-4xl text-brand md:text-5xl" data-count={s.value} data-suffix={s.suffix}>
              0{s.suffix}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
