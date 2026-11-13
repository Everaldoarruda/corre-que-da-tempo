"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Send, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionTitle, Reveal } from "./section";
import { whatsappLink, SITE } from "@/lib/config";

type Form = {
  nome: string;
  whatsapp: string;
  nascimento: string;
  bairro: string;
  categoria: string;
  tamanho: string;
  nivel: string;
  obs: string;
};

const empty: Form = { nome: "", whatsapp: "", nascimento: "", bairro: "", categoria: "", tamanho: "M", nivel: "iniciante", obs: "" };

export function Cadastro() {
  const [form, setForm] = useState<Form>(empty);
  const [done, setDone] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Guarda localmente (até existir um backend) e envia o resumo para a organização via WhatsApp.
    try {
      const prev = JSON.parse(localStorage.getItem("cqdt:cadastros") ?? "[]");
      localStorage.setItem("cqdt:cadastros", JSON.stringify([...prev, { ...form, em: new Date().toISOString() }]));
    } catch {}
    const msg =
      `*Cadastro Corre que dá Tempo*\n` +
      `Nome: ${form.nome}\nWhatsApp: ${form.whatsapp}\nNascimento: ${form.nascimento}\n` +
      `Bairro: ${form.bairro}\nCategoria: ${form.categoria}\nCamisa: ${form.tamanho}\nNível: ${form.nivel}\n` +
      (form.obs ? `Obs: ${form.obs}` : "");
    window.open(whatsappLink(msg), "_blank", "noopener");
    setDone(true);
  }

  return (
    <Section id="cadastro" className="bg-black/40">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
        <div>
          <SectionTitle
            kicker="Cadastro"
            title="Entre pro time"
            description="Cadastre-se para entrar no ranking, receber avisos dos treinos e garantir sua camisa oficial."
          />
          <Reveal>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> Treino gratuito, {SITE.dayLabel.toLowerCase()} às {SITE.concentration}.</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> Seu nome entra no ranking semanal e mensal.</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> Avisos de percurso, cancelamentos e eventos pelo WhatsApp.</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> Ao enviar, o resumo do cadastro abre no WhatsApp da organização.</li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <Card className="border-brand/30">
            <CardContent className="pt-6">
              {done ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <CheckCircle2 className="size-16 text-brand" />
                  <h3 className="mt-4 text-3xl">Cadastro enviado!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Finalize o envio no WhatsApp que abriu. Te esperamos na próxima quarta, de camisa preta.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => { setDone(false); setForm(empty); }}>
                    Novo cadastro
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nome completo" className="sm:col-span-2">
                    <Input required value={form.nome} onChange={set("nome")} placeholder="Seu nome" />
                  </Field>
                  <Field label="WhatsApp">
                    <Input required type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="(81) 9 9999-9999" />
                  </Field>
                  <Field label="Data de nascimento">
                    <Input required type="date" value={form.nascimento} onChange={set("nascimento")} />
                  </Field>
                  <Field label="Bairro">
                    <Input required value={form.bairro} onChange={set("bairro")} placeholder="Linha do Tiro" />
                  </Field>
                  <Field label="Categoria">
                    <NativeSelect required value={form.categoria} onChange={set("categoria")}>
                      <option value="" disabled>Selecione</option>
                      <option>Feminino</option>
                      <option>Masculino</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Tamanho da camisa">
                    <NativeSelect value={form.tamanho} onChange={set("tamanho")}>
                      {["PP", "P", "M", "G", "GG", "XG"].map((s) => <option key={s}>{s}</option>)}
                    </NativeSelect>
                  </Field>
                  <Field label="Nível">
                    <NativeSelect value={form.nivel} onChange={set("nivel")}>
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Observações (opcional)" className="sm:col-span-2">
                    <Textarea value={form.obs} onChange={set("obs")} placeholder="Alguma condição de saúde, restrição ou recado?" rows={3} />
                  </Field>
                  <Button type="submit" size="lg" className="h-12 font-bold sm:col-span-2">
                    <Send data-icon="inline-start" />
                    Enviar cadastro
                  </Button>
                  <p className="text-center text-xs text-muted-foreground sm:col-span-2">
                    <UserPlus className="mr-1 inline size-3" />
                    Seus dados são usados apenas para organização dos treinos.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid gap-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className="h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  );
}
