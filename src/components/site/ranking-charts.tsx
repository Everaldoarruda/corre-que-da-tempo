"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { monthlyEvolution, type Runner } from "@/lib/data";

const pointsConfig = {
  points: { label: "Pontos", color: "var(--chart-1)" },
} satisfies ChartConfig;

const evolutionConfig = {
  corredores: { label: "Corredores", color: "var(--chart-1)" },
  tempoMedio: { label: "Tempo médio (min)", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function RankingCharts({ period, data }: { period: "semana" | "mes"; data: Runner[] }) {
  const top5 = data.slice(0, 5).map((r) => ({
    name: r.name.split(" ")[0],
    points: r.points,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Top 5 em pontos — {period === "semana" ? "semana" : "mês"}
          </CardTitle>
          <CardDescription>Pontuação acumulada dos cinco primeiros colocados.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pointsConfig} className="h-56 w-full">
            <BarChart data={top5} layout="vertical" margin={{ left: 8, right: 32 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="points" fill="var(--color-points)" radius={4} isAnimationActive animationDuration={900}>
                <LabelList dataKey="points" position="right" className="fill-foreground text-xs font-bold" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Evolução do mês</CardTitle>
          <CardDescription>Corredores por treino e tempo médio nos 4 km.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={evolutionConfig} className="h-56 w-full">
            <LineChart data={monthlyEvolution} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} width={32} />
              <YAxis yAxisId="right" orientation="right" domain={[17, 20]} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line yAxisId="left" type="monotone" dataKey="corredores" stroke="var(--color-corredores)" strokeWidth={3} dot={{ r: 4 }} animationDuration={1200} />
              <Line yAxisId="right" type="monotone" dataKey="tempoMedio" stroke="var(--color-tempoMedio)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3 }} animationDuration={1200} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
