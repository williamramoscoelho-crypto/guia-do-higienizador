import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { tecidos } from "@/data/tecidos";
import { Breadcrumbs, ItemLink, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/tecidos/")({
  head: () => ({
    meta: [
      { title: "Tipos de tecidos para estofados — Guia do Higienizador" },
      { name: "description", content: "Suede, veludo, chenille, linho, couro e mais: composição, características, riscos e método de limpeza indicado." },
      { property: "og:title", content: "Tipos de tecidos para estofados" },
      { property: "og:description", content: "Identifique o tecido e descubra o método de limpeza correto." },
      { property: "og:url", content: "/tecidos" },
    ],
    links: [{ rel: "canonical", href: "/tecidos" }],
  }),
  component: Lista,
});

function Lista() {
  const [q, setQ] = useState("");
  const filtrados = tecidos.filter((t) =>
    `${t.nome} ${t.nomesComerciais.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Tecidos" }]} />
      <PageHeader
        titulo="Tipos de tecidos"
        eyebrow="Guia técnico"
        descricao="Cada tecido tem limites diferentes de água, calor e química. Confirme sempre pela etiqueta."
      />
      <div className="mt-4">
        <label htmlFor="filtro-tecido" className="sr-only">
          Filtrar tecidos
        </label>
        <input
          id="filtro-tecido"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrar tecido…"
          className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
        />
      </div>
      <ul className="mt-4 grid gap-2">
        {filtrados.map((t) => (
          <li key={t.slug}>
            <ItemLink to="/tecidos/$slug" params={{ slug: t.slug }} emoji={t.emoji} titulo={t.nome} descricao={t.resumo} />
          </li>
        ))}
      </ul>
    </div>
  );
}
