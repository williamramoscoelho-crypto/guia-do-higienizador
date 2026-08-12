import { createFileRoute } from "@tanstack/react-router";
import { estofados } from "@/data/estofados";
import { Breadcrumbs, CatalogList, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/estofados/")({
  head: () => ({
    meta: [
      { title: "Tipos de estofados — Guia do Higienizador" },
      {
        name: "description",
        content: "Sofás, colchões, bancos automotivos e mais: estrutura, problemas, inspeção e higienização.",
      },
      { property: "og:title", content: "Tipos de estofados" },
      { property: "og:url", content: "/estofados" },
    ],
    links: [{ rel: "canonical", href: "/estofados" }],
  }),
  component: Lista,
});

function Lista() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Estofados" }]} />
      <PageHeader
        titulo="Tipos de estofados"
        eyebrow="Guia técnico"
        descricao="Cada peça tem estrutura, umidade e pontos de risco diferentes. A inspeção vem antes do produto."
      />
      <CatalogList
        placeholder="Filtrar estofado…"
        itens={estofados.map((e) => ({
          key: e.slug,
          to: "/estofados/$slug",
          params: { slug: e.slug },
          emoji: e.emoji,
          titulo: e.nome,
          descricao: e.estrutura,
        }))}
      />
    </div>
  );
}
