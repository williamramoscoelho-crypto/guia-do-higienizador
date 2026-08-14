import type { FichaFabricante } from "@/data/fichas-fabricantes";

/**
 * Calculadora de diluição — só cita proporções publicadas na ficha.
 *
 * Como incluir uma proporção nova (não inventar):
 * 1. Extraia o texto do fabricante (rótulo, ficha técnica ou página oficial).
 * 2. Grave em `ficha.diluicao` (preferencial) ou `modoDeUsar` / `fichaTecnica`.
 * 3. Use a forma que o fabricante escreveu, em geral `1:10`, `1:30`, `1:60`.
 * 4. Não calcule pH, não “complete” leve/média/pesada se a ficha não citar,
 *    não converta “50 ml/L” em 1:N. Sem `1:N` (nem pronto uso), a UI recusa.
 * 5. Após o scrape (`scripts/generate-fichas.mjs` / merge-*), confira se o
 *    campo `diluicao` ainda contém a razão — o gerador não deve inventar números.
 *
 * Conta desta ferramenta (não mude sem revisar as fichas):
 * `1:N` = 1 parte de concentrado + N partes de água.
 * Volume final V → ml concentrado = V × 1 / (1+N).
 */

export type IntensidadeDiluicao = "leve" | "media" | "pesada";

export type ProporcaoPublicada = {
  /** Texto curto ao redor da razão, como o fabricante escreveu. */
  rotulo: string;
  /** Ex.: "1:20" ou "pronto uso". */
  razao: string;
  partesProduto: number;
  partesAgua: number;
  ate: boolean;
  intensidade?: IntensidadeDiluicao;
};

export type AnaliseDiluicao = {
  prontoUso: boolean;
  proporcoes: ProporcaoPublicada[];
  textoFonte: string;
};

const RAZAO_RE = /\b1\s*:\s*(\d{1,4})\b/gi;
const PURO_ROTULO_RE =
  /([^|:•;\n]{0,60}?)(?:pronto[\s-]?uso|\brtu\b|(?:usar|use|aplicar)\s+puro|:[\s]*puro\b)/gi;

export function fontesDiluicao(ficha: Pick<FichaFabricante, "diluicao" | "modoDeUsar" | "fichaTecnica">): string {
  return [ficha.diluicao, ficha.modoDeUsar, ficha.fichaTecnica ?? ""]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" \n ");
}

export function analisarDiluicao(ficha: Pick<FichaFabricante, "diluicao" | "modoDeUsar" | "fichaTecnica">): AnaliseDiluicao {
  const textoFonte = fontesDiluicao(ficha);
  const proporcoes = deduplicar([
    ...extrairRazoes(textoFonte),
    ...extrairProntoUsoRotulado(textoFonte),
  ]);
  const prontoUso =
    proporcoes.some((p) => p.partesAgua === 0) ||
    (proporcoes.length === 0 && ehProntoUsoGeral(textoFonte));
  return { prontoUso, proporcoes, textoFonte };
}

export function temProporcaoCalculavel(analise: AnaliseDiluicao): boolean {
  return analise.proporcoes.length > 0 || analise.prontoUso;
}

/** 1:N = 1 parte de produto + N partes de água. Volume = solução final (ml). */
export function calcularSolucao(
  volumeMl: number,
  partesProduto: number,
  partesAgua: number,
): { mlProduto: number; mlAgua: number } | null {
  if (![volumeMl, partesProduto].every((n) => Number.isFinite(n) && n > 0)) return null;
  if (!Number.isFinite(partesAgua) || partesAgua < 0) return null;
  const partes = partesProduto + partesAgua;
  if (!(partes > 0)) return null;
  const mlProduto = (volumeMl * partesProduto) / partes;
  const mlAgua = volumeMl - mlProduto;
  return { mlProduto, mlAgua };
}

export function parseEmbalagensMl(texto: string): number[] {
  const out: number[] = [];
  const re = /(\d+(?:[.,]\d+)?)\s*(ml|l)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const bruto = (m[1] ?? "").replace(",", ".");
    const n = Number(bruto);
    const unidade = (m[2] ?? "").toLowerCase();
    if (!Number.isFinite(n) || n <= 0) continue;
    const ml = unidade === "l" ? n * 1000 : n;
    if (ml < 20 || ml > 50_000) continue;
    if (!out.includes(ml)) out.push(ml);
  }
  return out;
}

export function chaveProporcao(p: Pick<ProporcaoPublicada, "razao" | "rotulo">): string {
  return `${p.razao}||${p.rotulo}`;
}

export function escolherProporcao(
  analise: AnaliseDiluicao,
  intensidade: IntensidadeDiluicao | "",
  razaoEscolhida: string,
): ProporcaoPublicada | null {
  const lista = analise.proporcoes.length
    ? analise.proporcoes
    : analise.prontoUso
      ? [proporcaoProntoUso("Pronto uso (ficha)")]
      : [];
  if (lista.length === 0) return null;

  const porChave = razaoEscolhida
    ? lista.find((p) => chaveProporcao(p) === razaoEscolhida || p.razao === razaoEscolhida)
    : undefined;
  if (porChave) return porChave;

  if (intensidade) {
    const daIntensidade = lista.filter((p) => p.intensidade === intensidade);
    if (daIntensidade[0]) return daIntensidade[0];
    return null;
  }

  if (lista.length === 1) return lista[0] ?? null;
  return null;
}

export function intensidadesPublicadas(analise: AnaliseDiluicao): IntensidadeDiluicao[] {
  const set = new Set<IntensidadeDiluicao>();
  for (const p of analise.proporcoes) {
    if (p.intensidade) set.add(p.intensidade);
  }
  return (["leve", "media", "pesada"] as const).filter((i) => set.has(i));
}

export function formatarMl(n: number): string {
  const casas = Math.abs(n - Math.round(n)) < 0.05 ? 0 : 1;
  return `${n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: 1 })} ml`;
}

export function formatarLitros(n: number): string {
  return `${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} L`;
}

function extrairRazoes(texto: string): ProporcaoPublicada[] {
  const out: ProporcaoPublicada[] = [];
  RAZAO_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RAZAO_RE.exec(texto))) {
    const n = Number(m[1]);
    if (!Number.isInteger(n) || n < 1 || n > 2000) continue;
    const idx = m.index;
    const antes = janela(texto, Math.max(0, idx - 90), idx);
    const depois = depoisImediato(texto, idx + m[0].length);
    const contexto = contextoLocal(antes, depois);
    const ate = /\bat[eé]\b/i.test(antes.slice(-25));
    const intensidade = classificarIntensidade(contexto);
    const rotulo = montarRotulo(antes, n, ate, intensidade);
    const item: ProporcaoPublicada = {
      rotulo,
      razao: `1:${n}`,
      partesProduto: 1,
      partesAgua: n,
      ate,
    };
    if (intensidade) item.intensidade = intensidade;
    out.push(item);
  }
  return out;
}

function extrairProntoUsoRotulado(texto: string): ProporcaoPublicada[] {
  if (!ehProntoUsoGeral(texto) && !/(?:usar|use|aplicar)\s+puro|:[\s]*puro\b/i.test(texto)) return [];
  const out: ProporcaoPublicada[] = [];
  PURO_ROTULO_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PURO_ROTULO_RE.exec(texto))) {
    const contexto = (m[1] ?? m[0] ?? "").replace(/\s+/g, " ").trim();
    const intensidade = classificarIntensidade(`${contexto} ${m[0]}`);
    const item = proporcaoProntoUso(montarRotuloPuro(contexto));
    if (intensidade) item.intensidade = intensidade;
    out.push(item);
  }
  return out;
}

function ehProntoUsoGeral(texto: string): boolean {
  return /pronto[\s-]?uso|\brtu\b|usar puro|use puro|(?:aplicar|aplicação)\s+puro/i.test(texto);
}

function proporcaoProntoUso(rotulo: string): ProporcaoPublicada {
  return {
    rotulo,
    razao: "pronto uso",
    partesProduto: 1,
    partesAgua: 0,
    ate: false,
  };
}

function classificarIntensidade(contexto: string): IntensidadeDiluicao | undefined {
  const t = contexto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  const hits: { i: IntensidadeDiluicao; idx: number }[] = [];
  const regras: [IntensidadeDiluicao, RegExp][] = [
    ["pesada", /alta intensidade|sujeira pesad|sujidade pesad|limpeza (muito )?pesad|muito pesad/g],
    ["media", /media intensidade|sujeira media|sujidade media|limpeza media/g],
    ["leve", /sujeira leve|limpeza leve|baixa intensidade|higienizacao leve/g],
  ];
  for (const [i, re] of regras) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t))) hits.push({ i, idx: m.index });
  }
  if (hits.length === 0) return undefined;
  hits.sort((a, b) => a.idx - b.idx);
  return hits[hits.length - 1]?.i;
}

function montarRotulo(
  antes: string,
  n: number,
  ate: boolean,
  intensidade: IntensidadeDiluicao | undefined,
): string {
  const trecho = ultimoTrecho(antes);
  if (trecho.length >= 3 && trecho.length <= 70) {
    const razao = ate ? `até 1:${n}` : `1:${n}`;
    if (trecho.includes(`1:${n}`) || /1\s*:\s*\d+$/.test(trecho)) return trecho;
    return `${trecho} ${razao}`.replace(/\s+/g, " ").trim();
  }
  if (intensidade) {
    const nome = intensidade === "media" ? "média" : intensidade;
    return `${ate ? "até " : ""}1:${n} (${nome})`;
  }
  return ate ? `até 1:${n}` : `1:${n}`;
}

function montarRotuloPuro(contexto: string): string {
  const trecho = ultimoTrecho(contexto);
  if (trecho.length >= 3 && trecho.length <= 70) return `${trecho} pronto uso`.replace(/\s+/g, " ").trim();
  return "Pronto uso (ficha)";
}

function ultimoTrecho(antes: string): string {
  const chunk = antes.replace(/\s+/g, " ").trim();
  const partes = chunk.split(/[•|;]/);
  return (partes[partes.length - 1] ?? chunk)
    .replace(/^[\s\-–—:,.]+/, "")
    .replace(/[\s\-–—:,]+$/, "")
    .trim();
}

function contextoLocal(antes: string, depois: string): string {
  const cauda = antes.slice(-80).replace(/\b1\s*:\s*\d+\b/g, " | ");
  const partes = cauda.split(/\s*[|•;]\s*/);
  const ultimo = (partes[partes.length - 1] ?? cauda).trim();
  return `${ultimo} ${depois}`.replace(/\s+/g, " ").trim();
}

function depoisImediato(texto: string, end: number): string {
  const slice = texto.slice(end, end + 45).trimStart();
  const paren = slice.match(/^\([^)]{0,40}\)/);
  return paren ? paren[0] : "";
}

function janela(texto: string, start: number, end: number): string {
  return texto.slice(start, end);
}

function deduplicar(itens: ProporcaoPublicada[]): ProporcaoPublicada[] {
  const seen = new Set<string>();
  const out: ProporcaoPublicada[] = [];
  for (const item of itens) {
    const key = `${item.razao}|${item.intensidade ?? ""}|${item.ate ? "ate" : ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
