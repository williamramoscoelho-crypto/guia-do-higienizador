import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { categoriasManchas, manchas } from "@/data/manchas";
import { resumoProdutoLista } from "@/data/manchas-produtos";
import { Breadcrumbs, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/manchas/")({
  head: () => ({
    meta: [
      { title: "Tipos de manchas — Guia do Higienizador" },
      {
        name: "description",
        content: "Café, urina, gordura, sangue e mais: procedimento sugerido, o que não fazer e limitações reais.",
      },
      { property: "og:title", content: "Guia de manchas em estofados" },
      { property: "og:url", content: "/manchas" },
    ],
    links: [{ rel: "canonical", href: "/manchas" }],
  }),
  component: Lista,
});

function Lista() {
  const [q, setQ] = useState("");
  const filtrados = useMemo(
    () =>
      manchas.filter((m) =>
        `${m.nome} ${m.categoria} ${m.caracteristica}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Manchas" }]} />
      <PageHeader
        titulo="Tipos de manchas"
        eyebrow="Consulta rápida"
        descricao="Cada tipo aponta um produto da lista de fabricantes, segundo a ficha e o tecido. Nenhuma mancha tem garantia de 100% de remoção."
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filtrar mancha…"
        className="mt-4 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />
      {categoriasManchas.map((cat) => {
        const itens = filtrados.filter((m) => m.categoria === cat);
        if (itens.length === 0) return null;
        return (
          <Section key={cat} titulo={cat}>
            <ul className="grid gap-2">
              {itens.map((m) => (
                <li key={m.slug}>
                  <ItemLink
                    to="/manchas/$slug"
                    params={{ slug: m.slug }}
                    emoji={m.emoji}
                    titulo={m.nome}
                    descricao={`${m.dificuldade} · ${resumoProdutoLista(m.slug) ?? "Consulte o fabricante"} — ${m.caracteristica}`}
                  />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </div>
  );
}
