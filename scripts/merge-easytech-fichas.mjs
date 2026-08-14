/**
 * Mescla a coleta Easytech (scripts/easytech-estofados/out/easytech_estofados.json)
 * nas fichas do Guia. Só slugs Easytech. Não inventa química.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = join(root, "scripts", "easytech-estofados", "out", "easytech_estofados.json");
const tsPath = join(root, "src", "data", "fichas-fabricantes.ts");

if (!existsSync(jsonPath)) {
  console.error("Rode antes: npm run scrape:easytech");
  process.exit(1);
}

const overlay = JSON.parse(readFileSync(jsonPath, "utf8"));
const ts = readFileSync(tsPath, "utf8");
const m = ts.match(/export const fichasFabricantes: FichaFabricante\[\] = (\[[\s\S]*?\n\];)/);
if (!m) {
  console.error("Não achei o array fichasFabricantes.");
  process.exit(1);
}

const fichas = JSON.parse(m[1].slice(0, -1));
const bySlug = new Map(overlay.map((p) => [p.slug, p]));
let n = 0;
const merged = [];

function clipClean(s, max) {
  let t = String(s || "")
    .replace(/-->/g, " ")
    .replace(/&rsquo;|&lsquo;/gi, "’")
    .replace(/&iacute;/gi, "í")
    .replace(/&aacute;/gi, "á")
    .replace(/\s+/g, " ")
    .replace(
      /\s*(Revenda Easytech|Fabricando produtos|Seja um Revendedor|Na Easy a química|Peso \d|Dimensões \d|Entrar Nome de usuário|Utilizamos cookies).*$/i,
      "",
    )
    .replace(/1,\s+5L/g, "1,5L")
    .replace(/,\s*1$/, "")
    .replace(/^que\s+/i, "")
    .replace(/^;\s*/, "")
    .trim();
  if (!t) return "";
  if (/CERAS E SELANTES|LOJA ONLINE|VER TODOS OS PRODUTOS/.test(t)) return "";
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (last > 80 ? cut.slice(0, last + 1) : `${cut.trim()}…`).trim();
}

function applyOverlay(f, src) {
  f.nome = src.nome || f.nome;
  f.url = src.url || f.url;
  f.resumo = clipClean(src.resumo, 620) || f.resumo;
  f.diluicao = clipClean(src.diluicao, 520);
  f.ph = clipClean(src.ph, 160);
  f.usoRecomendado = clipClean(src.usoRecomendado, 420);
  f.naoRecomendado = clipClean(src.naoRecomendado, 420);
  f.composicao = clipClean(src.composicao, 420);
  f.modoDeUsar = clipClean(src.modoDeUsar, 900);
  f.embalagens = clipClean(src.embalagens, 120);
  f.fdsPdf = src.fdsPdf || f.fdsPdf || "";
  f.fichaPdf = src.fichaPdf || f.fichaPdf || "";
  f.coletadoEm = src.coletadoEm || f.coletadoEm;
  if (src.sdsPdf) f.sdsPdf = src.sdsPdf;
  if (src.linha) f.linha = src.linha;
  if (src.fichaTecnica) f.fichaTecnica = clipClean(src.fichaTecnica, 1200);
  if (Array.isArray(src.faq) && src.faq.length) f.faq = src.faq.slice(0, 8);
  if (Array.isArray(src.documentos) && src.documentos.length) {
    f.documentos = src.documentos.map((d) => ({ label: d.label, url: d.url }));
  }
}

for (const f of fichas) {
  const src = bySlug.get(f.slug);
  if (!src) continue;
  if (f.marca !== "easytech") continue;
  applyOverlay(f, src);
  n += 1;
  merged.push(f.slug);
  bySlug.delete(f.slug);
}

const novos = [];
for (const src of overlay) {
  if (!bySlug.has(src.slug)) continue;
  if (!src.url || !/^https?:\/\//i.test(src.url)) continue;
  if (!/easytech/i.test(src.slug) && src.marca !== "easytech") continue;
  const ficha = {
    slug: src.slug,
    marca: "easytech",
    nome: src.nome || src.slug,
    url: src.url,
    resumo: clipClean(src.resumo, 620),
    diluicao: clipClean(src.diluicao, 520),
    ph: clipClean(src.ph, 160),
    usoRecomendado: clipClean(src.usoRecomendado, 420),
    naoRecomendado: clipClean(src.naoRecomendado, 420),
    composicao: clipClean(src.composicao, 420),
    modoDeUsar: clipClean(src.modoDeUsar, 900),
    embalagens: clipClean(src.embalagens, 120),
    fichaPdf: src.fichaPdf || "",
    fdsPdf: src.fdsPdf || "",
    coletadoEm: src.coletadoEm || "",
  };
  if (src.linha) ficha.linha = src.linha;
  if (src.fichaTecnica) ficha.fichaTecnica = clipClean(src.fichaTecnica, 1200);
  if (src.sdsPdf) ficha.sdsPdf = src.sdsPdf;
  const lastEasy = fichas.reduce((idx, row, i) => (row.marca === "easytech" ? i : idx), -1);
  fichas.splice(lastEasy + 1, 0, ficha);
  n += 1;
  novos.push(src.slug);
  merged.push(src.slug);
}

const next = ts.replace(m[1], `${JSON.stringify(fichas, null, 2)};`);
writeFileSync(tsPath, next, "utf8");
console.log(`Mesclados ${n} produtos Easytech em ${tsPath}`);
if (merged.length) console.log("Slugs:", merged.join(", "));
if (novos.length) console.log("Novos:", novos.join(", "));
