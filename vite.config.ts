import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { equipamentos } from "./src/data/equipamentos.ts";
import { estofados } from "./src/data/estofados.ts";
import { manchas } from "./src/data/manchas.ts";
import { marcas } from "./src/data/marcas.ts";
import { produtos } from "./src/data/produtos.ts";
import { tecidos } from "./src/data/tecidos.ts";
import { fichasFabricantes } from "./src/data/fichas-fabricantes.ts";

const cpanel = process.env.CPANEL_BUILD === "1";

const pages = [
  "/",
  "/buscar",
  "/guia",
  "/tecidos",
  "/produtos",
  "/manchas",
  "/estofados",
  "/equipamentos",
  "/cuidados",
  "/fluxo",
  "/ph",
  "/glossario",
  "/checklist",
  "/identificar",
  "/ferramentas",
  "/ferramentas/diluicao",
  "/ferramentas/precificacao",
  "/automotiva",
  "/onde-comprar",
  "/aprender",
  "/parceria",
  "/favoritos",
  "/sobre",
  "/transparencia",
  "/fichas",
  "/onde-comprar/comparar",
  "/comecar",
  "/comunidade",
  "/produtos/comparar",
  "/perguntas",
  "/grupos",
  "/profissionais",
  "/codigo-da-comunidade",
  "/auth",
  ...tecidos.map((t) => `/tecidos/${t.slug}`),
  ...produtos.map((p) => `/produtos/${p.slug}`),
  ...manchas.map((m) => `/manchas/${m.slug}`),
  ...estofados.map((e) => `/estofados/${e.slug}`),
  ...equipamentos.map((e) => `/equipamentos/${e.slug}`),
  ...marcas.map((m) => `/onde-comprar/${m.slug}`),
  ...fichasFabricantes.map((f) => `/fichas/${f.slug}`),
].map((path) => ({ path }));

export default defineConfig({
  nitro: cpanel ? false : undefined,
  tanstackStart: {
    server: { entry: "server" },
    ...(cpanel
      ? {
          prerender: {
            enabled: true,
            crawlLinks: true,
            autoStaticPathsDiscovery: true,
            autoSubfolderIndex: true,
            failOnError: false,
          },
          pages,
        }
      : {}),
  },
});
