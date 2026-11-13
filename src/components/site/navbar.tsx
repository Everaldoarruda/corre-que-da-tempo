"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { whatsappLink } from "@/lib/config";

const links = [
  { href: "#ranking", label: "Ranking" },
  { href: "#cadastro", label: "Cadastro" },
  { href: "#galeria", label: "Galeria" },
  { href: "#percurso", label: "Percurso" },
  { href: "#loja", label: "Loja" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#top" aria-label="Início">
          <Logo />
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
            >
              {l.label}
            </a>
          ))}
          <Button
            nativeButton={false} render={<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" />}
            className="font-semibold"
          >
            <MessageCircle data-icon="inline-start" />
            WhatsApp
          </Button>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="outline" size="icon" className="md:hidden" aria-label="Abrir menu" />}
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mt-8 flex flex-col gap-2 px-4">
              <Logo />
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-lg font-semibold hover:bg-muted hover:text-brand"
                >
                  {l.label}
                </a>
              ))}
              <Button
                nativeButton={false} render={<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" />}
                size="lg"
                className="mt-4 font-semibold"
              >
                <MessageCircle data-icon="inline-start" />
                Falar no WhatsApp
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
