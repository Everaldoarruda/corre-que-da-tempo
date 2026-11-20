import type { Metadata } from "next";
import { QrPoster } from "./qr-poster";

export const metadata: Metadata = {
  title: "QR Code do check-in | Corre que dá Tempo",
  robots: { index: false },
};

/** Cartaz para imprimir ou mostrar no celular na concentração. */
export default function QrPage() {
  return <QrPoster />;
}
