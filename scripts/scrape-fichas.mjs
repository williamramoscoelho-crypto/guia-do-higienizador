/**
 * Scraper de fichas técnicas em sites oficiais de fabricantes.
 * Só lê páginas públicas. Não inventa diluição. Não copia catálogos de outros projetos.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const UA =
  "GuiaDoHigienizador/1.0 (+https://github.com/williamramoscoelho-crypto/guia-do-higienizador; consulta editorial de fichas públicas)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, { accept = "text/html,*/*" } = {}) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: accept,
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
    redirect: "follow",
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, url: res.url, text, headers: res.headers };
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLinks(html, base) {
  const out = new Set();
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const abs = new URL(m[1], base);
      abs.hash = "";
      out.add(abs.href);
    } catch {
      /* ignore */
    }
  }
  return [...out];
}

function slugFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  return parts.at(-1) || "produto";
}

const ESTOFADO_RE =
  /\b(estofad|tecido|carpet|tapete|couro|higieniz|sanitiz|extract|flot|impermeabil|sof[aá]|colch[aã]o|suede|chenille|interior|apc|limpador|multiuso|germicid|bactericid|perox|proteção de tecido|protetor de tecido|water guard|bac |sintra|vertex|bactran|ecotextil|master dry|impernano)\b/i;

const EXCLUDE_RE =
  /\b(boina|politriz|lixa|ceramic coating|vitrifica|cera líquida|cera liquida|pneu pretinho|snow foam hobby|suporte ventilado|suporte flexivel)\b/i;

function isEstofadoRelated(nome, texto) {
  const blob = `${nome} ${texto}`;
  if (EXCLUDE_RE.test(nome) && !ESTOFADO_RE.test(blob)) return false;
  return ESTOFADO_RE.test(blob);
}

function pickField(text, labels) {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:\\-–]?\\s*([^\\n]{8,400})`, "i");
    const m = text.match(re);
    if (m) return m[1].replace(/\s+/g, " ").trim();
  }
  return "";
}

function extractPdfLinks(html, base) {
  return extractLinks(html, base).filter((h) => /\.pdf(\?|$)/i.test(h));
}

function parseGeneric(html, url, marca) {
  const text = stripTags(html);
  const title =
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.split("|")[0]?.split("-")[0]?.trim() ||
    slugFromUrl(url);
  const pdfs = extractPdfLinks(html, url);
  const fichaPdf = pdfs.find((p) => /ficha|boletim|bt_|tecnica|técnica/i.test(p)) || "";
  const fdsPdf = pdfs.find((p) => /fds|fispq|sds|msds/i.test(p)) || "";
  return {
    marca,
    slug: `${marca}-${slugFromUrl(url)}`,
    nome: stripTags(title),
    url,
    resumo: text.slice(0, 420),
    diluicao: pickField(text, ["DILUIÇÃO", "DILUICOES", "DILUIÇÕES", "Diluição"]),
    ph: pickField(text, ["pH DO PRODUTO", "pH", "PARÂMETROS"]),
    usoRecomendado: pickField(text, ["USO RECOMENDADO", "INDICAÇÃO", "Indicação", "SUPERFÍCIES"]),
    naoRecomendado: pickField(text, ["NÃO RECOMENDADO", "INFORMAÇÕES ADICIONAIS", "ADVERTÊNCIAS"]),
    composicao: pickField(text, ["COMPOSIÇÃO", "Composição"]),
    modoDeUsar: pickField(text, ["MODO DE USAR", "Instruções de uso", "APRENDA A FORMA CORRETA"]),
    embalagens: pickField(text, ["TAMANHOS DISPONÍVEIS", "DISPONÍVEL", "EMBALAGEM", "LITRAGEM"]),
    fichaPdf,
    fdsPdf,
    pdfs: pdfs.slice(0, 8),
    coletadoEm: new Date().toISOString().slice(0, 10),
  };
}

async function wpJsonProducts(base, types) {
  const found = [];
  for (const type of types) {
    for (let page = 1; page <= 20; page++) {
      const url = `${base}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_fields=id,slug,link,title,excerpt,content,acf`;
      const { ok, status, text } = await fetchText(url, { accept: "application/json" });
      if (!ok) {
        if (page === 1) console.log(`  WP ${type}: ${status}`);
        break;
      }
      let items;
      try {
        items = JSON.parse(text);
      } catch {
        break;
      }
      if (!Array.isArray(items) || items.length === 0) break;
      for (const it of items) {
        found.push({
          slug: it.slug,
          url: it.link,
          nome: stripTags(it.title?.rendered || it.slug),
          excerpt: stripTags(it.excerpt?.rendered || ""),
          content: stripTags(it.content?.rendered || ""),
        });
      }
      console.log(`  WP ${type} page ${page}: ${items.length}`);
      if (items.length < 100) break;
      await sleep(250);
    }
  }
  return found;
}

async function wcStoreProducts(base) {
  const found = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
    const { ok, status, text } = await fetchText(url, { accept: "application/json" });
    if (!ok) {
      if (page === 1) console.log(`  WC store: ${status}`);
      break;
    }
    let items;
    try {
      items = JSON.parse(text);
    } catch {
      break;
    }
    if (!Array.isArray(items) || items.length === 0) break;
    for (const it of items) {
      found.push({
        slug: it.slug,
        url: it.permalink,
        nome: it.name,
        excerpt: stripTags(it.short_description || it.description || ""),
        content: stripTags(it.description || ""),
      });
    }
    console.log(`  WC store page ${page}: ${items.length}`);
    if (items.length < 100) break;
    await sleep(250);
  }
  return found;
}

async function scrapeListing(listUrl, productPathRe) {
  const urls = new Set();
  const queue = [listUrl];
  const seenPages = new Set();
  while (queue.length) {
    const page = queue.shift();
    if (seenPages.has(page) || seenPages.size > 40) continue;
    seenPages.add(page);
    const { ok, text, url } = await fetchText(page);
    if (!ok) continue;
    const links = extractLinks(text, url);
    for (const href of links) {
      if (productPathRe.test(href)) urls.add(href.replace(/\/+$/, "/") );
      if (
        href.startsWith(new URL(listUrl).origin) &&
        /\/page\/\d+\/?/.test(href) &&
        href.includes(new URL(listUrl).pathname.split("/").filter(Boolean)[0] || "")
      ) {
        queue.push(href);
      }
    }
    await sleep(200);
  }
  return [...urls];
}

async function enrichFromHtml(item, marca) {
  await sleep(350);
  const { ok, status, text, url } = await fetchText(item.url);
  if (!ok) {
    return {
      ...parseGeneric("", item.url, marca),
      nome: item.nome,
      resumo: item.excerpt || item.content?.slice(0, 420) || "",
      erro: `HTTP ${status}`,
    };
  }
  const parsed = parseGeneric(text, url, marca);
  parsed.nome = parsed.nome || item.nome;
  if (!parsed.resumo || parsed.resumo.length < 40) {
    parsed.resumo = (item.excerpt || item.content || parsed.resumo).slice(0, 420);
  }
  return parsed;
}

async function runVonixx() {
  console.log("Vonixx");
  let items = await wpJsonProducts("https://www.vonixx.com.br", ["produto", "product", "produtos"]);
  if (items.length === 0) {
    const urls = [];
    for (let p = 1; p <= 33; p++) {
      const { ok, text, url } = await fetchText(`https://www.vonixx.com.br/produtos/page/${p}/`);
      if (!ok) break;
      for (const href of extractLinks(text, url)) {
        if (/\/produto\/[^/]+\/?$/.test(href)) urls.push(href);
      }
      console.log(`  listing page ${p}`);
      await sleep(200);
    }
    items = [...new Set(urls)].map((u) => ({ slug: slugFromUrl(u), url: u, nome: slugFromUrl(u), excerpt: "", content: "" }));
  }
  const out = [];
  for (const it of items) {
    const blob = `${it.nome} ${it.excerpt} ${it.content}`;
    const looksRelated = isEstofadoRelated(it.nome, blob);
    if (!looksRelated && items.length > 40) continue;
    const row = await enrichFromHtml(it, "vonixx");
    if (isEstofadoRelated(row.nome, `${row.resumo} ${row.usoRecomendado} ${row.diluicao}`)) out.push(row);
    else if (looksRelated) out.push(row);
    process.stdout.write(`  ${row.nome}\n`);
  }
  return out;
}

async function runVintex() {
  console.log("Vintex");
  let items = await wpJsonProducts("https://vintex.com.br", ["produto", "product"]);
  if (items.length === 0) {
    items = await wcStoreProducts("https://vintex.com.br");
  }
  if (items.length === 0) {
    const { ok, text, url } = await fetchText("https://vintex.com.br/produtos/");
    const urls = ok
      ? extractLinks(text, url).filter((h) => /vintex\.com\.br\/(produto|product)\//i.test(h))
      : [];
    items = [...new Set(urls)].map((u) => ({ slug: slugFromUrl(u), url: u, nome: slugFromUrl(u), excerpt: "", content: "" }));
  }
  const out = [];
  for (const it of items) {
    const row = await enrichFromHtml(it, "vintex");
    if (isEstofadoRelated(row.nome, `${row.resumo} ${row.usoRecomendado}`)) out.push(row);
    process.stdout.write(`  ${row.nome}\n`);
  }
  return out;
}

async function runProtelim() {
  console.log("Protelim");
  let items = await wcStoreProducts("https://protelim.com.br");
  if (items.length === 0) items = await wpJsonProducts("https://protelim.com.br", ["product", "produto"]);
  if (items.length === 0) {
    const urls = new Set();
    for (let p = 1; p <= 12; p++) {
      const { ok, text, url } = await fetchText(`https://protelim.com.br/produtos/page/${p}/`);
      if (!ok) break;
      for (const href of extractLinks(text, url)) {
        if (/protelim\.com\.br\/produto\//i.test(href)) urls.add(href);
      }
      await sleep(200);
    }
    items = [...urls].map((u) => ({ slug: slugFromUrl(u), url: u, nome: slugFromUrl(u), excerpt: "", content: "" }));
  }
  const out = [];
  for (const it of items) {
    const row = await enrichFromHtml(it, "protelim");
    if (isEstofadoRelated(row.nome, `${row.resumo} ${row.usoRecomendado} ${it.content}`)) out.push(row);
    process.stdout.write(`  ${row.nome}\n`);
  }
  return out;
}

async function runEasytech() {
  console.log("Easytech");
  let items = await wcStoreProducts("https://www.easytechshield.com.br");
  if (items.length === 0) items = await wpJsonProducts("https://www.easytechshield.com.br", ["product"]);
  if (items.length === 0) {
    const urls = new Set();
    for (let p = 1; p <= 10; p++) {
      const { ok, text, url } = await fetchText(`https://www.easytechshield.com.br/loja/page/${p}/`);
      if (!ok) break;
      for (const href of extractLinks(text, url)) {
        if (/easytechshield\.com\.br\/produto\//i.test(href) || /\/product\//i.test(href)) urls.add(href);
      }
      await sleep(200);
    }
    items = [...urls].map((u) => ({ slug: slugFromUrl(u), url: u, nome: slugFromUrl(u), excerpt: "", content: "" }));
  }
  const out = [];
  for (const it of items) {
    const row = await enrichFromHtml(it, "easytech");
    if (isEstofadoRelated(row.nome, `${row.resumo} ${row.usoRecomendado} ${it.content}`)) out.push(row);
    process.stdout.write(`  ${row.nome}\n`);
  }
  return out;
}

async function runAlcance() {
  console.log("Alcance");
  const { ok, text, url } = await fetchText("https://alcanceprofissional.com.br/produtos");
  const hrefs = ok
    ? extractLinks(text, url).filter((h) => /alcanceprofissional\.com\.br\/produtos\/[a-z0-9-]+\/?$/i.test(h))
    : [];
  const items = [...new Set(hrefs)].map((u) => ({
    slug: slugFromUrl(u),
    url: u,
    nome: slugFromUrl(u),
    excerpt: "",
    content: "",
  }));
  const out = [];
  for (const it of items) {
    const row = await enrichFromHtml(it, "alcance");
    if (isEstofadoRelated(row.nome, `${row.resumo} ${row.usoRecomendado}`)) out.push(row);
    process.stdout.write(`  ${row.nome}\n`);
  }
  return out;
}

async function runFinisher() {
  console.log("Finisher");
  const seeds = [
    "https://finisher.com.br/produto/canelinha/",
    "https://finisher.com.br/produto/limpa-couro/",
    "https://finisher.com.br/produto/limpador-germicida/",
    "https://finisher.com.br/produto/lava-boina-e-microfibra/",
    "https://finisher.com.br/",
  ];
  const urls = new Set();
  for (const seed of seeds) {
    const { ok, text, url } = await fetchText(seed);
    if (!ok) continue;
    for (const href of extractLinks(text, url)) {
      if (/finisher\.com\.br\/produto\/[^/]+\/?$/i.test(href)) urls.add(href);
    }
    await sleep(200);
  }
  const out = [];
  for (const u of urls) {
    const row = await enrichFromHtml({ url: u, nome: slugFromUrl(u), excerpt: "", content: "" }, "finisher");
    if (isEstofadoRelated(row.nome, `${row.resumo} ${row.usoRecomendado} ${row.diluicao}`)) out.push(row);
    process.stdout.write(`  ${row.nome}\n`);
  }
  return out;
}

async function runSpartan() {
  console.log("Spartan");
  const listingUrls = [
    "https://www.spartanbrasil.com.br/produtos.html",
    "https://spartanbrasil.com.br/produtos.html",
    "https://www.spartanbrasil.com.br/produtos/",
  ];
  const urls = new Set();
  for (const list of listingUrls) {
    const { ok, text, url } = await fetchText(list);
    if (!ok) continue;
    for (const href of extractLinks(text, url)) {
      if (/spartanbrasil\.com\.br\/produtos\//i.test(href) && /detalhes|html/i.test(href)) urls.add(href);
    }
  }
  const known = [
    "https://www.spartanbrasil.com.br/produtos/detalhes/16/xtraction-ii.html",
    "https://www.spartanbrasil.com.br/produtos/detalhes/15/contempo-v.html",
    "https://www.spartanbrasil.com.br/produtos/detalhes/peroxy-flot.html",
  ];
  for (const k of known) urls.add(k);
  const out = [];
  for (const u of urls) {
    const row = await enrichFromHtml({ url: u, nome: slugFromUrl(u), excerpt: "", content: "" }, "spartan");
    if (isEstofadoRelated(row.nome, `${row.resumo} ${row.usoRecomendado}`)) out.push(row);
    process.stdout.write(`  ${row.nome}\n`);
  }
  return out;
}

const all = [];
for (const fn of [runVonixx, runVintex, runProtelim, runEasytech, runAlcance, runFinisher, runSpartan]) {
  try {
    const rows = await fn();
    all.push(...rows);
  } catch (err) {
    console.error(fn.name, err);
  }
}

const uniq = [];
const seen = new Set();
for (const row of all) {
  const key = row.url.replace(/\/+$/, "");
  if (seen.has(key)) continue;
  seen.add(key);
  uniq.push(row);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "fichas-fabricantes.raw.json"), JSON.stringify(uniq, null, 2), "utf8");
console.log(`\nTotal: ${uniq.length} produtos em src/data/fichas-fabricantes.raw.json`);
