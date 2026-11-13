"use client";

import { motion } from "motion/react";
import { MessageCircle, MapPin, Clock } from "lucide-react";
import { Instagram } from "./icons";
import { Button } from "@/components/ui/button";
import { Section, SectionTitle, Reveal } from "./section";
import { SITE, whatsappLink } from "@/lib/config";

export function Contato() {
  return (
    <Section id="contato" className="bg-black/40">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <SectionTitle
            kicker="Contato"
            title="Fala com a organização"
            description="Dúvidas sobre treinos, parcerias, anúncios ou patrocínio? Chama no WhatsApp que a gente responde."
          />
          <Reveal>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-3"><Clock className="size-5 text-brand" /> {SITE.dayLabel} • {SITE.concentration}</li>
              <li className="flex items-center gap-3"><MapPin className="size-5 text-brand" /> {SITE.address}</li>
              <li className="flex items-center gap-3"><Instagram className="size-5 text-brand" /> <a className="hover:text-brand" href={SITE.instagram} target="_blank" rel="noopener noreferrer">@correquedatempo__</a></li>
            </ul>
          </Reveal>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border-2 border-brand bg-gradient-to-br from-brand/20 to-transparent p-8 text-center"
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#25D366] text-black">
            <MessageCircle className="size-10" />
          </div>
          <h3 className="mt-5 text-3xl">WhatsApp da organização</h3>
          <p className="mt-2 text-muted-foreground">Atendimento para corredores, fornecedores e patrocinadores.</p>
          <Button
            size="lg"
            className="mt-6 h-12 w-full bg-[#25D366] font-bold text-black hover:bg-[#1ebe5b] sm:w-auto sm:px-8"
            nativeButton={false} render={<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" />}
          >
            <MessageCircle data-icon="inline-start" />
            Abrir conversa
          </Button>
          <div className="mt-6 grid grid-cols-2 gap-2 text-left text-sm">
            <a className="rounded-lg border border-border bg-black/40 p-3 hover:border-brand" href={whatsappLink("Olá! Quero anunciar minha empresa no site e nos treinos do Corre que dá Tempo.")} target="_blank" rel="noopener noreferrer">
              <span className="block font-semibold">Quero anunciar</span>
              <span className="text-muted-foreground">Fornecedores</span>
            </a>
            <a className="rounded-lg border border-border bg-black/40 p-3 hover:border-brand" href={whatsappLink("Olá! Tenho interesse em patrocinar o Corre que dá Tempo.")} target="_blank" rel="noopener noreferrer">
              <span className="block font-semibold">Quero patrocinar</span>
              <span className="text-muted-foreground">Empresas e apoiadores</span>
            </a>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
