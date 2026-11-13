import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Stats } from "@/components/site/stats";
import { Ranking } from "@/components/site/ranking";
import { Anuncios } from "@/components/site/anuncios";
import { Cadastro } from "@/components/site/cadastro";
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
        <Stats />
        <Ranking />
        <Anuncios />
        <Cadastro />
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
