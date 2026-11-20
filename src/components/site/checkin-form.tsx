"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Baby, CheckCircle2, Clock, Loader2, MapPin, User, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DIAS, type CheckinPublic, type CheckinResult } from "@/lib/checkin-types";

type Tipo = "Adulto" | "Criança";
type Perfil = { nome: string };
const PERFIL_KEY = "cqdt:checkin:perfil";

export function CheckinForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<CheckinPublic | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [origem, setOrigem] = useState<"qr" | "site">("site");

  const [tipo, setTipo] = useState<Tipo>("Adulto");
  const [nome, setNome] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [codigo, setCodigo] = useState("");
  const [consent, setConsent] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [done, setDone] = useState<Extract<CheckinResult, { ok: true }> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin", { cache: "no-store" });
      setState((await res.json()) as CheckinPublic);
    } catch {
      /* mantém o último estado */
    }
  }, []);

  useEffect(() => {
    // estado inicial lido do navegador (perfil salvo e origem do QR Code)
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const saved = JSON.parse(localStorage.getItem(PERFIL_KEY) ?? "null") as Perfil | null;
      if (saved?.nome) {
        setPerfil(saved);
        setShowForm(false);
      }
    } catch {}
    if (new URLSearchParams(window.location.search).get("origem") === "qr") setOrigem("qr");
    /* eslint-enable react-hooks/set-state-in-effect */
    load();
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);

  async function enviar(payload: { tipo: Tipo; nome: string; responsavel?: string }) {
    setBusy(true);
    setErro(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, codigo, consentimento: true, origem }),
      });
      const result = (await res.json()) as CheckinResult;
      if (!result.ok) {
        setErro(result.mensagem ?? "Não foi possível fazer o check-in.");
        return;
      }
      if (payload.tipo === "Adulto") {
        const p = { nome: payload.nome.trim() };
        localStorage.setItem(PERFIL_KEY, JSON.stringify(p));
        setPerfil(p);
      }
      setDone(result);
      setState((s) => (s ? { ...s, hoje: result.hoje } : s));
    } catch {
      setErro("Sem conexão. Tente de novo em instantes.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) return;
    enviar({ tipo, nome, responsavel: tipo === "Criança" ? responsavel : undefined });
  }

  function outraPessoa(proximoTipo: Tipo) {
    setDone(null);
    setErro(null);
    setShowForm(true);
    setTipo(proximoTipo);
    setNome("");
    setConsent(false);
    if (proximoTipo === "Criança" && perfil) setResponsavel(perfil.nome);
  }

  const aberto = !!state?.aberto;
  const horario = state ? `${DIAS[state.config.dia_semana] ?? "no dia do treino"}, das ${state.config.abre} às ${state.config.fecha}` : "";
  const podeEnviar =
    aberto && consent && nome.trim().length >= 2 && (tipo === "Adulto" || responsavel.trim().length >= 2) && (!state?.exigeCodigo || codigo.trim().length > 0);

  return (
    <Card className="border-brand/30">
      <CardContent className={compact ? "pt-5" : "pt-6"}>
        <StatusBar state={state} horario={horario} />

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <motion.div initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}>
                <CheckCircle2 className="size-20 text-brand" />
              </motion.div>
              <h3 className="mt-4 text-3xl">{done.duplicado ? "Já estava registrado!" : `Check-in feito, ${done.nome}!`}</h3>
              <p className="mt-2 text-muted-foreground">
                {done.duplicado
                  ? "O check-in de hoje já tinha sido feito com esse nome."
                  : `Presença nº ${done.hoje.total} de hoje. Bom treino e bora puxar o paredão!`}
              </p>
              <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button variant="outline" onClick={() => outraPessoa("Criança")}>
                  <Baby data-icon="inline-start" />
                  Check-in de uma criança
                </Button>
                <Button variant="outline" onClick={() => outraPessoa("Adulto")}>
                  <UserPlus data-icon="inline-start" />
                  Outra pessoa
                </Button>
                <Button nativeButton={false} render={<Link href="/#ranking" />}>
                  Ver ranking
                </Button>
              </div>
            </motion.div>
          ) : !showForm && perfil ? (
            <motion.div key="quick" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-4">
              <p className="text-sm text-muted-foreground">Bem-vindo de volta!</p>
              <Button
                size="lg"
                className="mt-3 h-14 w-full text-base font-bold"
                disabled={!aberto || busy || (state?.exigeCodigo && !codigo.trim())}
                onClick={() => enviar({ tipo: "Adulto", nome: perfil.nome })}
              >
                {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <CheckCircle2 data-icon="inline-start" />}
                Sou {perfil.nome}, fazer check-in
              </Button>
              {state?.exigeCodigo && (
                <div className="mt-3 grid gap-1.5">
                  <Label htmlFor="codigo-rapido">Código do dia</Label>
                  <Input id="codigo-rapido" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Anunciado na concentração" autoCapitalize="characters" />
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Ao confirmar, seu nome entra na lista de presença e no ranking do site.
              </p>
              {erro && <p className="mt-3 rounded-md bg-destructive/15 p-2 text-sm text-destructive">{erro}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <button type="button" className="text-brand underline-offset-4 hover:underline" onClick={() => outraPessoa("Criança")}>
                  Check-in de uma criança
                </button>
                <button
                  type="button"
                  className="text-muted-foreground underline-offset-4 hover:underline"
                  onClick={() => {
                    localStorage.removeItem(PERFIL_KEY);
                    setPerfil(null);
                    outraPessoa("Adulto");
                  }}
                >
                  Não sou {perfil.nome}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4">
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Quem vai correr">
                {(["Adulto", "Criança"] as Tipo[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={tipo === t}
                    onClick={() => {
                      setTipo(t);
                      if (t === "Criança" && !responsavel && perfil) setResponsavel(perfil.nome);
                    }}
                    className={`flex h-14 items-center justify-center gap-2 rounded-lg border-2 font-bold transition-colors ${
                      tipo === t ? "border-brand bg-brand text-black" : "border-border hover:border-brand"
                    }`}
                  >
                    {t === "Adulto" ? <User className="size-5" /> : <Baby className="size-5" />}
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="checkin-nome">{tipo === "Adulto" ? "Seu nome ou como quer ser chamado" : "Nome ou apelido da criança"}</Label>
                <Input
                  id="checkin-nome"
                  required
                  minLength={2}
                  maxLength={40}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={tipo === "Adulto" ? "Ex.: Rafa do Café" : "Ex.: Joãozinho"}
                  list={tipo === "Adulto" ? "checkin-nomes" : undefined}
                  autoComplete="nickname"
                  className="h-11 text-base"
                />
                <datalist id="checkin-nomes">
                  {state?.nomes.map((n) => <option key={n} value={n} />)}
                </datalist>
                {tipo === "Adulto" && <span className="text-xs text-muted-foreground">Use sempre o mesmo nome para somar presenças no ranking.</span>}
              </div>

              {tipo === "Criança" && (
                <div className="grid gap-1.5">
                  <Label htmlFor="checkin-resp">Nome do responsável</Label>
                  <Input id="checkin-resp" required minLength={2} maxLength={40} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="h-11 text-base" />
                </div>
              )}

              {state?.exigeCodigo && (
                <div className="grid gap-1.5">
                  <Label htmlFor="checkin-codigo">Código do dia</Label>
                  <Input id="checkin-codigo" required value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Anunciado na concentração" autoCapitalize="characters" className="h-11 text-base" />
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-black/30 p-3 text-xs leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
                />
                {tipo === "Adulto" ? (
                  <span>
                    Concordo que meu nome ou apelido apareça na lista de presença e no ranking do site, conforme a LGPD. Estou ciente
                    de que os treinos são fotografados. Posso pedir a exclusão dos meus dados a qualquer momento pelo WhatsApp da
                    organização.
                  </span>
                ) : (
                  <span>
                    Sou o responsável por esta criança e autorizo o registro da presença dela, conforme a LGPD. O nome da criança fica
                    só com a organização e não aparece no site: ela entra apenas na contagem de corredores.
                  </span>
                )}
              </label>

              {erro && <p className="rounded-md bg-destructive/15 p-2 text-sm text-destructive">{erro}</p>}

              <Button type="submit" size="lg" disabled={!podeEnviar || busy} className="h-14 text-base font-bold">
                {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <CheckCircle2 data-icon="inline-start" />}
                {aberto ? "Cheguei! Fazer check-in" : "Check-in fechado agora"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function StatusBar({ state, horario }: { state: CheckinPublic | null; horario: string }) {
  if (!state) {
    return (
      <div className="mb-5 flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Verificando o check-in...
      </div>
    );
  }
  if (!state.disponivel) {
    return (
      <div className="mb-5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        O check-in está sendo configurado pela organização. Volte em breve.
      </div>
    );
  }
  if (state.aberto) {
    return (
      <div className="mb-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
        <p className="flex items-center gap-2 font-semibold text-emerald-400">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          Check-in aberto agora
        </p>
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <strong className="text-foreground">{state.hoje.total}</strong> já chegaram hoje
          <span className="text-xs">({state.hoje.adultos} adultos, {state.hoje.criancas} crianças)</span>
        </p>
      </div>
    );
  }
  return (
    <div className="mb-5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <Clock className="size-4 text-brand" /> Check-in fechado agora
      </p>
      <p className="mt-1 flex items-center gap-2">
        <MapPin className="size-4" /> Abre {horario}, na concentração.
      </p>
    </div>
  );
}
