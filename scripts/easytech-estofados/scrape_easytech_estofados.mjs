/**
 * Coleta Easytech (estofados / tapetes / carpetes).
 * Só páginas públicas. Não inventa pH, diluição, composição ou ANVISA.
 *
 * Produtos novos: acrescente um item em PRODUTOS (slug, busca, urls).
 * O parser é genérico — não precisa reescrever extração por SKU.
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

/** Config no topo: slug + nomes de busca + URLs conhecidas. */
const PRODUTOS = [
  {
    slug: "easytech-pluri",
    nome: "PLURI",
    busca: ["Pluri", "APC PLURI", "Multilimpador PLURI"],
    urls: [
      "https://www.easytechshield.com.br/loja/pluri/",
      "https://www.quickclean.com.br/multilimpador-concentrado-pluri-5l-easytech",
      "https://www.lojadoprofissional.com.br/pluri",
      "https://www.carxparts.com.br/multilimpador-limpeza-pesada-pluri-5l-easytech",
      "https://www.polibox.com.br/produto/pluri-multilimpador-alcalino-limpeza-pesada-easytech-5-litros-diluicao-ate-1-50/27637",
    ],
    linha: "APC alcalino concentrado — estofados, colchões, tecidos",
  },
  {
    slug: "easytech-plurisensitive",
    nome: "PLURI SENSITIVE",
    busca: ["Pluri Sensitive", "PLURI SENSITIVE"],
    urls: ["https://www.easytechshield.com.br/loja/plurisensitive/"],
    linha: "APC baixa odor — tecidos / ambientes fechados",
  },
  {
    slug: "easytech-float",
    nome: "FLOAT",
    busca: ["Float APC", "Float Easytech", "FLOAT APC Flotador"],
    urls: [
      "https://www.easytechshield.com.br/loja/float/",
      "https://www.lojadoprofissional.com.br/float-easytech",
    ],
    linha: "APC flotador concentrado — extratoras / estofados",
  },
  {
    slug: "easytech-zbac",
    nome: "ZBAC",
    busca: ["ZBac", "ZBAC", "Zbac Easytech"],
    urls: [
      "https://www.easytechshield.com.br/loja/zbac/",
      "https://www.quickclean.com.br/bactericida-com-poder-finalizador-concentrado-zbac-5l-easytech",
    ],
    linha: "Limpador ácido bactericida — estofados, tapetes, odores orgânicos",
  },
  {
    slug: "easytech-oxy4d",
    nome: "OXY-4D",
    busca: ["Oxy-4D", "Oxy 4D", "Oxy4D", "Oxy2", "OXY2"],
    urls: [
      "https://www.easytechshield.com.br/loja/oxy4d/",
      "https://www.carxparts.com.br/uso-interno/tira-mancha-concentrado-easytech-oxy-4d-5lt",
    ],
    linha: "Tira-manchas concentrado com peróxido — estofados e tapetes",
  },
  {
    slug: "easytech-tapetex",
    nome: "TAPETEX",
    busca: ["Tapetex"],
    urls: [
      "https://www.easytechshield.com.br/loja/tapetex/",
      "https://www.quickclean.com.br/limpeza-de-estofados/quimicos/limpador-para-tapetes-e-carpetes-tapetex-5l-easytech",
      "https://www.polibox.com.br/limpadores-especiais/tapetex-limpador-para-tapetes-e-carpetes-easytech-5-litros-diluicao-ate-1150",
    ],
    linha: "Detergente concentrado para tapetes e carpetes",
  },
  {
    slug: "easytech-multiinteriores",
    nome: "MULTI INTERIORES",
    busca: ["Multi Interiores", "MULTI INTERIORES"],
    urls: [
      "https://www.easytechshield.com.br/loja/multiinteriores/",
      "https://www.lojadoprofissional.com.br/multi-interiores-easytech",
    ],
    linha: "APC baixa espumação — tecidos, couro e vinil",
  },
  {
    slug: "easytech-proimper",
    nome: "PRO IMPER",
    busca: ["Pro Imper", "PRO IMPER"],
    urls: ["https://www.easytechshield.com.br/loja/proimper/"],
    linha: "Impermeabilizante de tecidos base água",
  },
  {
    slug: "easytech-prepara",
    nome: "PREPARA",
    busca: ["Prepara Easytech", "PREPARA"],
    urls: [
      "https://www.easytechshield.com.br/loja/prepara/",
      "https://www.lojadoprofissional.com.br/prepara-easytech",
    ],
    linha: "Neutralizador de tensoativos — pré-impermeabilização",
  },
  {
    slug: "easytech-plurifast",
    nome: "PLURI FAST",
    busca: ["Pluri Fast", "PLURI FAST"],
    urls: [
      "https://www.easytechshield.com.br/loja/plurifast/",
      "https://www.polibox.com.br/limpadores-especiais/pluri-fast-limpador-pronto-uso-easytech-500ml",
    ],
    linha: "APC Pluri pronto uso — colchão, sofás e tecidos",
  },
  {
    slug: "easytech-oxyfast",
    nome: "OXY FAST",
    busca: ["Oxy Fast", "OXY FAST"],
    urls: ["https://www.easytechshield.com.br/loja/oxyfast/"],
    linha: "Tira-manchas pronto uso — oxigênio ativo em tecidos",
  },
  {
    slug: "easytech-quickinteriores",
    nome: "QUICK INTERIORES",
    busca: ["Quick Interiores"],
    urls: ["https://www.easytechshield.com.br/loja/quickinteriores/"],
    linha: "Limpeza e proteção de interior (manutenção)",
  },
  {
    slug: "easytech-proimperpremium",
    nome: "PRO IMPER PREMIUM",
    busca: ["Pro Imper Premium"],
    urls: ["https://www.easytechshield.com.br/loja/proimperpremium/"],
    linha: "Impermeabilizante de tecidos base água (premium)",
  },
  {
    slug: "easytech-ecotextil",
    nome: "ECOTEXTIL",
    busca: ["Ecotextil"],
    urls: ["https://www.easytechshield.com.br/loja/ecotextil/"],
    linha: "Impermeabilizante para tecidos — nanotecnologia",
  },
];

const BUSCA_SITES = [
  { id: "oficial", template: "https://www.easytechshield.com.br/?s={q}" },
  { id: "quickclean", template: "https://www.quickclean.com.br/busca?controller=search&s={q}" },
  { id: "lojadoprofissional", template: "https://www.lojadoprofissional.com.br/busca?busca={q}" },
  { id: "carxparts", template: "https://www.carxparts.com.br/busca?controller=search&s={q}" },
  { id: "polibox", template: "https://www.polibox.com.br/busca?q={q}" },
];

const OFICIAL = /easytechshield\.com\.br/i;
const JUNK =
  /Revenda Easytech|Fabricando produtos|Seja um Revendedor|Utilizamos cookies|Cadastre-se|Lembre-me|política de privacidade|Inicio Sobre Cursos|FALE COM|SAC\/RELACIONAMENTO|Produtos relacionados|Quero Comprar|Easy Fabricando|Na Easy a química|Peso \d|Dimensões \d/i;
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
  "composicao",
  "modoDeUsar",
  "anvisa",
  "fichaTecnica",
  "fdsPdf",
  "sdsPdf",
  "fichaPdf",
  "coletadoEm",
];

const bloqueios = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const polite = () => sleep(1600 + Math.random() * 1400);

async function get(url, retries = 4) {
  let last;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html,application/pdf,application/json,*/*", "Accept-Language": "pt-BR,pt;q=0.9" },
        redirect: "follow",
      });
      if ([429, 500, 502, 503, 504].includes(res.status)) {
        console.warn("HTTP", res.status, url, "retry");
        await sleep(2000 * (i + 1));
        last = res;
        continue;
      }
      if ([401, 403].includes(res.status)) {
        bloqueios.push({ url, status: res.status, motivo: "bloqueado" });
        throw new Error(`HTTP ${res.status}`);
      }
      if ([400, 404, 405, 410].includes(res.status)) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      last = err;
      console.warn("Falha", url, err.message);
      await sleep(2000 * (i + 1));
    }
  }
  bloqueios.push({ url, status: "fail", motivo: String(last?.message || last) });
  throw new Error(`Não obteve ${url}: ${last}`);
}

function decode(s) {
  return String(s || "")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&times;/gi, "×")
    .replace(/&agrave;/gi, "à")
    .replace(/&aacute;/gi, "á")
    .replace(/&atilde;/gi, "ã")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&eacute;/gi, "é")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&oacute;/gi, "ó")
    .replace(/&otilde;/gi, "õ")
    .replace(/&uacute;/gi, "ú")
    .replace(/&iacute;/gi, "í")
    .replace(/&rsquo;/gi, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/-->/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tidy(s, max = 0) {
  let t = decode(String(s || ""));
  t = t.replace(/\s*(Revenda Easytech|Fabricando produtos|Seja um Revendedor|Peso \d|Dimensões \d|Entrar Nome de usuário).*$/i, "").trim();
  if (JUNK.test(t) && t.length < 90) return "";
  if (max && t.length > max) {
    const cut = t.slice(0, max);
    const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(" • "));
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
      .replace(/<\/(p|li|h[1-6]|div|tr|dt|dd)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, "\n"),
  ).replace(/\n{3,}/g, "\n\n");
}

function afterH1(html) {
  const i = html.search(/<h1[\s\S]*?<\/h1>/i);
  return i >= 0 ? html.slice(i) : html;
}

function h1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? decode(m[1].replace(/<[^>]+>/g, " ")) : "";
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
  return rest.slice(0, cut).replace(/\s+/g, " ").trim().replace(/^[•|:.\-\s]+/, "");
}

function corteInstitucional(text) {
  const i = text.search(
    /Fabricando produtos|Na Easy a química|Revenda Easytech|Seja um Revendedor|Entrar\s+Nome de usuário|Cadastre-se\s+Endereço|Utilizamos cookies|Peso\s+\d/i,
  );
  return i > 180 ? text.slice(0, i) : text;
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
  const loose = /https?:\/\/[^"'<\s]+\.pdf(?:\?[^"'<\s]*)?/gi;
  let x;
  while ((x = loose.exec(html))) {
    const url = x[0];
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ label: url.split("/").pop() || "PDF", url });
  }
  return out;
}

function recencyScore(url, label = "") {
  const blob = `${url} ${label}`.toLowerCase();
  let score = 0;
  const years = [...blob.matchAll(/20(?:1[5-9]|2[0-9])/g)].map((m) => Number(m[0]));
  if (years.length) score += Math.max(...years) * 10000;
  const v = blob.match(/(?:^|[_\-.\s])v(\d+)/);
  if (v) score += Number(v[1]) * 100;
  const rev = blob.match(/rev[._\-]?(\d+)/);
  if (rev) score += Number(rev[1]);
  const fds = blob.match(/fds[._\-]?(\d{1,2})\b/);
  if (fds) score += Number(fds[1]);
  return score;
}

function pickNewest(docs) {
  if (!docs.length) return "";
  const ranked = [...docs].sort((a, b) => recencyScore(b.url, b.label) - recencyScore(a.url, a.label));
  return ranked[0].url;
}

function classificar(docs) {
  const fds = [];
  const sds = [];
  const ficha = [];
  const documentos = [];
  for (const d of docs) {
    const blob = `${d.label} ${d.url}`.toLowerCase();
    if (/fds|fispq/.test(blob)) fds.push(d);
    else if (/\bsds\b/.test(blob) && !/fds/.test(blob)) sds.push(d);
    else if (/ficha/.test(blob) && /t[eé]cn/.test(blob)) ficha.push(d);
    else documentos.push(d);
  }
  return {
    fdsPdf: pickNewest(fds),
    sdsPdf: pickNewest(sds),
    fichaPdf: pickNewest(ficha),
    documentos,
    pdfsEncontrados: docs,
  };
}

function phDe(blob) {
  const m =
    blob.match(/\bpH\s*[–\-:]?\s*(\d+[.,]\d+\s*[–\-]\s*\d+[.,]\d+)/i) ||
    blob.match(/\bpH\s*[–\-:]?\s*(\d+[.,]\d+)/i) ||
    blob.match(/\bpH\s*[–\-:]?\s*(\d{1,2})(?!\s*:)/i) ||
    blob.match(/\b(pH levemente alcalino)[^.]*\.?/i);
  if (!m) return "";
  let t = tidy(m[1] || m[0], 80);
  t = t.replace(/\s*(Modo de Usar|Observação|DILUI|Caracter).*$/i, "").trim();
  if (/^pH\s/i.test(t) === false && /^\d/.test(t)) return t;
  return t.replace(/^pH\s*[–\-:]?\s*/i, "");
}

function diluicaoDe(text) {
  const bloco =
    between(text, "Diluição Indicada", ["Modo de Usar", "Como utilizar", "Aplicação", "Carcterísticas", "Características", "Observação", "PRODUTO NOTIFICADO"]) ||
    between(text, "Diluições recomendadas", ["Modo de Usar", "Como utilizar", "PRODUTO NOTIFICADO", "Carcterísticas", "Características"]) ||
    between(text, "Diluição recomendada", ["Modo de Usar", "Como utilizar", "PRODUTO NOTIFICADO"]);
  if (bloco && /1:\d+|puro|50ml/i.test(bloco)) return tidy(bloco, 520);
  const linhas = [];
  for (const m of text.matchAll(
    /(Incrustada|Pesada|Média Intensidade|Leve|Limpeza muito pesada|Limpeza pesada|Limpeza de média Intensidade|Limpeza leve|Manchas pesadas[^.]*|Manchas incrustadas[^:]*|Manchas de alta intensidade|Manchas de média intensidade|Manchas de baixa intensidade|Limpeza de manutenção|Higienização pesada|Higienização leve|Manchas de mofo preto|Manchas de alta intensidade \(sangue[^)]*\))\s*[:–-]?\s*(Diluir em até\s*1:\d+|1:\d+|puro|50ml[^.]+)/gi,
  )) {
    linhas.push(tidy(`${m[1]}: ${m[2]}`));
  }
  return tidy(linhas.join(" • "), 520);
}

function modoDe(text) {
  const bloco =
    between(text, "Modo de Usar", ["Observação", "Disponível em", "PRODUTO NOTIFICADO", "Peso", "Aplicação", "Carcterísticas"]) ||
    between(text, "Como utilizar", ["Observação", "Disponível em", "Peso", "PRODUTO NOTIFICADO"]);
  return tidy(bloco, 900);
}

function aplicacaoDe(text) {
  const bloco = between(text, "Aplicação", ["Carcterísticas", "Características", "Diluições", "Diluição", "Como utilizar", "Modo de Usar"]);
  return tidy(bloco, 420);
}

function caracteristicasDe(text) {
  const bloco =
    between(text, "Carcterísticas", ["Diluições", "Diluição", "Como utilizar", "Modo de Usar", "PRODUTO NOTIFICADO"]) ||
    between(text, "Características", ["Diluições", "Diluição", "Como utilizar", "Modo de Usar", "PRODUTO NOTIFICADO"]);
  return tidy(bloco, 520);
}

function anvisaDe(text) {
  const n = text.match(/ANVISA[:\s]*(\d{10,})/i);
  if (n) return `Notificado na ANVISA ${n[1]} (texto da página).`;
  if (/PRODUTO NOTIFICADO NA ANVISA/i.test(text)) return "PRODUTO NOTIFICADO NA ANVISA (texto da página).";
  return "";
}

function composicaoDe(text) {
  const frases = [];
  for (const m of text.matchAll(/[^.]*composi[cç][aã]o[^.]*\./gi)) {
    const f = tidy(m[0], 280);
    if (f && !JUNK.test(f) && f.length > 30) frases.push(f);
  }
  return tidy(frases.slice(0, 2).join(" "), 420);
}

function naoRecomendadoDe(text) {
  const partes = [];
  const jamais = text.match(/Jamais deve ser aplicado[^.]*\./i);
  if (jamais) partes.push(tidy(jamais[0], 220));
  const epi = text.match(/n[aã]o esque[cç]a de utilizar EPI[^.]*\./i);
  if (epi) partes.push(tidy(epi[0], 180));
  const contato = text.match(/Qualquer contato vai retirar[^.]*\./i);
  if (contato) partes.push(tidy(contato[0], 220));
  return tidy(partes.join(" "), 420);
}

function embalagensDe(text, html) {
  const hits = [];
  const add = (v) => {
    const t = tidy(v).replace(/\s+/g, " ");
    if (t && !hits.includes(t)) hits.push(t);
  };
  const disp = text.match(/Dispon[ií]vel em embalagen[^.]*\./i) || text.match(/em embalagens de [^.]{4,60}\./i);
  if (disp) add(disp[0].replace(/\.$/, ""));
  for (const m of text.matchAll(/\b(\d+(?:,\d+)?\s*(?:ml|ML|L|litros?))\b/gi)) {
    const u = m[1].replace(/\s+/g, " ").replace(/litros?/i, "L").replace(/ML/i, "ml");
    if (/1400|5500|700\.00|kg/i.test(u)) continue;
    if (/^(5L|1,5L|1\.5L|500ml|1,2L|1200ml|1500ml)$/i.test(u.replace(/\s/g, ""))) add(u.replace(/\s/g, ""));
  }
  const skuVol = html.match(/(\d+(?:,\d+)?\s*(?:ml|L))\s*(?:com dosador)?/i);
  if (skuVol && /1,2L|500ml|1,5L|5L/i.test(skuVol[0])) add(skuVol[0]);
  return hits.slice(0, 6).join(", ");
}

function resumoDe(html, text, nome) {
  const corpo = corteInstitucional(text);
  const esc = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = corpo.match(new RegExp(`(?:${esc}|Multilimpador|APC|Tira manchas|detergente|impermeabilizante|neutralizador)[^.\\n]{0,40}(?:é um|é uma|é o)[^.\\n]{40,400}\\.`, "i"));
  if (m && !JUNK.test(m[0])) return tidy(m[0], 620);
  const paras = corpo
    .split(/\n+/)
    .map((p) => tidy(p))
    .filter((p) => p.length > 80 && !JUNK.test(p) && !/Diluição|SKU:|Categoria:/i.test(p));
  if (paras[0]) return tidy(paras[0], 620);
  const meta = metaDescription(html);
  if (meta && !JUNK.test(meta)) return meta;
  return "";
}

function fichaTecnicaDe(text) {
  const partes = [caracteristicasDe(text), diluicaoDe(text), aplicacaoDe(text), anvisaDe(text)].filter(Boolean);
  return tidy(partes.join(" "), 1600);
}

function parsePagina(meta, html, url) {
  const corpoHtml = afterH1(html);
  const text = corteInstitucional(visivel(corpoHtml));
  let nome = h1(html) || meta.nome;
  if (/busca|search results|resultado da busca/i.test(nome)) nome = meta.nome;
  const pdfMap = classificar(pdfs(html, url));
  return {
    slug: meta.slug,
    marca: "easytech",
    nome,
    url,
    fonteHtml: url,
    oficial: OFICIAL.test(url),
    linha: meta.linha,
    resumo: resumoDe(html, text, meta.nome),
    diluicao: diluicaoDe(text),
    ph: phDe(text),
    usoRecomendado: aplicacaoDe(text),
    naoRecomendado: naoRecomendadoDe(text),
    informacoesAdicionais: tidy(text.match(/Observa[cç][aã]o:[^.]*\.[^.]*\./i)?.[0] || "", 420),
    composicao: composicaoDe(text),
    modoDeUsar: modoDe(text),
    embalagens: embalagensDe(text, html),
    anvisa: anvisaDe(text),
    fichaTecnica: fichaTecnicaDe(text),
    ...pdfMap,
    coletadoEm: new Date().toISOString().slice(0, 10),
  };
}

function paginaOficialProduto(extra) {
  const u = extra.url || extra.fonteHtml || "";
  return extra.oficial && /\/loja\//i.test(u);
}

function mergeCampos(base, extra) {
  const out = { ...base };
  const fill = [
    "resumo",
    "diluicao",
    "usoRecomendado",
    "naoRecomendado",
    "informacoesAdicionais",
    "modoDeUsar",
    "embalagens",
    "anvisa",
    "fichaTecnica",
    "fdsPdf",
    "sdsPdf",
    "fichaPdf",
  ];
  for (const k of fill) {
    if (!out[k] && extra[k]) out[k] = extra[k];
  }
  if (paginaOficialProduto(extra)) {
    if (extra.ph) out.ph = extra.ph;
    if (extra.composicao) out.composicao = extra.composicao;
    if (extra.nome && !/busca|search results/i.test(extra.nome)) out.nome = extra.nome;
    if (extra.url) out.url = extra.url;
    if (extra.resumo) out.resumo = extra.resumo;
    if (extra.diluicao) out.diluicao = extra.diluicao;
    if (extra.modoDeUsar) out.modoDeUsar = extra.modoDeUsar;
    if (extra.fichaTecnica) out.fichaTecnica = extra.fichaTecnica;
    if (extra.anvisa) out.anvisa = extra.anvisa;
  }
  const docs = [...(out.documentos || []), ...(extra.documentos || [])];
  const pdfsAll = [...(out.pdfsEncontrados || []), ...(extra.pdfsEncontrados || [])];
  const seen = new Set();
  out.pdfsEncontrados = pdfsAll.filter((d) => {
    if (seen.has(d.url)) return false;
    seen.add(d.url);
    return true;
  });
  const cls = classificar(out.pdfsEncontrados);
  out.fdsPdf = cls.fdsPdf || out.fdsPdf;
  out.sdsPdf = cls.sdsPdf || out.sdsPdf;
  out.fichaPdf = cls.fichaPdf || out.fichaPdf;
  out.documentos = cls.documentos;
  const fontes = new Set([...(out.fontes || []), extra.fonteHtml].filter(Boolean));
  out.fontes = [...fontes];
  if (out.embalagens && extra.embalagens) {
    const a = out.embalagens.split(",").map((s) => s.trim());
    for (const x of extra.embalagens.split(",")) {
      const t = x.trim();
      if (t && !a.includes(t)) a.push(t);
    }
    out.embalagens = a.join(", ");
  }
  return out;
}

function urlLixo(h) {
  if (
    /whatsapp|wa\.me|mailto:|tel:|api\.whatsapp|\/busca\?|[\?&]s=|\/search|\/en\/|\/page\/\d|\/carrinho|\/cart|\/login|\/checkout|wp-login|\/kit[-_]|\/kits\//i.test(
      h,
    )
  ) {
    return true;
  }
  if (/easytechshield\.com\.br/i.test(h) && !/\/loja\//i.test(h)) return true;
  return false;
}

function linksDeBusca(html, base, busca) {
  const hrefs = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const abs = new URL(m[1].replace(/&amp;/g, "&"), base);
      abs.hash = "";
      hrefs.push(abs.href);
    } catch {
      /* ignore */
    }
  }
  const termos = busca.map((t) => t.toLowerCase().replace(/\s+/g, "[-\\s]?"));
  const nomeRe = new RegExp(termos.join("|"), "i");
  const out = [];
  const seen = new Set();
  for (const h of hrefs) {
    if (urlLixo(h) || seen.has(h)) continue;
    if (!nomeRe.test(h) && !nomeRe.test(decode(h))) continue;
    if (!/\/loja\/|\/produto|\/product|easytech|pluri|float|zbac|oxy|tapetex|imper|prepara|multi/i.test(h)) continue;
    seen.add(h);
    out.push(h);
  }
  return out.slice(0, 4);
}

async function buscarUrls(meta) {
  const found = [...meta.urls];
  const q = encodeURIComponent(`Easytech ${meta.busca[0]}`);
  for (const site of BUSCA_SITES) {
    if (site.id === "lojadoprofissional") continue;
    const url = site.template.replace("{q}", q);
    try {
      const html = await (await get(url)).text();
      found.push(...linksDeBusca(html, url, meta.busca));
    } catch {
      console.warn("Busca falhou", site.id, meta.slug);
    }
    await polite();
  }
  const seen = new Set();
  return found.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

/** Coleta um SKU a partir da lista de URLs + buscas. Fácil de expandir: só edite PRODUTOS. */
async function get_product_data(meta) {
  const urls = await buscarUrls(meta);
  let acc = {
    slug: meta.slug,
    marca: "easytech",
    nome: meta.nome,
    url: meta.urls[0] || "",
    linha: meta.linha,
    resumo: "",
    diluicao: "",
    ph: "",
    usoRecomendado: "",
    naoRecomendado: "",
    informacoesAdicionais: "",
    composicao: "",
    modoDeUsar: "",
    embalagens: "",
    anvisa: "",
    fichaTecnica: "",
    fdsPdf: "",
    sdsPdf: "",
    fichaPdf: "",
    documentos: [],
    pdfsEncontrados: [],
    fontes: [],
    coletadoEm: new Date().toISOString().slice(0, 10),
    fonteHtml: meta.urls[0] || "",
  };
  for (const url of urls) {
    if (urlLixo(url)) continue;
    try {
      console.log("  GET", url);
      const html = await (await get(url)).text();
      const parsed = parsePagina(meta, html, url);
      acc = mergeCampos(acc, parsed);
    } catch (err) {
      console.warn("  skip", url, err.message);
    }
    await polite();
  }
  if (!acc.resumo) console.warn("Descrição vazia", meta.slug);
  if (!acc.fdsPdf) console.warn("FISPQ ausente", meta.slug);
  if (!acc.diluicao) console.warn("Diluição não publicada ou não extraída", meta.slug);
  if (!acc.ph) console.warn("pH não publicado ou não extraído", meta.slug);
  delete acc.pdfsEncontrados;
  delete acc.oficial;
  return acc;
}

function arquivoPdf(produto, label, url) {
  const base = produto.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const blob = `${label} ${url}`.toLowerCase();
  let kind = "PDF";
  if (/fds|fispq/.test(blob)) kind = "FISPQ";
  else if (/\bsds\b/.test(blob)) kind = "SDS";
  else if (/ficha/.test(blob) && /t[eé]cn/.test(blob)) kind = "Ficha";
  else if (/checklist|cheklist/.test(blob)) kind = "Checklist";
  else if (/certificado|anvisa/.test(blob)) kind = "Certificado";
  return `${base}_${kind}.pdf`;
}

async function download_fispq(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 1000) {
    console.log("PDF já existe", dest.split(/[/\\]/).pop());
    return { ok: true, skipped: true };
  }
  try {
    const res = await get(url);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 800) {
      console.warn("PDF pequeno demais, ignorado", url, buf.length);
      return { ok: false, skipped: false };
    }
    writeFileSync(dest, buf);
    console.log("Baixado", dest.split(/[/\\]/).pop(), buf.length, "bytes");
    return { ok: true, skipped: false };
  } catch (err) {
    console.warn("Falha PDF", url, err.message);
    return { ok: false, skipped: false };
  }
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
  const col = (i) => {
    let n = i;
    let s = "";
    do {
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
  };
  const sheetRows = [
    `<row r="1">${headers.map((h, i) => `<c r="${col(i)}1" t="inlineStr"><is><t>${xmlEsc(h)}</t></is></c>`).join("")}</row>`,
    ...rows.map((row, ri) => {
      const r = ri + 2;
      return `<row r="${r}">${headers
        .map((h, i) => `<c r="${col(i)}${r}" t="inlineStr"><is><t>${xmlEsc(row[h])}</t></is></c>`)
        .join("")}</row>`;
    }),
  ].join("");
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Easytech estofados" sheetId="1" r:id="rId1"/></sheets></workbook>`;
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

function save_data(produtos) {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "easytech_estofados.json"), JSON.stringify(produtos, null, 2), "utf8");
  const csv = [
    CAMPOS.join(";"),
    ...produtos.map((p) => CAMPOS.map((k) => `"${String(p[k] ?? "").replace(/"/g, '""')}"`).join(";")),
  ].join("\n");
  writeFileSync(join(OUT, "easytech_estofados.csv"), `\uFEFF${csv}`, "utf8");
  writeXlsx(join(OUT, "easytech_estofados.xlsx"), produtos);
  console.log("salvo", join(OUT, "easytech_estofados.json"));
  console.log("xlsx", join(OUT, "easytech_estofados.xlsx"));
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(FISPQ_DIR, { recursive: true });
  const coletados = [];
  let pdfsBaixados = 0;
  for (let i = 0; i < PRODUTOS.length; i++) {
    const meta = PRODUTOS[i];
    console.log(`[${i + 1}/${PRODUTOS.length}]`, meta.nome);
    const item = await get_product_data(meta);
    coletados.push(item);
    const lista = [];
    if (item.fdsPdf) lista.push([item.nome, "FISPQ", item.fdsPdf]);
    if (item.sdsPdf) lista.push([item.nome, "SDS", item.sdsPdf]);
    if (item.fichaPdf) lista.push([item.nome, "Ficha", item.fichaPdf]);
    for (const d of item.documentos || []) lista.push([item.nome, d.label, d.url]);
    for (const [nome, label, url] of lista) {
      const r = await download_fispq(url, join(FISPQ_DIR, arquivoPdf(nome, label, url)));
      if (r.ok && !r.skipped) pdfsBaixados += 1;
      if (r.ok && !r.skipped) await polite();
    }
  }
  save_data(coletados);
  const fispqCount = coletados.filter((p) => p.fdsPdf).length;
  console.log("\n=== Resumo Easytech estofados ===");
  console.log(coletados.length, "produtos");
  console.log(fispqCount, "FISPQs/FDS com URL pública");
  console.log(pdfsBaixados, "PDFs baixados nesta execução");
  for (const p of coletados) {
    console.log(
      "-",
      p.nome,
      "| pH:",
      p.ph || "(não publicado)",
      "| diluição:",
      (p.diluicao || "(não publicada)").slice(0, 70),
      "| FISPQ:",
      p.fdsPdf ? "sim" : "não",
    );
  }
  if (bloqueios.length) {
    console.log("\nFontes com falha/bloqueio:");
    for (const b of bloqueios.slice(0, 30)) console.log(" ", b.status, b.url);
  }
}

await main();
