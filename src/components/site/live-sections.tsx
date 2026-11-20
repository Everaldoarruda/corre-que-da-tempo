import { Stats, type StatItem } from "./stats";
import { Ranking } from "./ranking";
import { getCheckinStats } from "@/lib/checkin";
import { ROUTE_DISTANCE_M } from "@/lib/route";

/**
 * Seções da página inicial que mostram dados do check-in.
 * Os dados vêm da planilha com cache de 1 minuto e são atualizados a cada novo check-in.
 */
export async function StatsLive() {
  const s = await getCheckinStats();
  const ultimo = s.treinos.at(-1);
  const items: StatItem[] = [
    { value: s.config.seguidores_instagram, suffix: "+", label: "Seguidores" },
    { value: ultimo?.total ?? 0, label: "Corredores no último treino" },
    { value: Math.round(ROUTE_DISTANCE_M / 100) / 10, decimals: 1, suffix: " km", label: "Percurso" },
    { value: s.treinos.length, label: "Treinos realizados" },
  ];
  return <Stats items={items} />;
}

export async function RankingLive() {
  const s = await getCheckinStats();
  return <Ranking corredores={s.corredores} treinos={s.treinos} />;
}

export function StatsSkeleton() {
  return <div className="h-[121px] border-y border-border bg-black/40" />;
}
