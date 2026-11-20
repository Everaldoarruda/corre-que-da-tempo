"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { animate, stagger } from "animejs";
import { Trophy, Medal, QrCode } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Section, SectionTitle } from "./section";
import { RankingCharts } from "./ranking-charts";
import { formatDataBR, type Corredor, type TreinoDia } from "@/lib/checkin-types";

type Period = "mes" | "geral";
export type RankRow = { pos: number; nome: string; presencas: number; ultimo: string };

/** Ordena por presenças; empates dividem a mesma posição (1, 2, 2, 4...). */
function rank(corredores: Corredor[], period: Period): RankRow[] {
  const rows = corredores
    .map((c) => ({ nome: c.nome, presencas: period === "mes" ? c.mes : c.presencas, ultimo: c.ultimo }))
    .filter((r) => r.presencas > 0)
    .sort((a, b) => b.presencas - a.presencas || b.ultimo.localeCompare(a.ultimo) || a.nome.localeCompare(b.nome, "pt-BR"));
  let pos = 0;
  return rows.map((r, i) => {
    if (i === 0 || r.presencas !== rows[i - 1].presencas) pos = i + 1;
    return { ...r, pos };
  });
}

export function Ranking({ corredores, treinos }: { corredores: Corredor[]; treinos: TreinoDia[] }) {
  const [period, setPeriod] = useState<Period>("mes");
  const data = useMemo(() => rank(corredores, period), [corredores, period]);

  return (
    <Section id="ranking" className="relative">
      <SectionTitle
        kicker="Ranking"
        title="Quem mais puxou o paredão"
        description="Ranking de presença: cada check-in na quarta conta um ponto. Crianças entram na contagem de corredores, mas não aparecem por nome."
      />

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="mb-8">
        <TabsList className="h-10">
          <TabsTrigger value="mes" className="px-5 font-semibold">
            Este mês
          </TabsTrigger>
          <TabsTrigger value="geral" className="px-5 font-semibold">
            Geral
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {data.length === 0 ? (
        <EmptyRanking />
      ) : (
        <>
          <Podium key={period} top3={data.slice(0, 3)} />
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
            <RankingTable key={period} data={data} />
            <RankingCharts period={period} data={data} treinos={treinos} />
          </div>
        </>
      )}
    </Section>
  );
}

function EmptyRanking() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-brand/40 bg-card/50 px-6 py-14 text-center">
      <Trophy className="size-10 text-brand" />
      <h3 className="text-2xl">O ranking começa no próximo treino</h3>
      <p className="max-w-md text-muted-foreground">
        Faça o check-in na concentração de quarta e seja o primeiro nome da lista de presença.
      </p>
      <Button nativeButton={false} render={<a href="#checkin" />} className="font-semibold">
        <QrCode data-icon="inline-start" />
        Como fazer o check-in
      </Button>
    </div>
  );
}

const podiumOrder = [1, 0, 2]; // 2º, 1º, 3º
const podiumHeight = ["h-44", "h-32", "h-24"]; // índice = colocação (1º mais alto)
const medalColor = ["text-brand", "text-zinc-300", "text-amber-700"];

function Podium({ top3 }: { top3: RankRow[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Anime.js: blocos do pódio sobem em sequência
    animate(ref.current.querySelectorAll(".podium-block"), {
      scaleY: [0, 1],
      opacity: [0, 1],
      duration: 900,
      ease: "outElastic(1, .6)",
      delay: stagger(120),
    });
    animate(ref.current.querySelectorAll(".podium-card"), {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 700,
      ease: "outExpo",
      delay: stagger(120, { start: 300 }),
    });
  }, [top3]);

  return (
    <div ref={ref} className="grid grid-cols-3 items-end gap-2 sm:gap-3 md:gap-6">
      {podiumOrder.map((idx) => {
        const r = top3[idx];
        if (!r) return <div key={idx} />;
        return (
          <div key={r.nome} className="flex flex-col items-center">
            <div className="podium-card mb-3 text-center" style={{ opacity: 0 }}>
              <Avatar className="mx-auto size-14 border-2 border-brand md:size-20">
                <AvatarFallback className="bg-muted font-heading text-xl text-brand">{initials(r.nome)}</AvatarFallback>
              </Avatar>
              <p className="mt-2 line-clamp-1 text-sm font-bold md:text-base">{r.nome}</p>
              <p className="text-xs text-muted-foreground">
                {r.presencas} {r.presencas === 1 ? "presença" : "presenças"}
              </p>
            </div>
            <div
              className={`podium-block flex w-full origin-bottom flex-col items-center justify-start border-t-4 border-brand bg-card pt-3 ${podiumHeight[idx]}`}
              style={{ opacity: 0 }}
            >
              <Medal className={`size-6 ${medalColor[idx]}`} />
              <span className="font-heading text-3xl md:text-4xl">{r.pos}º</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankingTable({ data }: { data: RankRow[] }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Trophy className="size-4 text-brand" />
        <h3 className="font-heading text-lg">Lista de presença</h3>
        <span className="ml-auto text-xs text-muted-foreground">{data.length} corredores</span>
      </div>
      <div className="max-h-[560px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 px-2 sm:px-3">#</TableHead>
              <TableHead>Corredor(a)</TableHead>
              <TableHead className="px-2 text-right sm:px-3">Presenças</TableHead>
              <TableHead className="hidden px-2 text-right sm:table-cell sm:px-3">Último treino</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r, i) => (
              <motion.tr
                key={r.nome}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i, 10) * 0.05, duration: 0.4 }}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
              >
                <TableCell className="px-2 font-heading text-lg text-brand sm:px-3">{r.pos}</TableCell>
                <TableCell className="max-w-0 truncate font-medium">{r.nome}</TableCell>
                <TableCell className="px-2 text-right font-bold sm:px-3">{r.presencas}</TableCell>
                <TableCell className="hidden px-2 text-right font-mono text-xs text-muted-foreground sm:table-cell sm:px-3">
                  {formatDataBR(r.ultimo)}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
