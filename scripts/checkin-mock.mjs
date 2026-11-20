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

// ---------- Planilha em memória ----------
function makeSheet() {
  const data = [];
  return {
    data,
    appendRow: (r) => data.push(r.map((v) => String(v))),
    setFrozenRows() {},
    getRange: () => ({ setNumberFormat() {} }),
    getDataRange: () => ({ getDisplayValues: () => data.map((r) => [...r]) }),
  };
}
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
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (s) => ({ content: s, setMimeType() { return this; } }),
  },
  Logger: { log: (...a) => console.log("[Logger]", ...a) },
  console,
});
vm.runInContext(readFileSync(new URL("../integrations/apps-script/checkin.gs", import.meta.url), "utf8"), context, {
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

// ---------- Servidor HTTP ----------
http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const send = (out) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(out.content);
    };
    if (req.method === "GET") return send(context.doGet({ parameter: Object.fromEntries(url.searchParams) }));
    if (req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => send(context.doPost({ postData: { contents: body } })));
      return;
    }
    res.writeHead(405).end();
  })
  .listen(PORT, () => console.log(`Simulador de check-in em http://localhost:${PORT} (segredo: ${SECRET}, sempre aberto: ${ALWAYS_OPEN})`));
