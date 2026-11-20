"use client";

/* eslint-disable @next/next/no-img-element -- QR Code gerado no navegador como data URL */
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { KeyRound, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site/logo";

/**
 * Cartaz do check-in. Se a aba Config da planilha exigir o código do dia, a organização digita
 * o código aqui e ele vai embutido no QR Code: quem escaneia na concentração não precisa digitar,
 * e quem tenta de casa não sabe o código. O código não fica salvo em lugar nenhum do site.
 */
export function QrPoster() {
  const [codigo, setCodigo] = useState("");
  const [src, setSrc] = useState("");
  const [base, setBase] = useState("");

  useEffect(() => {
    const target = `${window.location.origin}/checkin?origem=qr${codigo.trim() ? `&c=${encodeURIComponent(codigo.trim())}` : ""}`;
    QRCode.toDataURL(target, { width: 900, margin: 1, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } }).then((data) => {
      setBase(`${window.location.origin}/checkin`);
      setSrc(data);
    });
  }, [codigo]);

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
      <p className="font-mono text-sm text-muted-foreground print:text-black">{base}</p>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card/60 p-4 text-left print:hidden">
        <label htmlFor="codigo-dia" className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4 text-brand" /> Código do dia (opcional)
        </label>
        <Input
          id="codigo-dia"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.slice(0, 30))}
          placeholder="O mesmo da aba Config da planilha"
          autoComplete="off"
          className="mt-2"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Use quando <code>exigir_codigo</code> estiver como SIM na planilha. O código vai dentro do QR Code e não aparece
          escrito no cartaz.
        </p>
      </div>

      <Button size="lg" onClick={() => window.print()} className="print:hidden">
        <Printer data-icon="inline-start" />
        Imprimir cartaz
      </Button>
    </main>
  );
}
