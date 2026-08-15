import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { FichaFabricante } from "@/data/fichas-fabricantes";
import { Aviso, Breadcrumbs, ItemLink, PageHeader, Section } from "@/components/app/ui";

type MarcaFicha = { slug: string; nome: string; site: string };

export const Route = createFileRoute("/fichas/")({
  loader: async () => {
    const { fichasFabricantes, marcasFichas } = await import("@/data/fichas-fabricantes");
    return {
      fichasFabricantes,
      marcasFichas: [...marcasFichas] as MarcaFicha[],
    };
  },
  head: () => ({
    meta: [
      { title: "Fichas técnicas de fabricantes — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Consulta de produtos de higienização de estofados extraídos dos sites oficiais. Confirme diluição e FISPQ no fabricante.",
      },
      { property: "og:title", content: "Fichas técnicas de fabricantes" },
      { property: "og:url", content: "/fichas" },
    ],
    links: [{ rel: "canonical", href: "/fichas" }],
  }),
  component: Lista,
});

function Lista() {
  const { fichasFabricantes, marcasFichas } = Route.useLoaderData();
  const [marca, setMarca] = useState("todas");
  const [q, setQ] = useState("");
  const filtrados = useMemo(
    () =>
      fichasFabricantes.filter((f: FichaFabricante) => {
        if (marca !== "todas" && f.marca !== marca) return false;
        const blob = `${f.nome} ${f.resumo} ${f.marca}`.toLowerCase();
        return blob.includes(q.toLowerCase());
      }),
    [fichasFabricantes, marca, q],
  );

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Fichas técnicas" }]} />
      <PageHeader
        titulo="Fichas de fabricantes"
        eyebrow="Catálogo oficial"
        descricao="Produtos de higienização de estofados, interior e couro lidos nos sites oficiais. Não é ranking e não substitui o rótulo do lote."
      />
      <div className="-mx-1 mt-4 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="flex w-max min-w-full gap-2 px-1">
          <button
            type="button"
            onClick={() => setMarca("todas")}
            className={
              marca === "todas"
                ? "min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                : "min-h-11 shrink-0 rounded-full border border-border bg-card px-4 text-sm"
            }
          >
            Todas
          </button>
          {marcasFichas.map((m) => (
            <button
              key={m.slug}
              type="button"
              onClick={() => setMarca(m.slug)}
              className={
                marca === m.slug
                  ? "min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  : "min-h-11 shrink-0 rounded-full border border-border bg-card px-4 text-sm"
              }
            >
              {m.nome}
            </button>
          ))}
        </div>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filtrar produto…"
        className="mt-4 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />
      <Section titulo={`${filtrados.length} produtos`}>
        <ul className="grid gap-2">
          {filtrados.map((f) => (
            <li key={f.slug}>
              <ItemLink
                to="/fichas/$slug"
                params={{ slug: f.slug }}
                titulo={f.nome}
                descricao={`${marcasFichas.find((m) => m.slug === f.marca)?.nome ?? f.marca} — ${f.fdsPdf ? "FISPQ disponível" : "FISPQ: consulte o fabricante"} — ${f.resumo}`}
              />
            </li>
          ))}
        </ul>
      </Section>
      <Aviso titulo="Fonte e validade">
        Extraído de páginas públicas em {fichasFabricantes[0]?.coletadoEm}. Diluição, pH e modo de uso mudam de lote.
        Abra sempre o site oficial e a FISPQ antes de aplicar.
      </Aviso>
    </div>
  );
}
