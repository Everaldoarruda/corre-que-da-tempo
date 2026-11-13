import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Anton({ variable: "--font-display", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Corre que dá Tempo | Corrida noturna na Linha do Tiro - Recife",
  description:
    "Treino de corrida de rua toda quarta-feira às 20h no Campo do Café, Linha do Tiro, Recife/PE. Ranking, cadastro, galeria, percurso e loja oficial.",
  openGraph: {
    title: "Corre que dá Tempo",
    description: "Esporte • Saúde • Diversão. Todas as quartas, 20h, Linha do Tiro - Recife.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
