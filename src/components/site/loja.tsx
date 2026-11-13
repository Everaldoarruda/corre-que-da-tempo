"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ShoppingBag, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Section, SectionTitle } from "./section";
import { products, type Product } from "@/lib/data";
import { whatsappLink } from "@/lib/config";

type CartItem = { product: Product; size?: string; qty: number };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function Loja() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const total = useMemo(() => cart.reduce((s, i) => s + i.product.price * i.qty, 0), [cart]);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  function add(p: Product) {
    const size = p.sizes ? sizes[p.id] ?? p.sizes[1] : undefined;
    setCart((c) => {
      const idx = c.findIndex((i) => i.product.id === p.id && i.size === size);
      if (idx >= 0) return c.map((i, k) => (k === idx ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product: p, size, qty: 1 }];
    });
    setOpen(true);
  }

  function change(idx: number, d: number) {
    setCart((c) => c.map((i, k) => (k === idx ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  }

  const orderMsg =
    `*Pedido - Loja Corre que dá Tempo*\n` +
    cart.map((i) => `• ${i.qty}x ${i.product.name}${i.size ? ` (${i.size})` : ""} - ${brl(i.product.price * i.qty)}`).join("\n") +
    `\n*Total: ${brl(total)}*\n\nComo faço o pagamento e a retirada?`;

  return (
    <Section id="loja">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle
          kicker="Loja"
          title="Vista a camisa"
          description="Itens oficiais do Corre que dá Tempo. Monte seu pedido e finalize pelo WhatsApp com a organização."
        />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="lg" className="mb-10 md:mb-14" />}>
            <ShoppingBag data-icon="inline-start" />
            Carrinho
            {count > 0 && <Badge className="ml-1">{count}</Badge>}
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-heading text-2xl">Seu pedido</SheetTitle>
              <SheetDescription>Pagamento e retirada combinados direto com a organização.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              {cart.length === 0 && <p className="py-10 text-center text-muted-foreground">Carrinho vazio.</p>}
              {cart.map((i, idx) => (
                <div key={`${i.product.id}-${i.size}`} className="flex items-center gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border">
                    <Image src={i.product.image} alt={i.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{i.product.name}{i.size && <span className="text-muted-foreground"> • {i.size}</span>}</p>
                    <p className="text-sm text-brand">{brl(i.product.price * i.qty)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon-xs" variant="outline" onClick={() => change(idx, -1)} aria-label="Diminuir">{i.qty === 1 ? <Trash2 /> : <Minus />}</Button>
                    <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                    <Button size="icon-xs" variant="outline" onClick={() => change(idx, 1)} aria-label="Aumentar"><Plus /></Button>
                  </div>
                </div>
              ))}
            </div>
            <SheetFooter className="border-t border-border">
              <Separator className="mb-2" />
              <div className="flex items-center justify-between font-heading text-xl">
                <span>Total</span>
                <span className="text-brand">{brl(total)}</span>
              </div>
              <Button
                size="lg"
                className="h-12 w-full font-bold"
                disabled={cart.length === 0}
                nativeButton={false} render={<a href={cart.length ? whatsappLink(orderMsg) : undefined} target="_blank" rel="noopener noreferrer" />}
              >
                <MessageCircle data-icon="inline-start" />
                Finalizar no WhatsApp
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
          >
            <Card className="group h-full overflow-hidden pt-0">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <Badge className="absolute left-3 top-3">{brl(p.price)}</Badge>
              </div>
              <CardContent>
                <h3 className="font-heading text-xl">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                {p.sizes && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.sizes.map((s) => {
                      const active = (sizes[p.id] ?? p.sizes![1]) === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSizes((m) => ({ ...m, [p.id]: s }))}
                          className={`h-7 min-w-8 rounded-md border px-2 text-xs font-bold transition-colors ${
                            active ? "border-brand bg-brand text-black" : "border-border hover:border-brand"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full font-semibold" onClick={() => add(p)}>
                  <ShoppingBag data-icon="inline-start" />
                  Adicionar
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
