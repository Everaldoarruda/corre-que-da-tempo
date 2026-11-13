"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { animate, stagger } from "animejs";
import { Trophy, TrendingUp, TrendingDown, Minus, Medal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Section, SectionTitle } from "./section";
import { RankingCharts } from "./ranking-charts";
import { formatTime, monthlyRanking, weeklyRanking, type Runner } from "@/lib/data";

type Period = "semana" | "mes";

export function Ranking() {
  const [period, setPeriod] = useState<Period>("semana");
  const data = period === "semana" ? weeklyRanking : monthlyRanking;
  const top3 = data.slice(0, 3);

  return (
    <Section id="ranking" className="relative">
      <SectionTitle
        kicker="Ranking"
        title="Quem puxou o paredão"
        description="Pontuação por treino concluído e melhor tempo nos 4 km. Alterne entre o ranking da semana e o acumulado do mês."
      />

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="mb-8">
        <TabsList className="h-10">
          <TabsTrigger value="semana" className="px-5 font-semibold">
            Melhores da semana
          </TabsTrigger>
          <TabsTrigger value="mes" className="px-5 font-semibold">
            Melhores do mês
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Podium key={period} top3={top3} />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <RankingTable key={period} data={data} />
        <RankingCharts period={period} data={data} />
      </div>
    </Section>
  );
}

const podiumOrder = [1, 0, 2]; // 2º, 1º, 3º
const podiumHeight = ["h-44", "h-32", "h-24"]; // índice = colocação (1º mais alto)
const medalColor = ["text-brand", "text-zinc-300", "text-amber-700"];

function Podium({ top3 }: { top3: Runner[] }) {
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
    <div ref={ref} className="grid grid-cols-3 items-end gap-3 md:gap-6">
      {podiumOrder.map((idx) => {
        const r = top3[idx];
        if (!r) return null;
        return (
          <div key={r.id} className="flex flex-col items-center">
            <div className="podium-card mb-3 text-center" style={{ opacity: 0 }}>
              <Avatar className="mx-auto size-14 border-2 border-brand md:size-20">
                <AvatarFallback className="bg-muted font-heading text-xl text-brand">{initials(r.name)}</AvatarFallback>
              </Avatar>
              <p className="mt-2 line-clamp-1 text-sm font-bold md:text-base">{r.name}</p>
              <p className="text-xs text-muted-foreground">{formatTime(r.bestTimeSec)} • {r.points} pts</p>
            </div>
            <div
              className={`podium-block flex w-full origin-bottom flex-col items-center justify-start border-t-4 border-brand bg-card pt-3 ${podiumHeight[idx]}`}
              style={{ opacity: 0 }}
            >
              <Medal className={`size-6 ${medalColor[idx]}`} />
              <span className="font-heading text-3xl md:text-4xl">{idx + 1}º</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankingTable({ data }: { data: Runner[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Trophy className="size-4 text-brand" />
        <h3 className="font-heading text-lg">Classificação geral</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Corredor(a)</TableHead>
            <TableHead className="hidden sm:table-cell">Bairro</TableHead>
            <TableHead className="text-right">Tempo</TableHead>
            <TableHead className="text-right">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial>
            {data.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
              >
                <TableCell className="font-heading text-lg text-brand">{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.name}</span>
                    <Delta delta={r.delta} />
                    <Badge variant="outline" className="hidden text-[10px] md:inline-flex">
                      {r.category === "Feminino" ? "F" : "M"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{r.neighborhood}</TableCell>
                <TableCell className="text-right font-mono">{formatTime(r.bestTimeSec)}</TableCell>
                <TableCell className="text-right font-bold">{r.points}</TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}

function Delta({ delta }: { delta: number }) {
  if (delta > 0) return <span className="inline-flex items-center text-xs text-emerald-400"><TrendingUp className="size-3" />{delta}</span>;
  if (delta < 0) return <span className="inline-flex items-center text-xs text-red-400"><TrendingDown className="size-3" />{Math.abs(delta)}</span>;
  return <Minus className="size-3 text-muted-foreground" />;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
