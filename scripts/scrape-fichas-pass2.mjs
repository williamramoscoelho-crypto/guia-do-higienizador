/**
 * Passo 2: fichas de higienização de estofados em URLs oficiais.
 * Campos só do que o fabricante publica. Diluição vazia = não inventar.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UA =
  "GuiaDoHigienizador/1.0 (+https://github.com/williamramoscoelho-crypto/guia-do-higienizador; consulta editorial de fichas públicas)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/json,*/*", "Accept-Language": "pt-BR,pt;q=0.9" },
    redirect: "follow",
  });
  return { ok: res.ok, status: res.status, url: res.url, text: await res.text() };
}

function decode(s) {
  return s
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#215;/g, "×")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|h[1-6]|tr|div)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function clip(s, max = 420) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (last > 80 ? cut.slice(0, last + 1) : cut).trim();
}

function isNavJunk(s) {
  return /CERAS E SELANTES|Selecione um Produto|Carregando\.\.\.|SAC\/RELACIONAMENTO|cookie/i.test(s);
}

function between(text, start, ends) {
  const i = text.toLowerCase().indexOf(start.toLowerCase());
  if (i < 0) return "";
  let rest = text.slice(i + start.length);
  let cut = rest.length;
  for (const e of ends) {
    const j = rest.toLowerCase().indexOf(e.toLowerCase());
    if (j >= 0 && j < cut) cut = j;
  }
  return rest.slice(0, cut).replace(/\s+/g, " ").trim();
}

function fieldFrom(text, labels) {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:\\-–]?\\s*([^\\n]{6,380})`, "i");
    const m = text.match(re);
    if (m && !isNavJunk(m[1])) return clip(m[1], 380);
  }
  return "";
}

function h1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? clip(stripTags(m[1]), 120) : "";
}

function firstUsefulParagraph(html) {
  const after = html.match(/<h1[\s\S]*?<\/h1>([\s\S]{0,8000})/i)?.[1] || html;
  const paras = [...after.matchAll(/<(p|h2|h3|li)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((m) => stripTags(m[2]))
    .filter((p) => p.length > 50 && !isNavJunk(p) && !/menu|login|cadastre/i.test(p));
  return clip(paras[0] || "", 420);
}

function pdfs(html, base) {
  const out = [];
  const re = /href=["']([^"']+\.pdf[^"']*)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(new URL(m[1], base).href);
    } catch {
      /* ignore */
    }
  }
  return [...new Set(out)];
}

function parsePage(html, url, marca, nomeHint) {
  const text = stripTags(html);
  const ficha = between(text, "Ficha Técnica", ["COMPARE", "PERGUNTAS FREQUENTES", "FAQ", "AVALIAÇÕES DO PRODUTO"]) ||
    between(text, "Detalhes do Produto", ["Variações de Embalagem", "Literatura técnica", "Atenção Distribuidores"]) ||
    between(text, "Instruções de uso", ["Dicas", "Quero comprar", "FALE COM"]);
  const bloco = ficha || text;
  const files = pdfs(html, url);
  const nome = h1(html);
  return {
    marca,
    slug: `${marca}-${new URL(url).pathname.replace(/\/+$/, "").split("/").filter(Boolean).at(-1)}`.replace(/\.html$/, ""),
    nome: nome && nome !== "Alcance Profissional" && nome !== "Produtos" ? nome : nomeHint,
    url,
    resumo: firstUsefulParagraph(html),
    diluicao: fieldFrom(bloco, ["DILUIÇÃO", "DILUIÇÕES", "Diluição"]) || fieldFrom(text, ["DILUIÇÃO", "Diluição"]),
    ph: fieldFrom(bloco, ["pH DO PRODUTO", "pH"]) || fieldFrom(text, ["pH DO PRODUTO"]),
    usoRecomendado:
      fieldFrom(bloco, ["USO RECOMENDADO", "INDICAÇÃO", "Indicação", "SUPERFÍCIES"]) ||
      fieldFrom(text, ["USO RECOMENDADO", "Indicação"]),
    naoRecomendado: fieldFrom(bloco, ["NÃO RECOMENDADO", "ADVERTÊNCIAS", "INFORMAÇÕES ADICIONAIS"]) ||
      fieldFrom(text, ["NÃO RECOMENDADO", "ADVERTÊNCIAS"]),
    composicao: fieldFrom(bloco, ["COMPOSIÇÃO"]) || fieldFrom(text, ["COMPOSIÇÃO"]),
    modoDeUsar: fieldFrom(text, ["MODO DE USAR"]) || clip(between(text, "APRENDA A FORMA CORRETA DE APLICAÇÃO DESSE PRODUTO", ["VERSÕES DISPONÍVEIS", "Ficha Técnica"]), 420),
    embalagens: fieldFrom(bloco, ["TAMANHOS DISPONÍVEIS", "EMBALAGEM", "LITRAGEM", "DISPONÍVEL"]) ||
      fieldFrom(text, ["TAMANHOS DISPONÍVEIS", "DISPONÍVEL NAS EMBALAGENS"]),
    fichaPdf: files.find((p) => /ficha|boletim|bt_|tecnica|técnica/i.test(p)) || "",
    fdsPdf: files.find((p) => /fds|fispq|sds|msds/i.test(p)) || "",
    pdfs: files.slice(0, 6),
    coletadoEm: "2026-08-13",
  };
}

const TARGETS = [
  ...[
    "hidracouro",
    "higicouro",
    "sintra-fast",
    "vertex",
    "extractus",
    "extractus-sensitive",
    "sanitizante-finalizador",
    "bactran",
    "v-leather",
    "sintra-pro",
    "impermax",
    "kit-couro-vonixx",
  ].map((s) => ({ marca: "vonixx", url: `https://www.vonixx.com.br/produto/${s}/`, nome: s })),
  ...[
    "limpa-estofados",
    "limpador-multiacao-apc-500ml",
    "sanitizante-frutal",
    "sanitizante-fresh",
    "sanitizante-carro-novo",
    "sanitizante-bom-ar",
    "desengraxante-biodegradavel",
  ].map((s) => ({ marca: "vintex", url: `https://vintex.com.br/produto/${s}/`, nome: s })),
  ...[
    ["prot-carp-20-limpa-tapetes-e-carpetes", "CARP 20"],
    ["bac-peroxy-limpador-de-uso-geral-de-alta-performance", "BAC PEROXY"],
    ["water-guard", "WATER GUARD"],
    ["prot-water-protetor-de-tecido", "PROT WATER"],
    ["leather-cleaner-limpa-couro", "Leather Cleaner"],
    ["prot-couro-revitalizador-de-couro", "LEATHER"],
    ["apc-limpador-de-alta-performance", "APC"],
    ["multi-ecco-apc-limpador-apc-multiuso", "MULTI ECCO APC"],
    ["detergente-multiuso-prot-mult", "PROT MULT"],
    ["bactericida-prot-ecco-ds-air-neutro", "BACTERICIDA ECCO DS AIR"],
  ].map(([s, n]) => ({ marca: "protelim", url: `https://protelim.com.br/produto/${s}/`, nome: n })),
  ...[
    "ecotextil",
    "limpacouro",
    "couroqd",
    "insignialeather",
    "pluri",
    "plurisensitive",
    "plurifast",
    "multiinteriores",
    "quickinteriores",
    "oxyfast",
    "oxy4d",
    "tapetex",
    "zbac",
    "float",
    "proimper",
    "proimperpremium",
    "prepara",
    "soul",
  ].map((s) => ({ marca: "easytech", url: `https://www.easytechshield.com.br/loja/${s}/`, nome: s })),
  ...[
    "master-dry",
    "impernano",
    "aquo-alcalino",
    "aquo-neutro",
    "nura-pronto-uso",
    "new-ar",
    "bio-w-limpeza-a-seco-concentrado",
  ].map((s) => ({ marca: "alcance", url: `https://alcanceprofissional.com.br/produtos/${s}`, nome: s })),
  ...[
    "canelinha",
    "limpa-couro",
    "limpador-germicida",
    "lava-boina-e-microfibra",
  ].map((s) => ({ marca: "finisher", url: `https://finisher.com.br/produto/${s}/`, nome: s })),
  { marca: "spartan", url: "https://www.spartanbrasil.com.br/produtos/detalhes/787/peroxy-flot.html", nome: "Peroxy Flot" },
  { marca: "spartan", url: "https://www.spartanbrasil.com.br/produtos/detalhes/12/contempo-v.html", nome: "Contempo V" },
  { marca: "spartan", url: "https://www.spartanbrasil.com.br/produtos/detalhes/16/xtraction-ii.html", nome: "Xtraction II" },
  { marca: "spartan", url: "https://www.spartanbrasil.com.br/produtos/detalhes/sse-carpet-prespray-spotter.html", nome: "SSE Carpet Prespray" },
];

const rows = [];
for (const t of TARGETS) {
  await sleep(280);
  const { ok, status, text, url } = await fetchText(t.url);
  if (!ok) {
    console.log(`FAIL ${status} ${t.url}`);
    continue;
  }
  const row = parsePage(text, url, t.marca, t.nome);
  if (!row.resumo && row.diluicao === "" && row.ph === "") {
    console.log(`EMPTY ${t.url}`);
    continue;
  }
  rows.push(row);
  console.log(`OK ${row.marca} ${row.nome}`);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outJson = join(root, "src", "data", "fichas-fabricantes.raw.json");
mkdirSync(join(root, "src", "data"), { recursive: true });
writeFileSync(outJson, JSON.stringify(rows, null, 2), "utf8");
console.log(`\n${rows.length} fichas em ${outJson}`);
