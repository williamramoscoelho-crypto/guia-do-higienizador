/**
 * Coleta trechos oficiais (mancha, tecido, diluição) das fichas já cadastradas.
 * Só o que a página publica. Sem inventar.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fichas = JSON.parse(readFileSync(join(root, "src", "data", "fichas-fabricantes.raw.json"), "utf8"));

const UA =
  "GuiaDoHigienizador/1.0 (+https://github.com/williamramoscoelho-crypto/guia-do-higienizador; consulta editorial de fichas públicas)";

const PALAVRAS =
  /mancha|caf[eé]|vinho|sangue|urina|v[oô]mito|gordura|[oó]leo|graxa|fezes|leite|suor|odor|tinta|caneta|tomate|chocolate|barro|couro|suede|linho|algod[aã]o|chenille|sint[eé]tico|per[oó]xido|alvej|tanino|enzim/gi;

function decode(s) {
  return s
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&agrave;/gi, "à")
    .replace(/&aacute;/gi, "á")
    .replace(/&atilde;/gi, "ã")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&eacute;/gi, "é")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&oacute;/gi, "ó")
    .replace(/&otilde;/gi, "õ")
    .replace(/&uacute;/gi, "ú")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function strip(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function snippets(text) {
  const hits = [];
  const re = new RegExp(PALAVRAS.source, "gi");
  let m;
  while ((m = re.exec(text))) {
    const start = Math.max(0, m.index - 90);
    const end = Math.min(text.length, m.index + m[0].length + 160);
    const trecho = text.slice(start, end).replace(/\s+/g, " ").trim();
    if (trecho.length > 40 && !hits.includes(trecho)) hits.push(trecho);
    if (hits.length >= 8) break;
  }
  return hits;
}

const extras = [
  "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
  "https://protelim.com.br/wp-content/uploads/2024/03/Manual-SHP-Prot-Water.pdf",
];

const urls = [...new Set([...fichas.map((f) => f.url).filter(Boolean), ...extras])];

const out = [];
for (const url of urls) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/pdf,*/*", "Accept-Language": "pt-BR,pt;q=0.9" },
      redirect: "follow",
    });
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "";
    let text = "";
    if (ct.includes("pdf") || url.endsWith(".pdf")) {
      text = new TextDecoder("latin1").decode(buf).replace(/[^\x20-\x7EÀ-ÿ\n]/g, " ");
    } else {
      text = strip(new TextDecoder("utf-8").decode(buf));
    }
    const ficha = fichas.find((f) => f.url === url);
    out.push({
      slug: ficha?.slug ?? "extra",
      marca: ficha?.marca ?? "",
      nome: ficha?.nome ?? url,
      url: res.url,
      status: res.status,
      trechos: snippets(text),
    });
    console.log(res.status, (ficha?.slug ?? "extra").padEnd(28), snippets(text).length, "trechos");
  } catch (err) {
    console.error("FALHA", url, err.message);
  }
  await new Promise((r) => setTimeout(r, 400));
}

const dest = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "manchas-produtos.raw.json");
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log("salvo", dest);
