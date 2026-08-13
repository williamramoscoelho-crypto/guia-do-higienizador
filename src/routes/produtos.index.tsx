import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { produtos, categoriasProdutos } from "@/data/produtos";
import { Breadcrumbs, Chip, ItemLink, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/produtos/")({
  head: () => ({
    meta: [
      { title: "Produtos e química para higienização — Guia do Higienizador" },
      { name: "description", content: "Detergentes, enzimáticos, desengraxantes e neutralizadores: função, pH, diluição, riscos e compatibilidade com cada tecido." },
      { property: "og:title", content: "Produtos e química para higienização" },
      { property: "og:description", content: "Entenda função, pH e riscos de cada categoria de produto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/produtos" },
    ],
    links: [{ rel: "canonical", href: "/produtos" }],
  }),
  component: Lista,
});

function Lista() {
  const [cat, setCat] = useState<string | null>(null);
  const filtrados = cat ? produtos.filter((p) => p.categoria === cat) : produtos;

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Produtos" }]} />
      <PageHeader
        titulo="Produtos e química"
        eyebrow="Guia técnico"
        descricao="Nenhum produto é universal. Sempre confirme a indicação do fabricante e teste antes."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCat(null)} className="min-h-9">
          <Chip tone={cat === null ? "ok" : "default"}>Todos</Chip>
        </button>
        {categoriasProdutos.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className="min-h-9">
            <Chip tone={cat === c ? "ok" : "default"}>{c}</Chip>
          </button>
        ))}
      </div>
      <ul className="mt-4 grid gap-2">
        {filtrados.map((p) => (
          <li key={p.slug}>
            <ItemLink to="/produtos/$slug" params={{ slug: p.slug }} emoji="🧪" titulo={p.nome} descricao={p.funcao} />
          </li>
        ))}
      </ul>
    </div>
  );
}
