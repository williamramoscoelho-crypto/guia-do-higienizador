/**
 * Coleta Protelim (estofados / carpetes / interior / SHP) — equivalente Node do scrape Python.
 * Só páginas públicas. Não inventa química.
 *
 * Funções: getProductData(), downloadFispq(), saveData()
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, "out");
const FISPQ_DIR = join(ROOT, "fispqs");
const UA =
  "GuiaDoHigienizador/1.0 (+https://github.com/williamramoscoelho-crypto/guia-do-higienizador; consulta editorial de fichas públicas)";

/** Lista fácil de estender. slug deve bater com src/data/fichas-fabricantes.ts quando o SKU já existe. */
const PRODUTOS = [
  {
    slug: "protelim-prot-carp-20-limpa-tapetes-e-carpetes",
    nome: "CARP 20",
    url: "https://protelim.com.br/produto/prot-carp-20-limpa-tapetes-e-carpetes/",
    linha: "SHP — limpa tapetes e carpetes",
    arquivo: "Prot_Carp_20",
  },
  {
    slug: "protelim-multi-ecco-apc-limpador-apc-multiuso",
    nome: "MULTI ECCO APC",
    url: "https://protelim.com.br/produto/multi-ecco-apc-limpador-apc-multiuso/",
    linha: "SHP — APC concentrado (estofados, carpetes, interiores)",
    arquivo: "Multi_Ecco_APC",
  },
  {
    slug: "protelim-bac-peroxy-limpador-de-uso-geral-de-alta-performance",
    nome: "BAC PEROXY",
    url: "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
    linha: "SHP — limpador de uso geral / tecidos",
    arquivo: "Bac_Peroxy",
  },
  {
    slug: "protelim-apc-limpador-de-alta-performance",
    nome: "APC",
    url: "https://protelim.com.br/produto/apc-limpador-de-alta-performance/",
    linha: "SHP — APC interiores pronto uso",
    arquivo: "APC_Pronto_Uso",
  },
  {
    slug: "protelim-prot-water-protetor-de-tecido",
    nome: "PROT WATER",
    url: "https://protelim.com.br/produto/prot-water-protetor-de-tecido/",
    linha: "SHP — protetor de tecido (solvente)",
    arquivo: "Prot_Water",
  },
  {
    slug: "protelim-water-guard",
    nome: "WATER GUARD",
    url: "https://protelim.com.br/produto/water-guard/",
    linha: "SHP — protetor de tecido (base água)",
    arquivo: "Water_Guard",
  },
  {
    slug: "protelim-lava-a-seco-automotivo-prot-dry",
    nome: "PROT DRY",
    url: "https://protelim.com.br/produto/lava-a-seco-automotivo-prot-dry/",
    linha: "Lavagem a seco (SKU pedido)",
    arquivo: "Prot_Dry",
  },
  {
    slug: "protelim-prot-dry-pronto-uso-lavagem-a-seco-automotiva",
    nome: "PROT DRY PRONTO USO",
    url: "https://protelim.com.br/produto/prot-dry-pronto-uso-lavagem-a-seco-automotiva/",
    linha: "Lavagem a seco pronto uso",
    arquivo: "Prot_Dry_Pronto_Uso",
  },
  {
    slug: "protelim-leather-cleaner-limpa-couro",
    nome: "Leather Cleaner",
    url: "https://protelim.com.br/produto/leather-cleaner-limpa-couro/",
    linha: "Couro / interior",
    arquivo: "Leather_Cleaner",
  },
  {
    slug: "protelim-prot-couro-revitalizador-de-couro",
    nome: "LEATHER",
    url: "https://protelim.com.br/produto/prot-couro-revitalizador-de-couro/",
    linha: "Couro / interior",
    arquivo: "Leather",
  },
  {
    slug: "protelim-detergente-multiuso-prot-mult",
    nome: "PROT MULT",
    url: "https://protelim.com.br/produto/detergente-multiuso-prot-mult/",
    linha: "Multiuso (slug já existente no Guia)",
    arquivo: "Prot_Mult",
  },
  {
    slug: "protelim-bactericida-prot-ecco-ds-air-neutro",
    nome: "BACTERICIDA ECCO DS AIR NEUTRO",
    url: "https://protelim.com.br/produto/bactericida-prot-ecco-ds-air-neutro/",
    linha: "Interior — bactericida",
    arquivo: "Ecco_DS_Air_Neutro",
  },
];

const DISCOVER_CATEGORIES = [
  {
    url: "https://protelim.com.br/categoria-produto/segmento-automotivo/categorias/shp-sistema-higienizacao-protelim/",
    linha: "SHP — Sistema Higienização Protelim",
  },
  {
    url: "https://protelim.com.br/categoria-produto/segmento-automotivo/acabamento/tecidos/",
    linha: "Acabamento — tecidos",
  },
  {
    url: "https://protelim.com.br/categoria-produto/higiene-geral-automotivo/tecidos-higiene-geral-automotivo/",
    linha: "Higiene geral — tecidos",
  },
  {
    url: "https://protelim.com.br/categoria-produto/segmento-automotivo/acabamento/couro/",
    linha: "Acabamento — couro",
  },
  {
    url: "https://protelim.com.br/categoria-produto/higiene-geral-automotivo/couro-higiene-geral-automotivo/",
    linha: "Higiene geral — couro",
  },
  {
    url: "https://protelim.com.br/categoria-produto/segmento-automotivo/categorias/lavagem-a-seco/",
    linha: "Lavagem a seco",
  },
  {
    url: "https://protelim.com.br/categoria-produto/segmento-automotivo/acabamento/bactericidas/",
    linha: "Interior — bactericidas",
  },
  {
    url: "https://protelim.com.br/categoria-produto/higiene-geral-automotivo/desinfetante/",
    linha: "Higiene geral — desinfetante",
  },
];

const JUNK =
  /Quero Comprar|Seja um Revendedor|Produtos relacionados|Você também pode gostar|Voltar para os produtos|Inicio Sobre|FALE COM|SAC\/RELACIONAMENTO|LOJA ONLINE|COMPARE/i;

const CAMPOS = [
  "slug",
  "nome",
  "url",
  "linha",
  "resumo",
  "embalagens",
  "diluicao",
  "ph",
  "usoRecomendado",
  "naoRecomendado",
  "informacoesAdicionais",
  "modoDeUsar",
  "fichaTecnica",
  "anvisa",
  "composicao",
  "fdsPdf",
  "sdsPdf",
  "fichaPdf",
  "coletadoEm",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const polite = () => sleep(1500 + Math.random() * 1500);

function log(...a) {
  console.log(new Date().toISOString().slice(11, 19), ...a);
}

async function get(url, retries = 4) {
  let last;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html,application/pdf,*/*", "Accept-Language": "pt-BR,pt;q=0.9" },
        redirect: "follow",
      });
      if ([429, 500, 502, 503, 504].includes(res.status)) {
        log("WARN HTTP", res.status, url, "retry");
        await sleep(2000 * (i + 1));
        last = res;
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      last = err;
      log("WARN Falha", url, err.message);
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error(`Não obteve ${url}: ${last}`);
}

function decode(s) {
  return s
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#215;/g, "×")
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

function visivelKeepNl(html) {
  const raw = (html || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|h[1-6]|div|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "\n");
  return raw
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tidy(s, max = 0) {
  let t = decode(String(s || "").replace(/\n+/g, " "));
  t = t.replace(/\s*(Quero Comprar|Produtos relacionados|Você também pode gostar|Voltar para os produtos).*$/i, "").trim();
  if (JUNK.test(t) && t.length < 80) return "";
  if (max && t.length > max) {
    const cut = t.slice(0, max);
    const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    t = (last > 80 ? cut.slice(0, last + 1) : `${cut.trim()}…`).trim();
  }
  return t;
}

function h1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? decode(m[1].replace(/<[^>]+>/g, " ")) : "";
}

function afterH1(html) {
  const i = html.search(/<h1[\s\S]*?<\/h1>/i);
  return i >= 0 ? html.slice(i) : html;
}

function productSlice(html) {
  const start = html.search(/data-elementor-type=["']product["']/i);
  let block = start >= 0 ? html.slice(start) : html;
  const cut = block.search(/Produtos relacionados|Você também pode gostar/i);
  if (cut > 200) block = block.slice(0, cut);
  return afterH1(block);
}

function widgetContent(html, re) {
  const m = html.match(re);
  return m ? m[1] : "";
}

function htmlAfterH3(html, title) {
  const re = new RegExp(`<h3[^>]*>\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
  const i = html.search(re);
  if (i < 0) return "";
  const afterOpen = html.slice(i + 4);
  const stopRel = afterOpen.search(/<h3[^>]*>/i);
  const window = stopRel > 0 ? html.slice(i, i + 4 + stopRel) : html.slice(i, i + 8000);
  const m = window.match(/widget-text-editor[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>/i);
  return m ? m[1] : "";
}

function pdfs(html, base) {
  const out = [];
  const seen = new Set();
  const re = /<a[^>]+href=["']([^"']+\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const url = new URL(m[1], base).href;
      if (seen.has(url)) continue;
      seen.add(url);
      const label = decode(m[2].replace(/<[^>]+>/g, " ")) || url.split("/").pop();
      out.push({ label, url });
    } catch {
      /* ignore */
    }
  }
  return out;
}

function fdsScore(url) {
  const u = String(url || "").toLowerCase();
  const years = [...u.matchAll(/20[1-3]\d/g)].map((x) => Number(x[0]));
  const year = years.length ? Math.max(...years) : 0;
  const rev = Number((u.match(/rev[_-]?(\d+)/) || [])[1] || 0);
  const ver = Number((u.match(/(?:^|[/_-])v(\d+)/) || [])[1] || 0);
  return year * 1e6 + ver * 1e3 + rev;
}

function pickNewest(docs, test) {
  const hits = docs.filter((d) => test(`${d.label} ${d.url}`.toLowerCase()));
  if (!hits.length) return "";
  hits.sort((a, b) => fdsScore(b.url) - fdsScore(a.url));
  return hits[0].url;
}

function classificar(docs) {
  const fdsPdf = pickNewest(docs, (b) => /fds|fispq/.test(b) && !/manual/.test(b));
  const sdsPdf = pickNewest(docs, (b) => /\bsds\b/.test(b) && !/fds/.test(b));
  const fichaPdf = pickNewest(docs, (b) => /ficha/.test(b) && /t[eé]cn/.test(b));
  const documentos = docs.filter((d) => ![fdsPdf, sdsPdf, fichaPdf].includes(d.url));
  return { fdsPdf, sdsPdf, fichaPdf, documentos };
}

function embalagensDe(text) {
  const compact = String(text || "").replace(/\s+/g, " ");
  const m = compact.match(/EMBALAGE(?:NS|M)\W{0,3}:\s*([\d.,\sLmlleE]+(?:\s+e\s+[\d.,\sLmlleE]+)*)/i);
  if (!m) return "";
  return tidy(m[1], 80);
}

function phDe(text) {
  const compact = text.replace(/\s+/g, " ");
  if (/neutralizador de pH/i.test(compact) && !/\bpH\s*(neutro|equilibrado|ácido|alcalino|\d)/i.test(compact.replace(/neutralizador de pH/gi, " "))) {
    return "";
  }
  const numeric = compact.match(/(?<!neutralizador de )(?:\b(?:pH|PH)\s*[:\-–]?\s*)(\d+(?:[.,]\d+)?(?:\s*[–\-]\s*\d+(?:[.,]\d+)?)?)/);
  if (numeric) {
    const around = compact.slice(Math.max(0, numeric.index - 24), numeric.index + numeric[0].length + 12);
    if (/neutralizador/i.test(around)) return "";
    if (/\d+\s*[–-]\s*(Limpa|Odorizante|Alvejante|Desinfect|Tira |Ação |Bloqueador)/i.test(around)) return "";
    return tidy(numeric[1], 40);
  }
  const qual = compact.match(/\b(?:pH|PH)\s+(neutro|equilibrado|ácido|alcalino|básico)\b/i);
  return qual ? tidy(qual[1].toLowerCase(), 40) : "";
}

function diluicaoDe(modo, desc) {
  const blob = `${modo}\n${desc}`;
  const hits = [];
  const add = (s) => {
    const t = tidy(s, 280);
    if (!t || /^n[aã]o /i.test(t) || hits.includes(t)) return;
    hits.push(t);
  };
  const pats = [
    /Limpeza [^\n.]{0,50}1\s*:\s*\d+[^\n.]{0,140}/gi,
    /Limpeza [^\n.]{0,40}1\s+litro de produto para[^\n.]{0,90}/gi,
    /1\s+litro de produto para[^\n.]{0,80}/gi,
    /dilua[^\n.]{0,40}1\s+para\s+\d+\s+partes[^\n.]{0,40}/gi,
    /1\s+para\s+\d+\s+partes de [áa]gua/gi,
    /Usar puro ou na dilui[cç][aã]o[^\n.]{0,90}/gi,
  ];
  for (const pat of pats) {
    for (const m of blob.matchAll(pat)) add(m[0]);
  }
  if (/pronto(?:\s+para)?\s+uso|pronto uso/i.test(blob)) add("Produto pronto para uso.");
  return tidy(hits.join(" "), 520);
}

function anvisaDe(text) {
  const m =
    text.match(/ANVISA[:\s]*n[ºo°.]?\s*[\d./-]+/i) ||
    text.match(/Registro ANVISA[^\n.]{0,90}/i) ||
    text.match(/n[ºo°.]?\s*ANVISA[^\n.]{0,60}/i);
  return m ? tidy(m[0], 120) : "";
}

function composicaoDe(text) {
  const m = text.match(/Composi[cç][aã]o\s*[:\-–]\s*([^\n]{8,400})/i) || text.match(/Ingredientes\s*[:\-–]\s*([^\n]{8,400})/i);
  return m ? tidy(m[1], 420) : "";
}

function modoDeUsarDe(html) {
  const inner = htmlAfterH3(html, "Modo de Usar");
  if (!inner) return "";
  return tidy(visivelKeepNl(inner).replace(/\n+/g, " "), 1200);
}

function indicacaoDe(html, descText) {
  const inner = htmlAfterH3(html, "Indicação") || htmlAfterH3(html, "Indicacao");
  const fromTab = inner ? tidy(visivelKeepNl(inner).replace(/\n+/g, " "), 520) : "";
  if (fromTab) return fromTab;
  const m = String(descText || "").match(/((?:[Éé] indicado|Indicado|Pode ser usado|Eficiente na)[^.]*\.)/i);
  return m ? tidy(m[1], 420) : "";
}

function importanteDe(html, modoText) {
  const blob = `${visivelKeepNl(html)}\n${modoText}`;
  const m = blob.match(/IMPORTANTE:?\s*([\s\S]{12,900}?)(?=\nIndica|\nBaixar FDS|\nVoltar para|\nProdutos relacionados|$)/i);
  let t = m ? tidy(m[1], 520) : "";
  if (!t) {
    const n = blob.match(/(?:n[aã]o (?:pode|aplicar|diluir|utilizar)[^\n.]{8,240}\.?)/gi);
    if (n) t = tidy(n.join(" "), 520);
  }
  return t;
}

function resumoDe(descHtml) {
  let text = visivelKeepNl(descHtml).replace(/\s+/g, " ").trim();
  text = text.replace(/\s*EMBALAGE(?:NS|M)\W{0,3}:.*$/i, "").trim();
  text = text.replace(/\s*BENEF[IÍ]CIOS\W{0,3}:.*$/i, "").trim();
  text = text.replace(/\s*É um produto 9 em 1:.*$/i, "").trim();
  return tidy(text, 900);
}

function fichaTecnicaDe(descText, modo, uso, nao, anvisa, ph, diluicao, embalagens) {
  const partes = [
    tidy(descText.replace(/\n+/g, " "), 1600),
    embalagens ? `EMBALAGENS: ${embalagens}` : "",
    ph ? `pH: ${ph}` : "",
    diluicao ? `Diluição: ${diluicao}` : "",
    modo ? `Modo de usar: ${modo}` : "",
    uso ? `Indicação: ${uso}` : "",
    nao ? `Notas: ${nao}` : "",
    anvisa ? `ANVISA: ${anvisa}` : "",
  ].filter(Boolean);
  return tidy(partes.join(" "), 2400);
}

async function maybePlaywright(url) {
  try {
    const mod = await import("playwright");
    const browser = await mod.chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: UA, locale: "pt-BR" });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);
    const html = await page.content();
    await browser.close();
    log("Playwright usou fallback", url);
    return html;
  } catch (err) {
    log("WARN HTML vazio e Playwright indisponível:", err.message);
    return "";
  }
}

function parse(meta, html) {
  const slice = productSlice(html);
  const descHtml = widgetContent(slice, /woocommerce-product-content[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>/i);
  const descText = visivelKeepNl(descHtml);
  const nome = h1(html) || meta.nome;
  const modo = modoDeUsarDe(slice);
  const uso = indicacaoDe(slice, descText);
  const nao = importanteDe(slice, modo);
  const ph = phDe(`${descText}\n${modo}\n${uso}`);
  const diluicao = diluicaoDe(modo, descText);
  const embalagens = embalagensDe(descText);
  const anvisa = anvisaDe(`${descText}\n${modo}\n${uso}\n${nao}`);
  const composicao = composicaoDe(descText);
  const pdfMap = classificar(pdfs(slice, meta.url));
  const resumo = resumoDe(descHtml);
  return {
    slug: meta.slug,
    marca: "protelim",
    nome,
    url: meta.url,
    linha: meta.linha,
    resumo,
    diluicao,
    ph,
    usoRecomendado: uso,
    naoRecomendado: nao,
    informacoesAdicionais: nao,
    composicao,
    modoDeUsar: modo,
    embalagens,
    anvisa,
    fichaTecnica: fichaTecnicaDe(descText, modo, uso, nao, anvisa, ph, diluicao, embalagens),
    faq: [],
    ...pdfMap,
    coletadoEm: new Date().toISOString().slice(0, 10),
    fonteHtml: meta.url,
    arquivo: meta.arquivo || "",
  };
}

async function getProductData(meta) {
  log("GET", meta.url);
  let html = await (await get(meta.url)).text();
  const slice = productSlice(html);
  const desc = widgetContent(slice, /woocommerce-product-content[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>/i);
  if (!h1(html) || desc.replace(/<[^>]+>/g, "").trim().length < 40) {
    log("WARN HTML de produto vazio/curto — tentando Playwright", meta.slug);
    const alt = await maybePlaywright(meta.url);
    if (alt) html = alt;
  }
  return parse(meta, html);
}

function arquivoPdf(meta, label, url) {
  const base = (meta.arquivo || meta.nome || "Protelim").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const blob = `${label} ${url}`.toLowerCase();
  let kind = "PDF";
  if (/fds|fispq/.test(blob)) kind = "FDS";
  else if (/\bsds\b/.test(blob)) kind = "SDS";
  else if (/manual/.test(blob)) kind = "Manual";
  else if (/ficha/.test(blob) && /t[eé]cn/.test(blob)) kind = "Ficha";
  else if (/anvisa|certificado/.test(blob)) kind = "Certificado";
  if (kind === "PDF") {
    const stem = String(url.split("/").pop() || "doc")
      .replace(/\.pdf$/i, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .slice(0, 48);
    return `${base}_${stem}.pdf`;
  }
  return `${base}_${kind}.pdf`;
}

async function downloadFispq(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 1000) {
    log("PDF já existe", dest.split(/[/\\]/).pop());
    return { downloaded: false, skipped: true };
  }
  try {
    const head = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA, Accept: "application/pdf,*/*" },
      redirect: "follow",
    });
    const len = Number(head.headers.get("content-length") || 0);
    if (len > 15_000_000) {
      log("WARN PDF grande demais, URL mantida sem salvar localmente", dest.split(/[/\\]/).pop(), len, "bytes");
      return { downloaded: false, skipped: false, tooLarge: true, bytes: len };
    }
  } catch {
    /* segue para GET */
  }
  const res = await get(url);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 15_000_000) {
    log("WARN PDF grande demais, URL mantida sem salvar localmente", dest.split(/[/\\]/).pop(), buf.length, "bytes");
    return { downloaded: false, skipped: false, tooLarge: true, bytes: buf.length };
  }
  writeFileSync(dest, buf);
  log("Baixado", dest.split(/[/\\]/).pop(), buf.length, "bytes");
  return { downloaded: true, skipped: false, bytes: buf.length };
}

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function zipStore(files) {
  const chunks = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.from(file.data);
    const compressed = deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(0, 10);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, compressed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(0, 12);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += local.length + name.length + compressed.length;
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...chunks, ...centrals, end]);
}

function xmlEsc(s) {
  return String(s ?? "")
    .slice(0, 32000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function colRef(i, r) {
  let n = i;
  let letters = "";
  do {
    letters = String.fromCharCode(65 + (n % 26)) + letters;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return `${letters}${r}`;
}

function writeXlsx(path, rows) {
  const headers = CAMPOS;
  const sheetRows = [
    `<row r="1">${headers.map((h, i) => `<c r="${colRef(i, 1)}" t="inlineStr"><is><t>${xmlEsc(h)}</t></is></c>`).join("")}</row>`,
    ...rows.map((row, ri) => {
      const r = ri + 2;
      return `<row r="${r}">${headers
        .map((h, i) => `<c r="${colRef(i, r)}" t="inlineStr"><is><t>${xmlEsc(row[h])}</t></is></c>`)
        .join("")}</row>`;
    }),
  ].join("");
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Protelim estofados" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
  const types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;
  writeFileSync(
    path,
    zipStore([
      { name: "[Content_Types].xml", data: types },
      { name: "_rels/.rels", data: rels },
      { name: "xl/workbook.xml", data: workbook },
      { name: "xl/_rels/workbook.xml.rels", data: wbRels },
      { name: "xl/worksheets/sheet1.xml", data: sheet },
    ]),
  );
}

function saveData(produtos) {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "protelim_estofados.json"), JSON.stringify(produtos, null, 2), "utf8");
  const csv = [
    CAMPOS.join(";"),
    ...produtos.map((p) => CAMPOS.map((k) => `"${String(p[k] ?? "").replace(/"/g, '""')}"`).join(";")),
  ].join("\n");
  writeFileSync(join(OUT, "protelim_estofados.csv"), `\uFEFF${csv}`, "utf8");
  writeXlsx(join(OUT, "protelim_estofados.xlsx"), produtos);
  log("salvo", join(OUT, "protelim_estofados.json"));
  log("xlsx", join(OUT, "protelim_estofados.xlsx"));
}

function slugFromUrl(url) {
  const m = String(url).match(/\/produto\/([a-z0-9-]+)\/?/i);
  return m ? `protelim-${m[1]}` : "";
}

function arquivoFromSlug(slug) {
  return slug
    .replace(/^protelim-/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("_");
}

async function discoverProdutos(seed) {
  const seen = new Set(seed.map((p) => p.url.replace(/\/+$/, "/")));
  const extra = [];
  for (const cat of DISCOVER_CATEGORIES) {
    log("Categoria", cat.url);
    try {
      const html = await (await get(cat.url)).text();
      const re = /https:\/\/protelim\.com\.br\/produto\/([a-z0-9-]+)\//gi;
      let m;
      while ((m = re.exec(html))) {
        if (/lancamento/i.test(m[1])) continue;
        const url = `https://protelim.com.br/produto/${m[1]}/`;
        if (seen.has(url)) continue;
        seen.add(url);
        const slug = slugFromUrl(url);
        extra.push({
          slug,
          nome: m[1],
          url,
          linha: cat.linha,
          arquivo: arquivoFromSlug(slug),
          descoberto: true,
        });
      }
    } catch (err) {
      log("WARN categoria bloqueada/falhou", cat.url, err.message);
    }
    await polite();
  }
  if (extra.length) log("Descobertos nas categorias oficiais:", extra.map((p) => p.slug).join(", "));
  return [...seed, ...extra];
}

const coletados = [];
mkdirSync(OUT, { recursive: true });
mkdirSync(FISPQ_DIR, { recursive: true });

const lista = await discoverProdutos(PRODUTOS);
let fdsBaixados = 0;
let fdsPulados = 0;
const bloqueados = [];

for (let i = 0; i < lista.length; i++) {
  const meta = lista[i];
  log(`[${i + 1}/${lista.length}]`, meta.url);
  try {
    const item = await getProductData(meta);
    if (!item.resumo) log("WARN Descrição vazia", meta.slug);
    if (!item.fdsPdf) log("WARN FDS ausente", meta.slug);
    if (!item.diluicao) log("WARN Diluição não publicada ou não extraída", meta.slug);
    coletados.push(item);
    const listaPdf = [];
    if (item.fdsPdf) listaPdf.push(["FDS", item.fdsPdf]);
    if (item.sdsPdf) listaPdf.push(["SDS", item.sdsPdf]);
    if (item.fichaPdf) listaPdf.push(["Ficha", item.fichaPdf]);
    for (const d of item.documentos || []) listaPdf.push([d.label, d.url]);
    for (const [label, url] of listaPdf) {
      try {
        const dest = join(FISPQ_DIR, arquivoPdf(meta, label, url));
        const r = await downloadFispq(url, dest);
        if (r.downloaded && /fds|fispq/i.test(label + url)) fdsBaixados += 1;
        if (r.skipped) fdsPulados += 1;
        if (r.downloaded) await polite();
      } catch (err) {
        log("WARN PDF falhou", url, err.message);
        bloqueados.push(url);
      }
    }
  } catch (err) {
    log("ERR produto", meta.slug, err.message);
    bloqueados.push(meta.url);
  }
  if (i < lista.length - 1) await polite();
}

saveData(coletados);
log(`Concluído: ${coletados.length} produtos, ${fdsBaixados} FDS baixados (${fdsPulados} PDFs já existiam)`);
for (const p of coletados) {
  log("-", p.nome, "| pH:", p.ph || "(não publicado)", "| diluição:", (p.diluicao || "(não publicada)").slice(0, 90), "| tamanhos:", p.embalagens || "(não publicados)", "| FDS:", p.fdsPdf ? "sim" : "não");
}
if (bloqueados.length) {
  log("Fontes bloqueadas/falhas:");
  for (const u of bloqueados) log("  ", u);
}
