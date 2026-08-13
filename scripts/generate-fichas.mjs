import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = JSON.parse(readFileSync(join(root, "src", "data", "fichas-fabricantes.raw.json"), "utf8"));

const NOMES = {
  "master-dry": "Master Dry",
  impernano: "Impernano",
  "aquo-alcalino": "Aquo Alcalino",
  "aquo-neutro": "Aquo Neutro",
  "nura-pronto-uso": "Nura Pronto Uso",
  "new-ar": "New Ar",
  "bio-w-limpeza-a-seco-concentrado": "Bio W Limpeza a Seco",
};

function clean(s, max = 360) {
  if (!s) return "";
  let t = String(s)
    .replace(/-->/g, " ")
    .replace(/&times;/g, "×")
    .replace(/\s+/g, " ")
    .trim();
  t = t.replace(
    /\s*(FDS SDS|CHECKLIST DE INSPEÇÃO.*|CERTIFICADO DE GARANTIA.*|COMPARE.*|PERGUNTAS FREQUENTES.*|Quero Comprar.*|Baixar FDS.*|Produtos relacionados.*|Inicio Sobre Cursos.*|Revenda Easytech.*|Peso \d+.*|Easy F.*|FALE COM.*|SAC\/RELACIONAMENTO.*).*$/i,
    "",
  );
  t = t.replace(/\s*FICHA TÉCNICA.*$/i, "").trim();
  if (/CERAS E SELANTES|Selecione um Produto|Carregando/i.test(t)) return "";
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(" | "));
  return (last > 60 ? cut.slice(0, last + 1) : `${cut.trim()}…`).trim();
}

function titulo(row) {
  const mapped = NOMES[row.nome];
  if (mapped) return mapped;
  return row.nome.replace(/\s+[–-].{40,}$/, "").trim();
}

const linhas = raw.map((row) => ({
  slug: row.slug,
  marca: row.marca,
  nome: titulo(row),
  url: row.url,
  resumo: clean(row.resumo, 280),
  diluicao: clean(row.diluicao, 280),
  ph: clean(row.ph, 120),
  usoRecomendado: clean(row.usoRecomendado, 220),
  naoRecomendado: clean(row.naoRecomendado, 220),
  composicao: clean(row.composicao, 220),
  modoDeUsar: clean(row.modoDeUsar, 320),
  embalagens: clean(row.embalagens, 80),
  fichaPdf: row.fichaPdf || "",
  fdsPdf: row.fdsPdf || "",
  coletadoEm: row.coletadoEm,
}));

const ts = `export type FichaFabricante = {
  slug: string;
  marca: string;
  nome: string;
  url: string;
  resumo: string;
  diluicao: string;
  ph: string;
  usoRecomendado: string;
  naoRecomendado: string;
  composicao: string;
  modoDeUsar: string;
  embalagens: string;
  fichaPdf: string;
  fdsPdf: string;
  coletadoEm: string;
};

/** Catálogo extraído de páginas oficiais. Confirme sempre no fabricante — fichas mudam. */
export const fichasFabricantes: FichaFabricante[] = ${JSON.stringify(linhas, null, 2)};

export const marcasFichas = [
  { slug: "vonixx", nome: "Vonixx", site: "https://www.vonixx.com.br/produtos/" },
  { slug: "vintex", nome: "Vintex", site: "https://vintex.com.br/produtos/" },
  { slug: "protelim", nome: "Protelim", site: "https://protelim.com.br/produtos/" },
  { slug: "easytech", nome: "Easytech", site: "https://www.easytechshield.com.br/loja/" },
  { slug: "alcance", nome: "Alcance", site: "https://alcanceprofissional.com.br/produtos" },
  { slug: "finisher", nome: "Finisher", site: "https://finisher.com.br/" },
  { slug: "spartan", nome: "Spartan", site: "https://www.spartanbrasil.com.br/produtos.html" },
] as const;

export const getFicha = (slug: string) => fichasFabricantes.find((f) => f.slug === slug);

export const fichasPorMarca = (marca: string) => fichasFabricantes.filter((f) => f.marca === marca);
`;

writeFileSync(join(root, "src", "data", "fichas-fabricantes.ts"), ts, "utf8");
console.log(`${linhas.length} fichas geradas em src/data/fichas-fabricantes.ts`);
