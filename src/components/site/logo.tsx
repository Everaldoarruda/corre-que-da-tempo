import { cn } from "cn";

/** Logo em texto estilizado. Para usar a arte oficial, coloque o arquivo em public/img/logo.png e troque este componente por <Image />. */
export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-5xl md:text-7xl" };
  return (
    <span className={cn("font-heading inline-flex items-baseline gap-1 leading-none", sizes[size], className)}>
      <span className="text-foreground">Corre</span>
      <span className="text-sm font-sans font-semibold normal-case tracking-normal text-muted-foreground">que dá</span>
      <span className="text-brand">Tempo</span>
    </span>
  );
}
