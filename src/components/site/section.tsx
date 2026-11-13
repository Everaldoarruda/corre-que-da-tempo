"use client";

import { motion } from "motion/react";
import { cn } from "cn";

export function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-20 md:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>
    </section>
  );
}

export function SectionTitle({
  kicker,
  title,
  description,
  align = "left",
}: {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mb-10 md:mb-14", align === "center" && "text-center")}
    >
      {kicker && (
        <span className="mb-3 inline-block bg-brand px-2 py-0.5 text-xs font-bold uppercase tracking-[0.2em] text-black">
          {kicker}
        </span>
      )}
      <h2 className="text-4xl leading-none md:text-6xl">{title}</h2>
      {description && (
        <p className={cn("mt-4 max-w-2xl text-base text-muted-foreground md:text-lg", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </motion.div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
