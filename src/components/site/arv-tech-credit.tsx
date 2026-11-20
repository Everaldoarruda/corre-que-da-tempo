"use client";

import Image from "next/image";
import { Instagram } from "./icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Dados do cartão de visitas de quem desenvolveu o site. */
const DEV = {
  nome: "Everaldo Arruda",
  cargo: "Desenvolvedor",
  instagram: "programaldo",
};

const instagramUrl = `https://www.instagram.com/${DEV.instagram}/`;

/** Crédito no rodapé: a logo abre o cartão de visitas da arv.tech. */
export function ArvTechCredit() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Ver cartão de visitas da arv.tech"
            className="rounded-lg outline-none transition hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          />
        }
      >
        <Image
          src="/img/arv-tech.png"
          alt="arv.tech"
          width={629}
          height={287}
          className="h-16 w-auto rounded-lg ring-1 ring-white/10 transition hover:ring-[#3b82f6]/60 sm:h-20"
        />
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-1.5rem)] max-w-xl overflow-hidden border-[#1e2a4a] bg-[#0b1735] p-0 sm:max-w-xl" showCloseButton>
        <DialogTitle className="sr-only">Cartão de visitas: {DEV.nome}, arv.tech</DialogTitle>
        <DialogDescription className="sr-only">
          {DEV.cargo}. Instagram @{DEV.instagram}.
        </DialogDescription>

        <div className="relative px-5 pb-4 pt-10 sm:px-8 sm:pt-12">
          <PixelTree className="absolute right-6 top-6 sm:right-10" />
          <CodeCard />
        </div>

        <div className="border-t border-white/10 bg-black/20 p-4">
          <Button
            nativeButton={false}
            render={<a href={instagramUrl} target="_blank" rel="noopener noreferrer" />}
            className="h-11 w-full bg-gradient-to-r from-[#3b6ef5] to-[#2dd4bf] font-semibold text-[#0b1735] hover:opacity-90"
          >
            <Instagram data-icon="inline-start" />
            Seguir @{DEV.instagram} no Instagram
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** O cartão no formato de um objeto JSON, como no cartão original. */
function CodeCard() {
  const lines: React.ReactNode[] = [
    <Punct key="o">{"{"}</Punct>,
    <Entry key="n" k="nome" v={DEV.nome} />,
    <Entry key="c" k="cargo" v={DEV.cargo} />,
    <Entry key="i" k="instagram" v={`@${DEV.instagram}`} href={instagramUrl} external last />,
    <Punct key="c2">{"}"}</Punct>,
  ];
  return (
    <ol className="font-mono text-[13px] leading-9 sm:text-lg sm:leading-[2.6rem]">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-4 sm:gap-6">
          <span className="w-4 shrink-0 select-none text-right text-[#5b6b8c]">{i + 1}</span>
          <span className="min-w-0 break-all">{line}</span>
        </li>
      ))}
    </ol>
  );
}

function Entry({ k, v, href, external, last }: { k: string; v: string; href?: string; external?: boolean; last?: boolean }) {
  const value = <span className="text-[#34d399]">&quot;{v}&quot;</span>;
  return (
    <span className="pl-4 sm:pl-7">
      <span className="text-[#34d399]">&quot;{k}&quot;</span>
      <Punct>: </Punct>
      {href ? (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="underline decoration-[#34d399]/30 underline-offset-4 hover:decoration-[#34d399]"
        >
          {value}
        </a>
      ) : (
        value
      )}
      {!last && <Punct>,</Punct>}
    </span>
  );
}

function Punct({ children }: { children: React.ReactNode }) {
  return <span className="text-[#8fb3ff]">{children}</span>;
}

/** A árvore de pixels da marca arv.tech. */
function PixelTree({ className }: { className?: string }) {
  const rows: { n: number; color: string }[] = [
    { n: 1, color: "#4ade80" },
    { n: 3, color: "#2dd4bf" },
    { n: 5, color: "#3b6ef5" },
    { n: 1, color: "#f1f5f9" },
    { n: 1, color: "#f1f5f9" },
  ];
  return (
    <div className={`flex flex-col items-center gap-[3px] ${className ?? ""}`} aria-hidden="true">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-[3px]">
          {Array.from({ length: r.n }, (_, j) => (
            <span key={j} className="size-2.5 rounded-[3px] sm:size-3" style={{ background: r.color }} />
          ))}
        </div>
      ))}
    </div>
  );
}
