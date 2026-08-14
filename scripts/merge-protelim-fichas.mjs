/**
 * Mescla a coleta Protelim (scripts/protelim-estofados/out/protelim_estofados.json)
 * nas fichas do Guia. Só preenche o que o fabricante publicou.
 * Atualiza slugs existentes e inclui SKUs novos com marca "protelim".
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = join(root, "scripts", "protelim-estofados", "out", "protelim_estofados.json");
const tsPath = join(root, "src", "data", "fichas-fabricantes.ts");

if (!existsSync(jsonPath)) {
  console.error("Rode antes: npm run scrape:protelim");
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
let atualizados = 0;
let adicionados = 0;

function clipClean(s, max) {
  const t = String(s || "")
    .replace(/-->/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*(Quero Comprar|Produtos relacionados|Você também pode gostar|Voltar para os produtos).*$/i, "")
    .trim();
  if (!t) return "";
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (last > 80 ? cut.slice(0, last + 1) : `${cut.trim()}…`).trim();
}

function toFicha(src) {
  const ficha = {
    slug: src.slug,
    marca: "protelim",
    nome: src.nome || src.slug,
    url: src.url || "",
    resumo: clipClean(src.resumo, 620),
    diluicao: clipClean(src.diluicao, 520),
    ph: clipClean(src.ph, 160),
    usoRecomendado: clipClean(src.usoRecomendado, 420),
    naoRecomendado: clipClean(src.naoRecomendado, 420),
    composicao: clipClean(src.composicao, 420),
    modoDeUsar: clipClean(src.modoDeUsar, 900),
    embalagens: clipClean(src.embalagens, 80),
    fichaPdf: src.fichaPdf || "",
    fdsPdf: src.fdsPdf || "",
    coletadoEm: src.coletadoEm || "",
  };
  if (src.linha) ficha.linha = src.linha;
  if (src.fichaTecnica) ficha.fichaTecnica = clipClean(src.fichaTecnica, 1200);
  if (src.sdsPdf) ficha.sdsPdf = src.sdsPdf;
  if (Array.isArray(src.faq) && src.faq.length) ficha.faq = src.faq.slice(0, 8);
  if (Array.isArray(src.documentos) && src.documentos.length) {
    ficha.documentos = src.documentos.map((d) => ({ label: d.label, url: d.url }));
  }
  return ficha;
}

function applyOverlay(f, src) {
  f.marca = "protelim";
  f.nome = src.nome || f.nome;
  f.url = src.url || f.url;
  f.resumo = clipClean(src.resumo, 620) || f.resumo;
  f.diluicao = clipClean(src.diluicao, 520);
  f.ph = clipClean(src.ph, 160);
  f.usoRecomendado = clipClean(src.usoRecomendado, 420);
  f.naoRecomendado = clipClean(src.naoRecomendado, 420);
  f.composicao = clipClean(src.composicao, 420);
  f.modoDeUsar = clipClean(src.modoDeUsar, 900);
  f.embalagens = clipClean(src.embalagens, 80);
  f.fdsPdf = src.fdsPdf || f.fdsPdf;
  f.fichaPdf = src.fichaPdf || f.fichaPdf;
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
  applyOverlay(f, src);
  bySlug.delete(f.slug);
  atualizados += 1;
}

let insertAt = fichas.reduce((idx, f, i) => (f.marca === "protelim" ? i : idx), -1);
for (const src of overlay) {
  if (!bySlug.has(src.slug)) continue;
  const nova = toFicha(src);
  insertAt += 1;
  fichas.splice(insertAt, 0, nova);
  bySlug.delete(src.slug);
  adicionados += 1;
}

const next = ts.replace(m[1], `${JSON.stringify(fichas, null, 2)};`);
writeFileSync(tsPath, next, "utf8");
console.log(`Mesclados ${atualizados} Protelim existentes, ${adicionados} novos em ${tsPath}`);
console.log("Slugs:", overlay.map((p) => p.slug).join(", "));
