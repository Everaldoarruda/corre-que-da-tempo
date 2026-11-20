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

### Criar a chave da Google Drive API

Leva uns 5 minutos e é gratuito. A Google Drive API não pede cartão de crédito.

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e entre com a conta Google.
2. No seletor de projetos do topo, clique em **Novo projeto**, dê um nome (ex.: `corre-que-da-tempo`) e clique em **Criar**.
3. Com o projeto selecionado, vá em **APIs e serviços > Biblioteca**, busque **Google Drive API** e clique em **Ativar**.
4. Vá em **APIs e serviços > Credenciais > Criar credenciais > Chave de API** e copie a chave.
5. Clique em **Editar chave**. Em **Restrições de API**, marque **Restringir chave**, selecione só a **Google Drive API** e salve. Deixe as restrições de aplicativo como "Nenhuma": a chave só é usada pelo servidor e nunca chega ao navegador.
6. **Local**: crie `.env.local` na raiz do projeto com `GOOGLE_API_KEY=sua_chave` e reinicie o `npm run dev`. O arquivo já está no `.gitignore`.
7. **Hospedagem**: na Vercel, em **Settings > Environment Variables**, adicione `GOOGLE_API_KEY` e faça um novo deploy.

Para testar a chave (deve retornar o nome de uma foto; erro 403 indica que a Drive API não foi ativada no passo 3):

```bash
curl "https://www.googleapis.com/drive/v3/files?q='ID_DA_PASTA'+in+parents&pageSize=1&key=SUA_CHAVE"
```

### Quem cria a chave: desenvolvedor ou cliente?

A chave **não precisa ser da conta dona da pasta**. Como a pasta é pública ("Qualquer pessoa com o link pode ver"), qualquer chave de qualquer conta Google consegue listar as fotos. A chave não dá acesso ao Drive do cliente: ela só lê o que já está público, como um visitante com o link.

| Quem cria | Vantagem | Ponto de atenção |
| --- | --- | --- |
| Desenvolvedor | Mais rápido, controle total durante o desenvolvimento | O site do cliente depende de um projeto na conta do desenvolvedor |
| Cliente | Site independente do desenvolvedor | O cliente precisa seguir o passo a passo ou dar acesso para isso |

**Recomendado:** o desenvolvedor cria durante o desenvolvimento e, na entrega, escolhe uma das opções:

1. **Transferir o projeto**: no Google Cloud, em **IAM e administrador**, adicionar o e-mail do cliente com o papel **Proprietário**. Não é preciso trocar a chave.
2. **Trocar a chave**: o cliente cria a própria chave e o valor de `GOOGLE_API_KEY` é substituído na hospedagem. Não muda nada no código.

Se a chave for apagada, a galeria continua funcionando pela listagem pública da pasta até uma nova chave ser configurada.

### Combinado com o cliente

- **A pasta precisa continuar com o link público.** Se ficar privada, a galeria para de mostrar as fotos, com ou sem chave. Para uma pasta privada seria preciso outra solução, com uma conta de serviço do Google adicionada como leitora da pasta.
- **Formato das fotos**: RAW funciona, mas exportar em JPEG deixa o upload cerca de 8 vezes mais leve e as fotos aparecem mais rápido.
- **LGPD**: avisar no cadastro que os treinos são fotografados e que as fotos ficam públicas no site.

## O que personalizar

1. **WhatsApp e endereço**: `src/lib/config.ts` (`whatsappNumber` está com um número de exemplo).
2. **Ranking, loja, anúncios, patrocinadores, galeria**: `src/lib/data.ts` (dados de exemplo).
3. **Imagens**: substitua os SVGs placeholder em `public/img/**` mantendo os nomes, ou gere novos com `node scripts/gen-placeholders.mjs`.
4. **Vídeo de fundo do hero**: coloque `hero.mp4` (e opcionalmente `hero.webm`) em `public/video/`. Enquanto o arquivo não existe, o hero usa a foto `public/img/grid.webp` como poster.

## Próximos passos sugeridos

- Backend para o cadastro e o ranking (ex.: Supabase ou Google Sheets) no lugar dos dados estáticos.
- Pagamento online na loja (Pix / Mercado Pago) se não quiser fechar só pelo WhatsApp.
