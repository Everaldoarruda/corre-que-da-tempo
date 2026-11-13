import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Instagram } from "./icons";
import { Logo } from "./logo";
import { sponsors } from "@/lib/data";
import { SITE, whatsappLink } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-black">
      <div className="h-2 brand-stripe" />
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Apoio e patrocínio</p>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {sponsors.map((s) => (
            <li
              key={s.name}
              className="flex h-20 items-center justify-center rounded-lg border border-border bg-card/60 px-4 grayscale transition hover:border-brand hover:grayscale-0"
              title={s.name}
            >
              <Image src={s.logo} alt={s.name} width={160} height={60} className="h-12 w-auto object-contain" />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Quer sua marca aqui?{" "}
          <a className="text-brand underline-offset-4 hover:underline" href={whatsappLink("Olá! Quero colocar a logo da minha empresa como patrocinador no site do Corre que dá Tempo.")} target="_blank" rel="noopener noreferrer">
            Fale com a organização
          </a>
          .
        </p>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 md:flex-row">
          <div>
            <Logo />
            <p className="mt-1 text-sm text-muted-foreground">Esporte • Saúde • Diversão — Linha do Tiro, Recife/PE</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
            <a href="#ranking" className="hover:text-brand">Ranking</a>
            <a href="#cadastro" className="hover:text-brand">Cadastro</a>
            <a href="#galeria" className="hover:text-brand">Galeria</a>
            <a href="#percurso" className="hover:text-brand">Percurso</a>
            <a href="#loja" className="hover:text-brand">Loja</a>
            <a href="#contato" className="hover:text-brand">Contato</a>
          </nav>
          <div className="flex gap-3">
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-brand hover:text-brand"><Instagram className="size-5" /></a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-brand hover:text-brand"><MessageCircle className="size-5" /></a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © 2026 Corre que dá Tempo. Esporte é saúde, é união, é vida!
        </p>
      </div>
    </footer>
  );
}
