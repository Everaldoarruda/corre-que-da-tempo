// Grava o site em 1920x1080 seguindo a grade de cenas (segundos) e salva rec.webm + scenes-timing.json
import puppeteer from "puppeteer";
import { writeFileSync } from "node:fs";

const FFMPEG = "C:\\Users\\ejmar\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe";
const URL = "http://localhost:3001/";
const TOTAL = 60;

// início de cada cena (s). A narração de cada uma começa 0,4 s após o corte.
const SCENES = [
  { name: "hero", at: 0 },
  { name: "ranking", at: 11.5 },
  { name: "cadastro", at: 18.5 },
  { name: "galeria", at: 24.5 },
  { name: "percurso", at: 29.5 },
  { name: "loja", at: 35.5 },
  { name: "anuncios", at: 41.5 },
  { name: "fim", at: 47.5 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: true,
  args: ["--window-size=1600,900", "--autoplay-policy=no-user-gesture-required", "--disable-gpu-vsync"],
  defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1.2 },
});
const page = await browser.newPage();
await page.goto(URL, { waitUntil: "networkidle0" });
// pré-aquecer: rolar até o fim e voltar para carregar imagens/tiles do mapa
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
});
await sleep(1500);
await page.reload({ waitUntil: "networkidle0" });
await sleep(500);

const scrollTo = (sel, offset = -70) =>
  page.evaluate((s, o) => {
    const el = document.querySelector(s);
    const top = el.getBoundingClientRect().top + window.scrollY + o;
    window.scrollTo({ top, behavior: "smooth" });
  }, sel, offset);
const scrollBy = (dy) => page.evaluate((d) => window.scrollBy({ top: d, behavior: "smooth" }), dy);
const clickText = async (text) => {
  const h = await page.evaluateHandle((t) => [...document.querySelectorAll("button, a")].find((b) => b.textContent.trim().startsWith(t)), text);
  const el = h.asElement();
  if (el) await el.click();
};

const start = Date.now();
const now = () => (Date.now() - start) / 1000;
const until = async (t) => { const d = t * 1000 - (Date.now() - start); if (d > 0) await sleep(d); };

const recorder = await page.screencast({ path: "rec.webm", ffmpegPath: FFMPEG });

// HERO 0–11.5: parado 6s, depois leve rolagem para mostrar os números
await until(6.5); await scrollBy(420);

// RANKING 11.5–18.5
await until(11.5); await scrollTo("#ranking");
await until(14.5); await clickText("Melhores do mês");
await until(16.3); await scrollBy(520);

// CADASTRO 18.5–24.5
await until(18.5); await scrollTo("#cadastro");
await until(21.5); await page.click('#cadastro input[placeholder="Seu nome"]').catch(() => {});
await page.keyboard.type("Maria Silva", { delay: 70 });

// GALERIA 24.5–29.5
await until(24.5); await scrollTo("#galeria");
await until(27.2); await scrollBy(380);

// PERCURSO 29.5–35.5
await until(29.5); await scrollTo("#percurso");

// LOJA 35.5–41.5
await until(35.5); await scrollTo("#loja");
await until(37.8); await page.evaluate(() => { const b=[...document.querySelectorAll("#loja button")].find(x=>x.textContent.includes("Adicionar")); b && b.click(); });
await until(40.9); await page.keyboard.press("Escape");

// ANÚNCIOS + PATROCINADORES 41.5–47.5
await until(41.5); await page.evaluate(() => { const els=[...document.querySelectorAll("div")].filter(d=>d.textContent.trim().startsWith("Parceiros e fornecedores") && d.children.length<=1); const el=els[els.length-1]; const top=el.getBoundingClientRect().top+window.scrollY-120; window.scrollTo({top, behavior:"smooth"}); });
await until(44.8); await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));

// FIM 47.5–60: contato com o cartão do WhatsApp
await until(47.5); await scrollTo("#contato");
await until(56.5); await scrollTo("#top");

await until(TOTAL);
await recorder.stop();
await browser.close();
writeFileSync("scenes-timing.json", JSON.stringify(SCENES, null, 2));
console.log("ok rec.webm", now().toFixed(1), "s");
