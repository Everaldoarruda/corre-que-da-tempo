"use client";

/* eslint-disable @next/next/no-img-element -- QR Code gerado no navegador como data URL */
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export function QrPoster() {
  const [url, setUrl] = useState("");
  const [src, setSrc] = useState("");

  useEffect(() => {
    const target = `${window.location.origin}/checkin?origem=qr`;
    QRCode.toDataURL(target, { width: 900, margin: 1, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } }).then((data) => {
      setUrl(target);
      setSrc(data);
    });
  }, []);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black p-6 text-center print:bg-white print:text-black">
      <Logo size="lg" withText={false} />
      <h1 className="text-5xl leading-none md:text-7xl">
        Faça seu <span className="whitespace-nowrap text-brand print:text-black">check-in</span>
      </h1>
      <p className="text-lg text-muted-foreground print:text-black">Aponte a câmera do celular para o código</p>
      <div className="rounded-2xl border-8 border-brand bg-white p-4 print:border-black">
        {src ? <img src={src} alt="QR Code do check-in" className="size-72 md:size-96" /> : <div className="size-72 md:size-96" />}
      </div>
      <p className="font-mono text-sm text-muted-foreground print:text-black">{url}</p>
      <Button size="lg" onClick={() => window.print()} className="print:hidden">
        <Printer data-icon="inline-start" />
        Imprimir cartaz
      </Button>
    </main>
  );
}
