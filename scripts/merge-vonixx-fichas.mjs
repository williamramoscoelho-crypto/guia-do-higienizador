/**
 * Mescla a coleta Vonixx (scripts/vonixx-estofados/out/vonixx_estofados.json)
 * nas fichas do Guia. Só preenche o que o fabricante publicou.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = join(root, "scripts", "vonixx-estofados", "out", "vonixx_estofados.json");
const tsPath = join(root, "src", "data", "fichas-fabricantes.ts");

if (!existsSync(jsonPath)) {
  console.error("Rode antes: npm run scrape:vonixx");
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

function clipClean(s, max) {
  const t = String(s || "")
    .replace(/-->/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+[A-ZÁÉÍÓÚ0-9][A-ZÁÉÍÓÚ0-9\s-]{2,40} COMPRE AGORA[\s\S]*$/i, "")
    .replace(/\s+COMPRE AGORA[\s\S]*$/i, "")
    .replace(/\s+FICHA TÉCNICA\s*$/i, "")
    .replace(/\s+(EXTRACTUS(?: SENSITIVE)?|BACTRAN|SANITIZANTE FINALIZADOR|SINTRA PRO|SINTRA FAST|VERTEX)\s*$/i, "")
    .replace(/\s*(COMPARE|PERGUNTAS FREQUENTES|AVALIAÇÕES DO PRODUTO|Selecione um Produto|Carregando\.\.\.).*$/i, "")
    .trim();
  if (!t || /CERAS E SELANTES|LOJA ONLINE|VER TODOS OS PRODUTOS/.test(t)) return "";
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (last > 80 ? cut.slice(0, last + 1) : `${cut.trim()}…`).trim();
}

for (const f of fichas) {
  const src = bySlug.get(f.slug);
  if (!src) continue;
  f.nome = src.nome || f.nome;
  f.url = src.url || f.url;
  f.resumo = clipClean(src.resumo, 620) || f.resumo;
  f.diluicao = clipClean(src.diluicao, 520);
  f.ph = clipClean(src.ph, 160).replace(/^alcalino\b/i, "Alcalino");
  f.usoRecomendado = clipClean(src.usoRecomendado, 420);
  f.naoRecomendado = clipClean(src.naoRecomendado, 520);
  if ("composicao" in src) f.composicao = clipClean(src.composicao, 300);
  if (/^\.\s/.test(f.composicao || "")) f.composicao = "";
  f.modoDeUsar = clipClean(src.modoDeUsar, 900);
  f.embalagens = clipClean(src.embalagens, 80);
  f.fdsPdf = src.fdsPdf || f.fdsPdf;
  f.fichaPdf = src.fichaPdf || f.fichaPdf;
  f.coletadoEm = src.coletadoEm || f.coletadoEm;
  if (src.sdsPdf) f.sdsPdf = src.sdsPdf;
  if (src.linha) f.linha = src.linha;
  if (src.fichaTecnica) f.fichaTecnica = clipClean(src.fichaTecnica, 1200);
  if (Array.isArray(src.faq) && src.faq.length) {
    f.faq = src.faq.filter((q) => q?.p && q?.r && String(q.r).length >= 8).slice(0, 8);
  }
  if (Array.isArray(src.documentos) && src.documentos.length) {
    f.documentos = src.documentos.map((d) => ({ label: d.label, url: d.url }));
  }
  n += 1;
}

const next = ts.replace(m[1], `${JSON.stringify(fichas, null, 2)};`);
writeFileSync(tsPath, next, "utf8");
console.log(`Mesclados ${n} produtos Vonixx em ${tsPath}`);
