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
| Números | `src/components/site/stats.tsx` + `live-sections.tsx` | Seguidores (aba Config), corredores no último treino e treinos realizados (check-in), percurso (mapa). Animados com Anime.js |
| Ranking | `src/components/site/ranking.tsx` + `ranking-charts.tsx` | Ranking de presença (este mês / geral) vindo do check-in, pódio animado, lista de presença e 2 gráficos |
| Anúncios de fornecedores | `src/components/site/anuncios.tsx` | Carrossel com autoplay, aparece 2x no body |
| Check-in | `src/components/site/checkin-section.tsx` + `checkin-form.tsx` | Substitui o cadastro. Nome ou apelido, adulto ou criança, grava na planilha. Também em `/checkin` (QR Code) |
| Galeria | `src/components/site/galeria.tsx` + `galeria-grid.tsx` | Lê a pasta pública do Google Drive a cada 5 min, grid paginado, visualizador e botão de baixar |
| Percurso | `src/components/site/percurso.tsx` + `route-map.tsx` | Mapa real (Leaflet/OpenStreetMap) com rota pelas ruas em `src/lib/route.ts`, desenhada com `svg.createDrawable` e corredor via `svg.createMotionPath` |
| Loja | `src/components/site/loja.tsx` | Carrinho em Sheet, pedido finalizado via WhatsApp |
| Contato | `src/components/site/contato.tsx` | CTA WhatsApp, atalhos para anunciante e patrocinador |
| Footer | `src/components/site/footer.tsx` | Logos dos patrocinadores |

## Check-in (planilha do Google)

Na concentração, o corredor aponta a câmera para o QR Code ou abre a seção Check-in do site, digita o nome ou apelido, escolhe adulto ou criança e confirma. O celular lembra o nome: na semana seguinte é um toque só.

Cada check-in vira uma linha numa planilha do Google, gravada por um Apps Script. Sem banco de dados. A partir dela o site calcula:

- **Corredores no último treino** e **treinos realizados** (faixa de números do topo).
- **Ranking de presença** do mês e geral, com pódio e lista de presença.
- **Gráfico de corredores por treino**, separando adultos e crianças.

Regras aplicadas pelo script:

- Abre só no dia e horário da aba `Config` (padrão: quarta, 19:30 às 21:30, horário de Recife).
- O mesmo nome conta uma vez por dia, ignorando acentos e maiúsculas.
- Criança exige o nome do responsável. O nome da criança fica só na planilha: o site recebe apenas a contagem (LGPD).
- Código do dia opcional: com `exigir_codigo = SIM` na aba `Config`, o corredor digita o código anunciado na concentração.

### Instalar a planilha (uma vez)

1. Crie uma planilha nova no Google Sheets (ex.: "Check-in Corre que dá Tempo"). Ela pode continuar **privada**.
2. Abra **Extensões > Apps Script**, apague o conteúdo e cole o arquivo `integrations/apps-script/checkin.gs`. Salve.
3. No seletor de funções, escolha **setup** e clique em **Executar**. Autorize o acesso à planilha. O registro de execução mostra `CHECKIN_SECRET = ...`: copie esse valor.
4. Clique em **Implantar > Nova implantação**, tipo **App da Web**. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**. Clique em **Implantar** e copie a URL que termina em `/exec`.
5. No `.env.local` (e na hospedagem), preencha:

```
CHECKIN_SCRIPT_URL=https://script.google.com/macros/s/.../exec
CHECKIN_SECRET=o-valor-copiado-no-passo-3
```

6. Reinicie o site. A seção Check-in mostra "Check-in aberto agora" no dia e horário configurados.

"Qualquer pessoa" no passo 4 só permite chamar o script. Sem o segredo, ele não lê nem grava nada, e a planilha continua privada.

### Uso no dia a dia

- **QR Code**: abra `/checkin/qr` no site e imprima o cartaz, ou mostre na tela do celular. Ele aponta para `/checkin?origem=qr`.
- **Corrigir um check-in**: apague ou edite a linha na aba `Presencas`. O site atualiza em até 1 minuto.
- **Seguidores do Instagram**: atualize `seguidores_instagram` na aba `Config`.
- **Mudar dia ou horário**: edite `dia_semana` (1 = segunda ... 7 = domingo), `abre` e `fecha` na aba `Config`.
- **Atualizar o código do script**: cole a versão nova e use **Implantar > Gerenciar implantações > Editar > Nova versão**. A URL continua a mesma.

### Capacidade (pico de check-ins)

O Apps Script aceita cerca de 30 execuções simultâneas por conta. Para não chegar perto disso:

- **Consultas**: a contagem que os celulares mostram fica em cache por 15 s no servidor e na CDN da Vercel. A página só consulta com a tela visível, a cada 30 s.
- **Gravações em lote**: o servidor junta os check-ins que chegam no mesmo instante (até 25) e grava todos numa única execução do script.
- **Novas tentativas**: se a planilha estiver ocupada, o celular tenta de novo sozinho (2 s, 4 s e 7 s). Repetir é seguro: o mesmo nome no mesmo dia nunca conta duas vezes.
- **Script antigo**: se a planilha ainda tiver a versão sem lotes, o site detecta e envia um por vez.

Resultado no simulador, com gravações mais lentas que as do Google:

| Cenário | Confirmados | Mais lento | Execuções simultâneas no Google |
| --- | --- | --- | --- |
| 200 pessoas em 2 min, 200 telas abertas | 200 de 200 | 4,4 s | 2 |
| 200 pessoas em 20 s | 200 de 200 | 5,8 s | 2 |
| Os mesmos 200 tocando de novo | 200 como "já registrado" | | |

Para repetir o teste (simulador em um terminal, site de produção local em outro):

```bash
npm run checkin:mock
npm run build && npx next start -p 3100
node scripts/checkin-loadtest.mjs --url http://localhost:3100 --n 200 --janela 120 --telas 200 --mock http://localhost:4010
```

O site precisa de `CHECKIN_SCRIPT_URL=http://localhost:4010` e `CHECKIN_SECRET=dev-secret` para apontar para o simulador.

### Testar sem a planilha

O simulador roda o mesmo `checkin.gs` com uma planilha em memória, sempre aberto:

```bash
npm run checkin:mock
```

E no `.env.local`: `CHECKIN_SCRIPT_URL=http://localhost:4010` e `CHECKIN_SECRET=dev-secret`. Os dados somem ao parar o simulador.

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

1. **Check-in**: `CHECKIN_SCRIPT_URL` e `CHECKIN_SECRET` (veja a seção Check-in).
1. **WhatsApp e endereço**: `src/lib/config.ts` (`whatsappNumber` está com um número de exemplo).
2. **Loja, anúncios e patrocinadores**: `src/lib/data.ts` (dados de exemplo).
3. **Imagens**: substitua os SVGs placeholder em `public/img/**` mantendo os nomes, ou gere novos com `node scripts/gen-placeholders.mjs`.
4. **Vídeo de fundo do hero**: coloque `hero.mp4` (e opcionalmente `hero.webm`) em `public/video/`. Enquanto o arquivo não existe, o hero usa a foto `public/img/grid.webp` como poster.

## Próximos passos sugeridos

- Pagamento online na loja (Pix / Mercado Pago) se não quiser fechar só pelo WhatsApp.
