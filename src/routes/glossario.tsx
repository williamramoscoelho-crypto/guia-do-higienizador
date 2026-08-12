import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { glossario } from "@/data/glossario";
import { Breadcrumbs, InfoCard, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/glossario")({
  head: () => ({
    meta: [
      { title: "Glossário profissional — Guia do Higienizador" },
      {
        name: "description",
        content: "pH, extração, migração de cor, encapsulamento e outros termos técnicos em linguagem simples.",
      },
      { property: "og:title", content: "Glossário de higienização de estofados" },
      { property: "og:url", content: "/glossario" },
    ],
    links: [{ rel: "canonical", href: "/glossario" }],
  }),
  component: Glossario,
});

function Glossario() {
  const [q, setQ] = useState("");
  const itens = useMemo(
    () =>
      glossario.filter((g) => `${g.termo} ${g.definicao}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Glossário" }]} />
      <PageHeader
        titulo="Glossário profissional"
        eyebrow="Linguagem de campo"
        descricao="Termos técnicos explicados de forma direta, para usar durante o atendimento."
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar termo…"
        className="mt-4 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />
      <ul className="mt-4 grid gap-3">
        {itens.map((g) => (
          <li key={g.termo} id={g.termo.toLowerCase().replace(/\s+/g, "-")}>
            <InfoCard>
              <h2 className="text-sm font-bold">{g.termo}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.definicao}</p>
            </InfoCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
