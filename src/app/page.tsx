import { Suspense } from "react";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { StatsLive, RankingLive, StatsSkeleton } from "@/components/site/live-sections";
import { Anuncios } from "@/components/site/anuncios";
import { CheckinSection } from "@/components/site/checkin-section";
import { Galeria } from "@/components/site/galeria";
import { Percurso } from "@/components/site/percurso";
import { Loja } from "@/components/site/loja";
import { Contato } from "@/components/site/contato";
import { Footer } from "@/components/site/footer";
import { WhatsappFloat } from "@/components/site/whatsapp-float";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Suspense fallback={<StatsSkeleton />}>
          <StatsLive />
        </Suspense>
        <Suspense fallback={<div id="ranking" className="min-h-[600px]" />}>
          <RankingLive />
        </Suspense>
        <Anuncios />
        <CheckinSection />
        <Galeria />
        <Percurso />
        <Anuncios />
        <Loja />
        <Contato />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
