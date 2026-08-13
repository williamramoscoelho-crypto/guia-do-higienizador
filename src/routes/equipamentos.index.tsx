import { createFileRoute } from "@tanstack/react-router";
import { equipamentos } from "@/data/equipamentos";
import { Breadcrumbs, ItemLink, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/equipamentos/")({
  head: () => ({
    meta: [
      { title: "Equipamentos de higienização — Guia do Higienizador" },
      { name: "description", content: "Extratora, aspirador, soprador, escovas e pulverizadores: função, uso correto, manutenção e erros comuns." },
      { property: "og:title", content: "Equipamentos de higienização" },
      { property: "og:description", content: "Uso correto, manutenção e erros comuns de cada equipamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
      <PageHeader titulo="Equipamentos" eyebrow="Guia técnico" descricao="Equipamento bem usado e bem mantido é metade do resultado." />
      <ul className="mt-4 grid gap-2">
        {equipamentos.map((e) => (
          <li key={e.slug}>
            <ItemLink to="/equipamentos/$slug" params={{ slug: e.slug }} emoji={e.emoji} titulo={e.nome} descricao={e.funcao} />
          </li>
        ))}
      </ul>
    </div>
  );
}
