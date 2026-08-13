import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { glossario } from "@/data/glossario";
import { Breadcrumbs, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/glossario")({
  head: () => ({
    meta: [
      { title: "Glossário profissional de higienização — Guia do Higienizador" },
      { name: "description", content: "Termos técnicos da higienização de estofados explicados em linguagem simples: pH, tensoativo, extração, wicking, encardido e mais." },
      { property: "og:title", content: "Glossário profissional de higienização" },
      { property: "og:description", content: "Termos técnicos em linguagem simples." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/glossario" },
    ],
    links: [{ rel: "canonical", href: "/glossario" }],
  }),
  component: Glossario,
});

function Glossario() {
  const [q, setQ] = useState("");
  const filtrados = glossario.filter((t) =>
    `${t.termo} ${t.definicao}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Glossário" }]} />
      <PageHeader titulo="📖 Glossário" eyebrow="Referência" descricao="Entenda o vocabulário técnico do setor." />
      <div className="mt-4">
        <label htmlFor="filtro-termo" className="sr-only">
          Filtrar termos
        </label>
        <input
          id="filtro-termo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar termo…"
          className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
        />
      </div>
      <dl className="mt-4 grid gap-2">
        {filtrados.map((t) => (
          <div key={t.termo} className="rounded-2xl border border-border bg-card p-4">
            <dt className="text-sm font-bold">{t.termo}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.definicao}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
