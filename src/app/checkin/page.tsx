import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { CheckinForm } from "@/components/site/checkin-form";

export const metadata: Metadata = {
  title: "Check-in | Corre que dá Tempo",
  description: "Faça seu check-in no treino de quarta do Corre que dá Tempo.",
};

/** Página aberta pelo QR Code da concentração: só o formulário, rápida no celular. */
export default function CheckinPage() {
  return (
    <main className="flex min-h-svh flex-col bg-grid">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-4">
        <Link href="/" aria-label="Ir para o site">
          <Logo size="sm" />
        </Link>
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="size-4" /> Site
        </Link>
      </header>
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-10">
        <h1 className="mb-1 text-5xl leading-none">Check-in</h1>
        <p className="mb-6 text-muted-foreground">Treino de quarta • Campo do Café, Linha do Tiro</p>
        <CheckinForm compact />
      </div>
    </main>
  );
}
