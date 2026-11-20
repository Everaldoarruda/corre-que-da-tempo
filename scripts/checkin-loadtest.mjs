// Teste de carga do check-in: simula N pessoas fazendo check-in e V celulares com a tela aberta.
//
//   node scripts/checkin-loadtest.mjs --url http://localhost:3100 --n 200 --janela 120 --telas 200
//
// Cada check-in tenta de novo como o celular real (2 s, 4 s, 7 s) quando a planilha está ocupada.
// Cada tela aberta consulta /api/checkin a cada 30 s, como a página real.
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
const BASE = args.url ?? "http://localhost:3100";
const N = Number(args.n ?? 200); // check-ins
const JANELA_S = Number(args.janela ?? 120); // em quantos segundos as pessoas chegam
const TELAS = Number(args.telas ?? N); // celulares com a página aberta
const POLL_MS = 30_000;
const RETRY = [2_000, 4_000, 7_000];
const MOCK = args.mock; // URL do simulador para ler os contadores do "Google"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (arr, p) => (arr.length ? arr.slice().sort((a, b) => a - b)[Math.min(arr.length - 1, Math.floor((p / 100) * arr.length))] : 0);

const res = { primeira: 0, aposRetry: 0, duplicado: 0, falhou: 0, erros: {}, tempos: [], tentativas: [] };
const gets = { total: 0, erros: 0, tempos: [] };

async function checkin(i) {
  const nome = `Corredor ${String(i).padStart(3, "0")}`;
  const t0 = Date.now();
  for (let tentativa = 0; tentativa <= RETRY.length; tentativa++) {
    let r;
    try {
      const resp = await fetch(`${BASE}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: BASE },
        body: JSON.stringify({ tipo: i % 7 === 0 ? "Criança" : "Adulto", nome, responsavel: "Responsável Teste", consentimento: true, origem: "qr" }),
      });
      r = await resp.json();
    } catch {
      r = { ok: false, erro: "ocupado" };
    }
    if (r.ok) {
      res.tempos.push(Date.now() - t0);
      res.tentativas.push(tentativa + 1);
      if (r.duplicado) res.duplicado++;
      else if (tentativa === 0) res.primeira++;
      else res.aposRetry++;
      return;
    }
    if (r.erro !== "ocupado" || tentativa === RETRY.length) {
      res.falhou++;
      res.erros[r.erro] = (res.erros[r.erro] ?? 0) + 1;
      return;
    }
    await sleep(RETRY[tentativa]);
  }
}

let fim = false;
async function tela() {
  await sleep(Math.random() * POLL_MS);
  while (!fim) {
    const t0 = Date.now();
    gets.total++;
    try {
      const r = await fetch(`${BASE}/api/checkin`);
      if (!r.ok) gets.erros++;
      await r.json();
    } catch {
      gets.erros++;
    }
    gets.tempos.push(Date.now() - t0);
    await sleep(POLL_MS);
  }
}

console.log(`Alvo ${BASE}: ${N} check-ins em ${JANELA_S}s, ${TELAS} telas abertas consultando a cada 30s...`);
const inicio = Date.now();
const telas = Array.from({ length: TELAS }, tela);
await Promise.all(
  Array.from({ length: N }, (_, i) => sleep(Math.random() * JANELA_S * 1000).then(() => checkin(i + 1))),
);
fim = true;
await Promise.race([Promise.all(telas), sleep(1000)]);
const dur = ((Date.now() - inicio) / 1000).toFixed(0);

console.log("\n=== Resultado ===");
console.table({
  "Check-ins na 1ª tentativa": res.primeira,
  "Check-ins após nova tentativa": res.aposRetry,
  "Já registrados (duplicado)": res.duplicado,
  "Falharam": res.falhou,
  "Tempo até confirmar p50 (s)": (pct(res.tempos, 50) / 1000).toFixed(1),
  "Tempo até confirmar p95 (s)": (pct(res.tempos, 95) / 1000).toFixed(1),
  "Tempo até confirmar máx (s)": (Math.max(0, ...res.tempos) / 1000).toFixed(1),
  "Consultas das telas": gets.total,
  "Consultas com erro": gets.erros,
  "Consulta p95 (ms)": pct(gets.tempos, 95),
  "Duração do teste (s)": dur,
});
if (Object.keys(res.erros).length) console.log("Erros:", res.erros);
if (MOCK) console.log("No 'Google' (simulador):", await (await fetch(`${MOCK}/__stats`)).json());
