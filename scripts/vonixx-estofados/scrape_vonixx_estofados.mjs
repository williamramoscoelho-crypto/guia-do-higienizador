/**
 * Coleta Vonixx (estofados / Sistema VSC) — equivalente Node do scrape Python.
 * Só páginas públicas. Não inventa química.
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

const PRODUTOS = [
  { slug: "vonixx-extractus", nome: "EXTRACTUS", url: "https://www.vonixx.com.br/produto/extractus/", linha: "Sistema VSC — passo 1 (sintéticos / extratora)" },
  { slug: "vonixx-extractus-sensitive", nome: "EXTRACTUS SENSITIVE", url: "https://www.vonixx.com.br/produto/extractus-sensitive/", linha: "Sistema VSC — tecidos delicados / fibras naturais" },
  { slug: "vonixx-bactran", nome: "BACTRAN", url: "https://www.vonixx.com.br/produto/bactran/", linha: "Sistema VSC — bactericida / peróxido" },
  { slug: "vonixx-sanitizante-finalizador", nome: "SANITIZANTE FINALIZADOR", url: "https://www.vonixx.com.br/produto/sanitizante-finalizador/", linha: "Sistema VSC — finalização / pulverização" },
  { slug: "vonixx-sintra-pro", nome: "SINTRA PRO", url: "https://www.vonixx.com.br/produto/sintra-pro/", linha: "Interior / flotador (painéis, couro, carpete, estofado)" },
  { slug: "vonixx-sintra-fast", nome: "SINTRA FAST", url: "https://www.vonixx.com.br/produto/sintra-fast/", linha: "Interior pronto uso" },
  { slug: "vonixx-vertex", nome: "VERTEX", url: "https://www.vonixx.com.br/produto/vertex/", linha: "Limpador de estofados automotivos e residenciais" },
];

const JUNK = /CERAS E SELANTES|LOJA ONLINE|VER TODOS OS PRODUTOS|Selecione um Produto|Carregando\.\.\.|SAC\/RELACIONAMENTO|COMPARE|AVALIAÇÕES DO PRODUTO/i;
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
  "fdsPdf",
  "sdsPdf",
  "fichaPdf",
  "coletadoEm",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const polite = () => sleep(1600 + Math.random() * 1400);

async function get(url, retries = 4) {
  let last;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html,application/pdf,*/*", "Accept-Language": "pt-BR,pt;q=0.9" },
        redirect: "follow",
      });
      if ([429, 500, 502, 503, 504].includes(res.status)) {
        console.warn("HTTP", res.status, url, "retry");
        await sleep(2000 * (i + 1));
        last = res;
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      last = err;
      console.warn("Falha", url, err.message);
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error(`Não obteve ${url}: ${last}`);
}

function decode(s) {
  return s
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
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
    .replace(/-->/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limparCampo(s) {
  return String(s || "")
    .replace(/\s+[A-ZÁÉÍÓÚ0-9][A-ZÁÉÍÓÚ0-9\s-]{2,40} COMPRE AGORA[\s\S]*$/i, "")
    .replace(/\s+COMPRE AGORA[\s\S]*$/i, "")
    .replace(/\s+FICHA TÉCNICA\s*$/i, "")
    .replace(/\s+OBSERVAÇÃO:\s*Recomendamos spot test[^.]*\./gi, " Spot test recomendado pelo fabricante.")
    .replace(/\s+(EXTRACTUS(?: SENSITIVE)?|BACTRAN|SANITIZANTE FINALIZADOR|SINTRA PRO|SINTRA FAST|VERTEX)\s*$/i, "")
    .trim();
}

function tidy(s, max = 0) {
  let t = limparCampo(decode(String(s || "")));
  t = t.replace(/\s*(COMPARE|PERGUNTAS FREQUENTES|AVALIAÇÕES DO PRODUTO|Selecione um Produto).*$/i, "").trim();
  if (JUNK.test(t) && !/estofad|tecido|limp|higien|carpet/i.test(t.slice(0, 120))) return "";
  if (max && t.length > max) {
    const cut = t.slice(0, max);
    const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
    t = (last > 80 ? cut.slice(0, last + 1) : `${cut.trim()}…`).trim();
  }
  return t;
}

function visivel(html) {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|h[1-6]|div|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, "\n"),
  ).replace(/\n{3,}/g, "\n\n");
}

function afterH1(html) {
  const i = html.search(/<h1[\s\S]*?<\/h1>/i);
  return i >= 0 ? html.slice(i) : html;
}

function metaDescription(html) {
  const m =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? tidy(m[1], 620) : "";
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
  return rest.slice(0, cut).replace(/\s+/g, " ").trim().replace(/^[•|\-\s]+/, "");
}

function afterHeading(text, heading) {
  const re = new RegExp(`${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-zÀ-ú])\\s*`, "i");
  const m = re.exec(text);
  if (!m) return "";
  return text.slice(m.index + m[0].length);
}

function h1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? decode(m[1].replace(/<[^>]+>/g, " ")) : "";
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

function classificar(docs) {
  let fdsPdf = "";
  let sdsPdf = "";
  let fichaPdf = "";
  const documentos = [];
  for (const d of docs) {
    const blob = `${d.label} ${d.url}`.toLowerCase();
    if (/fds|fispq/.test(blob) && !fdsPdf) fdsPdf = d.url;
    else if (/\bsds\b/.test(blob) && !/fds/.test(blob) && !sdsPdf) sdsPdf = d.url;
    else if (/ficha/.test(blob) && /t[eé]cn/.test(blob) && !fichaPdf) fichaPdf = d.url;
    else documentos.push(d);
  }
  return { fdsPdf, sdsPdf, fichaPdf, documentos };
}

function tamanhos(text, nome) {
  const bloco = between(text, "VERSÕES DISPONÍVEIS", ["Ficha Técnica", "COMPARE", "FAQ"]);
  const hits = [];
  const re = new RegExp(`${nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(\\d+(?:,\\d+)?(?:ml|ML|L))`, "gi");
  for (const src of [bloco, text]) {
    for (const x of src.matchAll(re)) {
      const v = x[1].toUpperCase().replace("ML", "ml");
      if (v === "50ml" || /^\d{4,}/.test(v)) continue;
      if (!hits.includes(v)) hits.push(v);
    }
  }
  return hits.join(", ");
}

function passos(text) {
  const bloco = between(text, "APRENDA A FORMA CORRETA DE APLICAÇÃO DESSE PRODUTO", [
    "VERSÕES DISPONÍVEIS",
    "FICHA TÉCNICA",
    "COMPARE",
  ]);
  if (!bloco) return "";
  const parts = bloco.split(/(?:(?<=\D)|^)\s*(\d{1,2})\s+(?=[A-ZÁÉÍÓÚÀÃÕ])/);
  const steps = [];
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const body = parts[i + 1].replace(/\s+/g, " ").replace(/-->/g, "").trim();
    if (body.length > 12) steps.push(`${parts[i]}. ${body}`);
  }
  return tidy(steps.join(" "), 900);
}

function faq(text) {
  const bloco = between(text, "FAQ", ["AVALIAÇÕES DO PRODUTO", "VER TODOS OS PRODUTOS", "Formulário"]);
  if (!bloco) return [];
  const itens = [];
  const re =
    /([A-ZÁÉÍÓÚÀÃÕ0-9][A-ZÁÉÍÓÚÀÃÕ0-9Ç\s,'’\-]{8,140}\?)\s+(.+?)(?=\s+[A-ZÁÉÍÓÚÀÃÕ0-9][A-ZÁÉÍÓÚÀÃÕ0-9Ç\s,'’\-]{8,140}\?|$)/g;
  let m;
  while ((m = re.exec(bloco))) {
    const p = m[1].replace(/\s+/g, " ").trim();
    const r = m[2].replace(/\s+/g, " ").trim();
    if (r.length >= 3 && !JUNK.test(p)) itens.push({ p, r });
  }
  return itens.slice(0, 8);
}

function descricao(html, text, nome) {
  const stops = /TAMANHOS DISPONÍVEIS|PASSO \d|GALERIA|VERSÕES DISPONÍVEIS|COMPRE AGORA|FICHA TÉCNICA/;
  const esc = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const candidatos = [
    text.match(new RegExp(`${esc}\\s+(?:é|e)\\s+[\\s\\S]{80,1100}`, "i"))?.[0],
    text.match(/Esse produto chegou como um complemento[\s\S]{80,900}/i)?.[0],
    text.match(/O produto que todo profissional[\s\S]{80,900}/i)?.[0],
  ];
  for (const raw of candidatos) {
    if (!raw) continue;
    const body = tidy(raw.split(stops)[0], 900);
    if (body && !JUNK.test(body) && body.length > 60) return body;
  }
  const meta = metaDescription(html);
  if (meta && !JUNK.test(meta)) return meta;
  return "";
}

function blocoFicha(text) {
  const low = text.toLowerCase();
  let lastSpec = "";
  let from = 0;
  while (true) {
    const i = low.indexOf("ficha técnica", from);
    if (i < 0) break;
    const chunk = between(text.slice(i), text.slice(i, i + 13), [
      "FDS",
      "SDS",
      "CHECKLIST",
      "COMPARE",
      "PERGUNTAS FREQUENTES",
      "FAQ",
      "AVALIAÇÕES",
    ]);
    if (/(?:^|\s)(pH|DILUIÇ)/i.test(chunk) && /1:\d+|Neutro|Ácido|B[áa]sico|alcalino|NÃO RECOMENDADO/i.test(chunk)) {
      lastSpec = chunk;
    }
    from = i + 13;
  }
  const spec = lastSpec.match(/(?:pH\s+|DILUIÇ[ÃA]O[S]?\s+|OBSERVAÇÃO:|USO RECOMENDADO|NÃO RECOMENDADO)[\s\S]*/i);
  return tidy(spec ? spec[0] : lastSpec, 1400);
}

function diluicaoDe(blob) {
  const tabela = blob.match(
    /(?<!\()Sujeira\s+(?:pesada|Pesada|leve|média|Média)[^|]{0,50}1:\d{1,3}(?:\s*[|•]\s*Sujeira[^|]{0,50}1:\d{1,3}){0,4}[^.|]*/i,
  );
  const local = blob.match(/dilui[cç][aã]o 1:2[^.]{0,90}\./i);
  const unica = blob.match(/[Úú]nica padr[aã]o:\s*1:\d+/i);
  const laterais = blob.match(/Limpeza de laterais de portas[^.]{0,80}1:\d+\.?/i);
  const carpetes = blob.match(/Carpetes, estofados e limpeza de teto[^.]{0,180}\./i);
  const manut = blob.match(/Manutenção de limpeza interna[^.]{0,140}\./i);
  const extra = blob.match(/Em extratoras com dilui[cç][aã]o de at[eé] 1:\d+[^.]{0,80}\./i);
  const partes = [tabela?.[0], laterais?.[0], carpetes?.[0], manut?.[0], local?.[0], unica?.[0], extra?.[0]]
    .map((x) => tidy(x || "").replace(/\s*pH Neutro.*$/i, "").replace(/\s*USO RECOMENDADO.*$/i, ""))
    .filter(Boolean);
  const spot = /spot test/i.test(blob) ? "Spot test recomendado pelo fabricante." : "";
  if (spot && !partes.some((p) => /spot test/i.test(p))) partes.push(spot);
  return tidy(partes.join(" "), 520);
}

function phDe(blob) {
  if (/Não recomendamos realizar a aplicação em vidros automotivos/i.test(blob) && /alcalino/i.test(blob)) {
    return "Alcalino. Não recomendamos realizar a aplicação em vidros automotivos (Vonixx).";
  }
  const m =
    blob.match(/pH\s*(B[áa]sico(?:, conforme r[óo]tulo)?\.?)/i) ||
    blob.match(/pH\s*(Neutro\.?)/i) ||
    blob.match(/pH\s*(Ácido\.?)/i) ||
    blob.match(/Produto com pH (alcalino)/i) ||
    blob.match(/produto [ée] (alcalino)/i);
  if (!m) return "";
  return tidy(m[1], 80).replace(/^pH\s*/i, "");
}

function campoApos(blob, heading, ends) {
  const rest = afterHeading(blob, heading);
  if (!rest) return "";
  let cut = rest.length;
  const low = rest.toLowerCase();
  for (const e of [...ends, "COMPRE AGORA", "SUPERFÍCIES ESTOFADOS", "INDICAÇÃO LIMPADOR"]) {
    const j = low.indexOf(e.toLowerCase());
    if (j >= 0 && j < cut) cut = j;
  }
  return tidy(rest.slice(0, cut), 520);
}

function parse(meta, html) {
  const corpo = afterH1(html);
  const text = visivel(corpo);
  const nome = h1(html) || meta.nome;
  const ficha = blocoFicha(text);
  const src = `${ficha} ${text}`;
  const pdfMap = classificar(pdfs(html, meta.url));
  const uso = campoApos(src, "USO RECOMENDADO", ["INFORMAÇÕES ADICIONAIS", "NÃO RECOMENDADO", "FDS", "SDS", "PRECAUÇÕES"]);
  const nao =
    campoApos(src, "NÃO RECOMENDADO", ["FDS", "SDS", "CHECKLIST", "COMPARE", "INFORMAÇÕES ADICIONAIS"]) ||
    campoApos(src, "INFORMAÇÕES ADICIONAIS", ["FDS", "SDS", "CHECKLIST", "COMPARE"]);
  const info = campoApos(src, "INFORMAÇÕES ADICIONAIS", ["FDS", "SDS", "CHECKLIST", "COMPARE"]);
  const perguntas = faq(text);
  let diluicao = diluicaoDe(src);
  if (!diluicao) {
    const pronto = perguntas.find((q) => /dilui/i.test(q.p) && /pronto/i.test(q.r));
    if (pronto) diluicao = tidy(pronto.r, 160);
  }
  return {
    slug: meta.slug,
    marca: "vonixx",
    nome,
    url: meta.url,
    linha: meta.linha,
    resumo: descricao(html, text, nome),
    diluicao,
    ph: phDe(src),
    usoRecomendado: uso,
    naoRecomendado: nao,
    informacoesAdicionais: info,
    composicao: "",
    modoDeUsar: passos(text),
    embalagens: tamanhos(text, nome),
    fichaTecnica: ficha,
    faq: perguntas,
    ...pdfMap,
    coletadoEm: new Date().toISOString().slice(0, 10),
    fonteHtml: meta.url,
  };
}

function arquivoPdf(produto, label, url) {
  const base = produto.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const blob = `${label} ${url}`.toLowerCase();
  let kind = "PDF";
  if (/fds|fispq/.test(blob)) kind = "FISPQ";
  else if (/\bsds\b/.test(blob)) kind = "SDS";
  else if (/checklist|cheklist/.test(blob)) kind = "Checklist";
  else if (/certificado|anvisa/.test(blob)) kind = "Certificado";
  return `${base}_${kind}.pdf`;
}

async function baixarPdf(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 1000) {
    console.log("PDF já existe", dest.split(/[/\\]/).pop());
    return false;
  }
  const res = await get(url);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log("Baixado", dest.split(/[/\\]/).pop(), buf.length, "bytes");
  return true;
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

function writeXlsx(path, rows) {
  const headers = CAMPOS;
  const sheetRows = [
    `<row r="1">${headers.map((h, i) => `<c r="${String.fromCharCode(65 + i)}1" t="inlineStr"><is><t>${xmlEsc(h)}</t></is></c>`).join("")}</row>`,
    ...rows.map((row, ri) => {
      const r = ri + 2;
      return `<row r="${r}">${headers
        .map((h, i) => `<c r="${String.fromCharCode(65 + i)}${r}" t="inlineStr"><is><t>${xmlEsc(row[h])}</t></is></c>`)
        .join("")}</row>`;
    }),
  ].join("");
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Vonixx estofados" sheetId="1" r:id="rId1"/></sheets></workbook>`;
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

const coletados = [];
mkdirSync(OUT, { recursive: true });
mkdirSync(FISPQ_DIR, { recursive: true });

for (let i = 0; i < PRODUTOS.length; i++) {
  const meta = PRODUTOS[i];
  console.log(`[${i + 1}/${PRODUTOS.length}]`, meta.url);
  const html = await (await get(meta.url)).text();
  const item = parse(meta, html);
  if (!item.resumo) console.warn("Descrição vazia", meta.slug);
  if (!item.fdsPdf) console.warn("FISPQ ausente", meta.slug);
  if (!item.diluicao) console.warn("Diluição não publicada ou não extraída", meta.slug);
  coletados.push(item);
  const lista = [];
  if (item.fdsPdf) lista.push([item.nome, "FISPQ", item.fdsPdf]);
  if (item.sdsPdf) lista.push([item.nome, "SDS", item.sdsPdf]);
  if (item.fichaPdf) lista.push([item.nome, "Ficha", item.fichaPdf]);
  for (const d of item.documentos || []) lista.push([item.nome, d.label, d.url]);
  for (const [nome, label, url] of lista) {
    const baixou = await baixarPdf(url, join(FISPQ_DIR, arquivoPdf(nome, label, url)));
    if (baixou) await polite();
  }
  if (i < PRODUTOS.length - 1) await polite();
}

writeFileSync(join(OUT, "vonixx_estofados.json"), JSON.stringify(coletados, null, 2), "utf8");
const csv = [
  CAMPOS.join(";"),
  ...coletados.map((p) => CAMPOS.map((k) => `"${String(p[k] ?? "").replace(/"/g, '""')}"`).join(";")),
].join("\n");
writeFileSync(join(OUT, "vonixx_estofados.csv"), `\uFEFF${csv}`, "utf8");
writeXlsx(join(OUT, "vonixx_estofados.xlsx"), coletados);
console.log("salvo", join(OUT, "vonixx_estofados.json"));
console.log("xlsx", join(OUT, "vonixx_estofados.xlsx"));
console.log(coletados.length, "produtos");
for (const p of coletados) {
  console.log("-", p.nome, "| pH:", p.ph || "(não publicado)", "| diluição:", (p.diluicao || "(não publicada)").slice(0, 80), "| tamanhos:", p.embalagens);
}
