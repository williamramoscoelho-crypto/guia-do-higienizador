import { createFileRoute } from "@tanstack/react-router";
import { estofados } from "@/data/estofados";
import { Breadcrumbs, ItemLink, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/estofados/")({
  head: () => ({
    meta: [
      { title: "Tipos de estofados — Guia do Higienizador" },
      { name: "description", content: "Sofás, colchões, poltronas, cadeiras e bancos automotivos: estrutura, inspeção, higienização e secagem de cada tipo." },
      { property: "og:title", content: "Tipos de estofados" },
      { property: "og:description", content: "Como inspecionar e higienizar cada tipo de estofado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
        descricao="Cada peça tem estrutura, espuma e limites de umidade diferentes."
      />
      <ul className="mt-4 grid gap-2">
        {estofados.map((e) => (
          <li key={e.slug}>
            <ItemLink to="/estofados/$slug" params={{ slug: e.slug }} emoji={e.emoji} titulo={e.nome} descricao={e.estrutura} />
          </li>
        ))}
      </ul>
    </div>
  );
}
