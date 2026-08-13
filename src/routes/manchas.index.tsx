import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { manchas, categoriasManchas } from "@/data/manchas";
import { Breadcrumbs, Chip, ItemLink, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/manchas/")({
  head: () => ({
    meta: [
      { title: "Tipos de manchas em estofados — Guia do Higienizador" },
      { name: "description", content: "Gordura, café, sangue, urina, tinta e mais: procedimento correto, cuidados, produtos indicados e limitações reais de remoção." },
      { property: "og:title", content: "Tipos de manchas em estofados" },
      { property: "og:description", content: "Procedimento passo a passo por tipo de mancha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/manchas" },
    ],
    links: [{ rel: "canonical", href: "/manchas" }],
  }),
  component: Lista,
});

function Lista() {
  const [cat, setCat] = useState<string | null>(null);
  const filtradas = cat ? manchas.filter((m) => m.categoria === cat) : manchas;

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Manchas" }]} />
      <PageHeader
        titulo="Tipos de manchas"
        eyebrow="Guia técnico"
        descricao="Identifique a origem antes de escolher o produto. Mancha antiga nem sempre sai por completo."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCat(null)} className="min-h-9">
          <Chip tone={cat === null ? "ok" : "default"}>Todas</Chip>
        </button>
        {categoriasManchas.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className="min-h-9">
            <Chip tone={cat === c ? "ok" : "default"}>{c}</Chip>
          </button>
        ))}
      </div>
      <ul className="mt-4 grid gap-2">
        {filtradas.map((m) => (
          <li key={m.slug}>
            <ItemLink
              to="/manchas/$slug"
              params={{ slug: m.slug }}
              emoji={m.emoji}
              titulo={m.nome}
              descricao={`${m.dificuldade} · ${m.caracteristica}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
