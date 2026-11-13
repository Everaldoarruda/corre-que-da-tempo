import Image from "next/image";
import { cn } from "cn";

/** Logomarca oficial (public/img/logo.png) com o nome ao lado. */
export function Logo({
  className,
  size = "md",
  withText = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}) {
  const px = { sm: 32, md: 44, lg: 160 }[size];
  const text = { sm: "text-base", md: "text-xl", lg: "text-5xl" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/img/logo.png"
        alt="Corre que dá Tempo"
        width={px}
        height={px}
        priority={size !== "lg"}
        className="shrink-0 rounded-full"
      />
      {withText && (
        <span className={cn("font-heading inline-flex items-baseline gap-1 leading-none", text)}>
          <span className="text-foreground">Corre</span>
          <span className="text-xs font-sans font-semibold normal-case tracking-normal text-muted-foreground">que dá</span>
          <span className="text-brand">Tempo</span>
        </span>
      )}
    </span>
  );
}
