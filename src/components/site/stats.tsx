"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { animate } from "animejs";

export type StatItem = { value: number; label: string; suffix?: string; decimals?: number };

/** Faixa de números da página inicial. Os valores chegam do servidor (check-in, mapa e Config). */
export function Stats({ items }: { items: StatItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView || !ref.current) return;
    // Anime.js: contador numérico
    ref.current.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const decimals = Number(el.dataset.decimals ?? 0);
      const suffix = el.dataset.suffix ?? "";
      const obj = { v: 0 };
      animate(obj, {
        v: target,
        duration: 1800,
        ease: "outExpo",
        onUpdate: () => {
          el.textContent =
            obj.v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        },
      });
    });
  }, [inView]);

  return (
    <div ref={ref} className="border-y border-border bg-black/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        {items.map((s) => (
          <div key={s.label} className="px-4 py-8 text-center">
            <p
              className="font-heading text-4xl text-brand md:text-5xl"
              data-count={s.value}
              data-decimals={s.decimals ?? 0}
              data-suffix={s.suffix ?? ""}
            >
              {(0).toLocaleString("pt-BR", { minimumFractionDigits: s.decimals ?? 0 })}
              {s.suffix}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
