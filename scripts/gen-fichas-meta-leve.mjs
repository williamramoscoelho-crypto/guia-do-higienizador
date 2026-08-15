import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src/data/fichas-fabricantes.ts"), "utf8");

const marcasMatch = src.match(/export const marcasFichas = \[[\s\S]*?\] as const;/);
if (!marcasMatch) throw new Error("marcasFichas not found");

const arrayMatch = src.match(/export const fichasFabricantes: FichaFabricante\[\] = (\[[\s\S]*?\n\]);/);
if (!arrayMatch) throw new Error("fichasFabricantes array not found");

/** @type {{ slug: string; marca: string; nome: string; resumo: string }[]} */
const full = Function(`"use strict"; return (${arrayMatch[1]});`)();
const light = full.map((f) => ({
  slug: f.slug,
  marca: f.marca,
  nome: f.nome,
  resumo: String(f.resumo ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120),
}));

if (light.length < 10) throw new Error(`Poucas fichas no índice leve: ${light.length}`);

const marcas = marcasMatch[0].replace("export const marcasFichas", "export const marcasFichasLeves");
const out =
  "/** Índice leve de fichas para busca — sem diluição/FISPQ/texto longo.\n" +
  " * Gerado por scripts/gen-fichas-meta-leve.mjs — rode após alterar fichas-fabricantes.ts.\n" +
  " */\n" +
  marcas +
  "\n\n" +
  "export type FichaMetaLeve = { slug: string; marca: string; nome: string; resumo: string };\n\n" +
  "export const fichasMetaLeve: FichaMetaLeve[] = " +
  JSON.stringify(light, null, 2) +
  ";\n";

writeFileSync(join(root, "src/data/fichas-meta-leve.ts"), out);
console.log(`fichas-meta-leve.ts: ${light.length} itens`);
