// Simulador local do Apps Script de check-in.
// Executa o MESMO arquivo integrations/apps-script/checkin.gs com uma planilha em memória.
//
//   npm run checkin:mock            (porta 4010, check-in sempre aberto)
//   CHECKIN_SCRIPT_URL=http://localhost:4010  CHECKIN_SECRET=dev-secret  no .env.local
import http from "node:http";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT ?? 4010);
const SECRET = process.env.CHECKIN_SECRET ?? "dev-secret";
const ALWAYS_OPEN = process.env.MOCK_ALWAYS_OPEN !== "0";
// Limites aproximados do Google Apps Script
const LATENCY_MS = Number(process.env.MOCK_LATENCY_MS ?? 700); // tempo de cada execução
const WRITE_MS = Number(process.env.MOCK_WRITE_MS ?? 400); // gravação dentro do lock
const MAX_CONCURRENT = Number(process.env.MOCK_MAX_CONCURRENT ?? 30); // execuções simultâneas por conta
const LOCK_TIMEOUT_MS = 30000;

// ---------- Planilha em memória ----------
function makeSheet() {
  const data = [];
  return {
    data,
    appendRow: (r) => data.push(r.map((v) => String(v))),
    setFrozenRows() {},
    getLastRow: () => data.length,
    getRange: (row, col, numRows, numCols) => ({
      setNumberFormat() {},
      setValues: (vals) => vals.forEach((r, i) => (data[row - 1 + i] = r.map((v) => String(v)))),
      getDisplayValues: () => data.slice(row - 1, row - 1 + numRows).map((r) => r.slice(col - 1, col - 1 + numCols)),
    }),
    getDataRange: () => ({ getDisplayValues: () => data.map((r) => [...r]) }),
  };
}
const cacheStore = new Map();
const sheets = {};
const spreadsheet = {
  getSheetByName: (n) => sheets[n] ?? null,
  insertSheet: (n) => (sheets[n] = makeSheet()),
};
const props = { CHECKIN_SECRET: SECRET };

// ---------- Stubs dos serviços do Google ----------
function formatDate(date, tz, pattern) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
    }).formatToParts(date).map((p) => [p.type, p.value]),
  );
  const dow = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[parts.weekday];
  if (pattern === "yyyy-MM-dd") return `${parts.year}-${parts.month}-${parts.day}`;
  if (pattern === "HH:mm") return `${parts.hour}:${parts.minute}`;
  if (pattern === "u") return String(dow);
  throw new Error("padrão não suportado no mock: " + pattern);
}

const context = vm.createContext({
  SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet },
  Utilities: { formatDate, getUuid: () => randomUUID() },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null, setProperty: (k, v) => (props[k] = v) }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, releaseLock() {} }) },
  CacheService: {
    getScriptCache: () => ({
      get: (k) => { const v = cacheStore.get(k); return v && v.exp > Date.now() ? v.val : null; },
      put: (k, val, ttl) => cacheStore.set(k, { val, exp: Date.now() + ttl * 1000 }),
      remove: (k) => cacheStore.delete(k),
    }),
  },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (s) => ({ content: s, setMimeType() { return this; } }),
  },
  Logger: { log: (...a) => console.log("[Logger]", ...a) },
  console,
});
const SCRIPT_FILE = process.env.MOCK_SCRIPT || new URL("../integrations/apps-script/checkin.gs", import.meta.url);
vm.runInContext(readFileSync(SCRIPT_FILE, "utf8"), context, {
  filename: "checkin.gs",
});
context.setup();

if (ALWAYS_OPEN) {
  // Ajusta a aba Config para "hoje, o dia todo", só no simulador
  const today = formatDate(new Date(), "America/Recife", "u");
  for (const row of sheets.Config.data) {
    if (row[0] === "dia_semana") row[1] = today;
    if (row[0] === "abre") row[1] = "00:00";
    if (row[0] === "fecha") row[1] = "23:59";
  }
}
if (process.env.MOCK_CODIGO) {
  // Simula o código do dia ligado na aba Config
  for (const row of sheets.Config.data) {
    if (row[0] === "exigir_codigo") row[1] = "SIM";
    if (row[0] === "codigo") row[1] = process.env.MOCK_CODIGO;
  }
}

// ---------- Servidor HTTP ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let inflight = 0;
let writeQueue = Promise.resolve();
const counters = { get: 0, post: 0, recusadas_limite: 0, ocupado: 0, maxSimultaneas: 0 };

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname === "/__stats") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ...counters, linhas: (sheets.Presencas?.data.length ?? 1) - 1 }));
    }
    if (inflight >= MAX_CONCURRENT) {
      // O Google responde com uma página de erro em HTML quando passa do limite
      counters.recusadas_limite++;
      res.writeHead(503, { "Content-Type": "text/html" });
      return res.end("<html><body>Service invoked too many times in a short time</body></html>");
    }
    inflight++;
    counters.maxSimultaneas = Math.max(counters.maxSimultaneas, inflight);
    const send = (out) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(out.content);
    };
    try {
      if (req.method === "GET") {
        counters.get++;
        await sleep(LATENCY_MS);
        return send(context.doGet({ parameter: Object.fromEntries(url.searchParams) }));
      }
      if (req.method === "POST") {
        counters.post++;
        let body = "";
        for await (const c of req) body += c;
        await sleep(LATENCY_MS);
        // Gravações passam uma de cada vez pelo lock, como no script real
        const enteredAt = Date.now();
        const turn = writeQueue.then(async () => {
          if (Date.now() - enteredAt > LOCK_TIMEOUT_MS) {
            counters.ocupado++;
            return { content: JSON.stringify({ ok: false, erro: "ocupado", mensagem: "Muita gente fazendo check-in agora." }) };
          }
          let itens = 1;
          try { itens = JSON.parse(body).itens?.length ?? 1; } catch {}
          await sleep(WRITE_MS + 20 * itens); // custo fixo da execução + um pouco por linha
          counters.lotes = (counters.lotes ?? 0) + 1;
          counters.maiorLote = Math.max(counters.maiorLote ?? 0, itens);
          return context.doPost({ postData: { contents: body } });
        });
        writeQueue = turn.catch(() => {});
        return send(await turn);
      }
      res.writeHead(405).end();
    } finally {
      inflight--;
    }
  })
  .listen(PORT, () =>
    console.log(
      `Simulador de check-in em http://localhost:${PORT} (segredo: ${SECRET}, sempre aberto: ${ALWAYS_OPEN}, latência ${LATENCY_MS} ms, gravação ${WRITE_MS} ms, máx. ${MAX_CONCURRENT} simultâneas)`,
    ),
  );
