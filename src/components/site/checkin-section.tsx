import { CheckCircle2, QrCode } from "lucide-react";
import { Section, SectionTitle, Reveal } from "./section";
import { CheckinForm } from "./checkin-form";

/** Seção da página inicial: substitui o antigo cadastro. */
export function CheckinSection() {
  return (
    <Section id="checkin" className="bg-black/40">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div>
          <SectionTitle
            kicker="Check-in"
            title="Cheguei, tô no treino!"
            description="Faça o check-in na concentração para entrar na lista de presença e no ranking. Leva 10 segundos."
          />
          <Reveal>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <QrCode className="mt-0.5 size-5 shrink-0 text-brand" /> Aponte a câmera para o QR Code na concentração ou faça por aqui mesmo.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> Só precisa do seu nome ou apelido. Nada de cadastro.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> O celular lembra de você: na próxima quarta é um toque só.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> Crianças contam na presença, com check-in feito pelo responsável.
              </li>
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <CheckinForm />
        </Reveal>
      </div>
    </Section>
  );
}
