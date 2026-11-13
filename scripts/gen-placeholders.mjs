// Gera imagens SVG placeholder (galeria, loja, anúncios, patrocinadores).
// Substitua os arquivos em public/img pelas fotos e logos reais mantendo os nomes.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "public", "img");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function svg({ w, h, title, sub, bg1 = "#111", bg2 = "#2a2a2a", accent = "#FFD400", fontSize = 48 }) {
  const subText = sub
    ? `<text x="50%" y="62%" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(fontSize * 0.45)}" fill="#eee">${esc(sub)}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="0" y="${h - 14}" width="${w}" height="14" fill="${accent}"/>
  <text x="50%" y="48%" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-size="${fontSize}" fill="${accent}" letter-spacing="2">${esc(title)}</text>
  ${subText}
</svg>`;
}

const out = (dir, name, content) => {
  mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, dir, name), content);
};

for (let i = 1; i <= 8; i++) {
  out("galeria", `foto-${String(i).padStart(2, "0")}.svg`, svg({ w: 800, h: 800, title: `FOTO ${i}`, sub: "Treino Corre que dá Tempo", bg1: i % 2 ? "#0b0b0b" : "#1c1c1c", bg2: i % 3 ? "#3a3000" : "#333", fontSize: 72 }));
}
const loja = [["camisa", "CAMISA"], ["bone", "BONÉ"], ["garrafa", "GARRAFA"], ["viseira", "VISEIRA"], ["adesivo", "ADESIVOS"], ["regata", "REGATA"]];
for (const [file, label] of loja) {
  out("loja", `${file}.svg`, svg({ w: 600, h: 600, title: label, sub: "Corre que dá Tempo", fontSize: 64 }));
}
for (let i = 1; i <= 4; i++) {
  out("anuncios", `anuncio-${String(i).padStart(2, "0")}.svg`, svg({ w: 1200, h: 500, title: `ANÚNCIO ${i}`, sub: "Espaço do fornecedor", bg1: "#141414", bg2: "#3a3000", fontSize: 80 }));
}
const patro = [["junior-de-cleto", "Júnior de Cleto"], ["cross-j", "CROSS J"], ["ph-gym", "pH GYM"], ["lt-divulga", "LT Divulga"], ["lt-noticias", "LT Notícias"], ["lt-ordinario", "LT Ordinário"]];
for (const [file, label] of patro) {
  out("patrocinadores", `${file}.svg`, svg({ w: 320, h: 120, title: label, bg1: "#000", bg2: "#000", accent: "#fff", fontSize: 30 }));
}
console.log("placeholders gerados em", root);
