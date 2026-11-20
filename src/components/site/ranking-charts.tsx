"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatDataBR, type TreinoDia } from "@/lib/checkin-types";
import type { RankRow } from "./ranking";

const presencasConfig = {
  presencas: { label: "Presenças", color: "var(--chart-1)" },
} satisfies ChartConfig;

const treinosConfig = {
  adultos: { label: "Adultos", color: "var(--chart-1)" },
  criancas: { label: "Crianças", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function RankingCharts({ period, data, treinos }: { period: "mes" | "geral"; data: RankRow[]; treinos: TreinoDia[] }) {
  const top5 = data.slice(0, 5).map((r) => ({ name: r.nome.split(" ")[0], presencas: r.presencas }));
  const ultimos = treinos.slice(-10).map((t) => ({ ...t, label: formatDataBR(t.data) }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Top 5 em presença: {period === "mes" ? "este mês" : "geral"}</CardTitle>
          <CardDescription>Quem mais fez check-in nos treinos.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={presencasConfig} className="h-56 w-full">
            <BarChart data={top5} layout="vertical" margin={{ left: 8, right: 32 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="presencas" fill="var(--color-presencas)" radius={4} animationDuration={900}>
                <LabelList dataKey="presencas" position="right" className="fill-foreground text-xs font-bold" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Corredores por treino</CardTitle>
          <CardDescription>Check-ins dos últimos {ultimos.length} treinos, adultos e crianças.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={treinosConfig} className="h-56 w-full">
            <BarChart data={ultimos} margin={{ left: 0, right: 8, top: 16 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="adultos" stackId="a" fill="var(--color-adultos)" animationDuration={900} />
              <Bar dataKey="criancas" stackId="a" fill="var(--color-criancas)" radius={[4, 4, 0, 0]} animationDuration={900}>
                <LabelList dataKey="total" position="top" className="fill-foreground text-xs font-bold" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
