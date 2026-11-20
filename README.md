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
| Galeria | `src/components/site/galeria.tsx` + `galeria-grid.tsx` | Lê a pasta pública do Google Drive a cada 5 min, grid paginado, visualizador e botão de baixar |
| Percurso | `src/components/site/percurso.tsx` + `route-map.tsx` | Mapa real (Leaflet/OpenStreetMap) com rota pelas ruas em `src/lib/route.ts`, desenhada com `svg.createDrawable` e corredor via `svg.createMotionPath` |
| Loja | `src/components/site/loja.tsx` | Carrinho em Sheet, pedido finalizado via WhatsApp |
| Contato | `src/components/site/contato.tsx` | CTA WhatsApp, atalhos para anunciante e patrocinador |
| Footer | `src/components/site/footer.tsx` | Logos dos patrocinadores |

## Galeria pelo Google Drive

O fotógrafo só sobe as fotos na pasta do Drive. O site lê a pasta sozinho, sem banco de dados.

- **Pasta**: compartilhada como "Qualquer pessoa com o link pode ver". O ID fica em `DRIVE_FOLDER_ID` (veja `.env.example`).
- **Formatos**: aceita JPG e também RAW (ARW, CR2, NEF...). O Google converte para JPEG automaticamente.
- **Download**: o visitante baixa um JPEG de 2400px (cerca de 3 MB), direto do Google, sem gastar banda do site. Se falhar, a rota `/api/fotos/[id]` serve de reserva.
- **Produção**: defina `GOOGLE_API_KEY` (Google Cloud, com a Google Drive API ativada). Sem a chave, o site usa a listagem pública da pasta, que funciona mas não é uma API oficial.

## O que personalizar

1. **WhatsApp e endereço**: `src/lib/config.ts` (`whatsappNumber` está com um número de exemplo).
2. **Ranking, loja, anúncios, patrocinadores, galeria**: `src/lib/data.ts` (dados de exemplo).
3. **Imagens**: substitua os SVGs placeholder em `public/img/**` mantendo os nomes, ou gere novos com `node scripts/gen-placeholders.mjs`.
4. **Vídeo de fundo do hero**: coloque `hero.mp4` (e opcionalmente `hero.webm`) em `public/video/`. Enquanto o arquivo não existe, o hero usa a foto `public/img/grid.webp` como poster.

## Próximos passos sugeridos

- Backend para o cadastro e o ranking (ex.: Supabase ou Google Sheets) no lugar dos dados estáticos.
- Pagamento online na loja (Pix / Mercado Pago) se não quiser fechar só pelo WhatsApp.
