# Corre que dá Tempo — Landing page

Site do treino de corrida noturna da Linha do Tiro (Recife/PE). Next.js 16 + Tailwind 4 + shadcn/ui, animações com [Motion](https://motion.dev) e [Anime.js](https://animejs.com), gráficos com shadcn Charts (Recharts).

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Seções

| Seção | Arquivo | Observações |
| --- | --- | --- |
| Navbar + WhatsApp | `src/components/site/navbar.tsx` | Menu mobile em Sheet |
| Hero | `src/components/site/hero.tsx` | Título letra a letra (Anime.js), cartão do próximo treino (Motion) |
| Números | `src/components/site/stats.tsx` | Contadores animados (Anime.js) |
| Ranking | `src/components/site/ranking.tsx` + `ranking-charts.tsx` | Abas semana/mês, pódio animado, tabela e 2 gráficos |
| Anúncios de fornecedores | `src/components/site/anuncios.tsx` | Carrossel com autoplay, aparece 2x no body |
| Cadastro | `src/components/site/cadastro.tsx` | Salva no `localStorage` e abre WhatsApp com o resumo |
| Galeria | `src/components/site/galeria.tsx` | Grid com lightbox (Dialog) |
| Percurso | `src/components/site/percurso.tsx` + `route-map.tsx` | Mapa real (Leaflet/OpenStreetMap) com rota pelas ruas em `src/lib/route.ts`, desenhada com `svg.createDrawable` e corredor via `svg.createMotionPath` |
| Loja | `src/components/site/loja.tsx` | Carrinho em Sheet, pedido finalizado via WhatsApp |
| Contato | `src/components/site/contato.tsx` | CTA WhatsApp, atalhos para anunciante e patrocinador |
| Footer | `src/components/site/footer.tsx` | Logos dos patrocinadores |

## O que personalizar

1. **WhatsApp e endereço**: `src/lib/config.ts` (`whatsappNumber` está com um número de exemplo).
2. **Ranking, loja, anúncios, patrocinadores, galeria**: `src/lib/data.ts` (dados de exemplo).
3. **Imagens**: substitua os SVGs placeholder em `public/img/**` mantendo os nomes, ou gere novos com `node scripts/gen-placeholders.mjs`.
4. **Logo oficial**: coloque em `public/img/logo.png` e troque `src/components/site/logo.tsx` por um `<Image />`.

## Próximos passos sugeridos

- Backend para o cadastro e o ranking (ex.: Supabase ou Google Sheets) no lugar dos dados estáticos.
- Pagamento online na loja (Pix / Mercado Pago) se não quiser fechar só pelo WhatsApp.
