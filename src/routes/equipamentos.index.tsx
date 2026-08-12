import { createFileRoute } from "@tanstack/react-router";
import { equipamentos } from "@/data/equipamentos";
import { Breadcrumbs, CatalogList, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/equipamentos/")({
  head: () => ({
    meta: [
      { title: "Equipamentos de higienização — Guia do Higienizador" },
      {
        name: "description",
        content: "Aspirador, extratora, escovas, pulverizadores e EPIs: quando usar, cuidados e erros comuns.",
      },
      { property: "og:title", content: "Equipamentos para higienização de estofados" },
      { property: "og:url", content: "/equipamentos" },
    ],
    links: [{ rel: "canonical", href: "/equipamentos" }],
  }),
  component: Lista,
});

function Lista() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Equipamentos" }]} />
      <PageHeader
        titulo="Equipamentos"
        eyebrow="Ferramentas de campo"
        descricao="O equipamento certo reduz risco. O uso errado do equipamento certo ainda danifica o estofado."
      />
      <CatalogList
        placeholder="Filtrar equipamento…"
        itens={equipamentos.map((e) => ({
          key: e.slug,
          to: "/equipamentos/$slug",
          params: { slug: e.slug },
          emoji: e.emoji,
          titulo: e.nome,
          descricao: e.funcao,
        }))}
      />
    </div>
  );
}
