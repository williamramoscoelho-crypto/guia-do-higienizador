import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { categoriasProdutos, produtos } from "@/data/produtos";
import { Breadcrumbs, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/produtos/")({
  head: () => ({
    meta: [
      { title: "Produtos e química — Guia do Higienizador" },
      {
        name: "description",
        content: "Detergentes, alcalinos, enzimáticos, desinfetantes e impermeabilizantes: função, pH, riscos e compatibilidade.",
      },
      { property: "og:title", content: "Produtos e química para higienização de estofados" },
      { property: "og:url", content: "/produtos" },
    ],
    links: [{ rel: "canonical", href: "/produtos" }],
  }),
  component: Lista,
});

function Lista() {
  const [q, setQ] = useState("");
  const filtrados = useMemo(
    () =>
      produtos.filter((p) =>
        `${p.nome} ${p.funcao} ${p.categoria}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Produtos" }]} />
      <PageHeader
        titulo="Produtos e química"
        eyebrow="Consulta técnica"
        descricao="Organize a escolha pela função. Diluição, tempo de ação e concentração vêm sempre da ficha do fabricante."
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filtrar produto…"
        className="mt-4 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />
      {categoriasProdutos.map((cat) => {
        const itens = filtrados.filter((p) => p.categoria === cat);
        if (itens.length === 0) return null;
        return (
          <Section key={cat} titulo={cat}>
            <ul className="grid gap-2">
              {itens.map((p) => (
                <li key={p.slug}>
                  <ItemLink to="/produtos/$slug" params={{ slug: p.slug }} titulo={p.nome} descricao={p.funcao} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </div>
  );
}
