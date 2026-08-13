import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { produtos } from "@/data/produtos";
import { Aviso, Breadcrumbs, Chip, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/produtos/comparar")({
  head: () => ({
    meta: [
      { title: "Comparador de produtos — Guia do Higienizador" },
      {
        name: "description",
        content: "Compare até três categorias de produto: função, pH, diluição, superfícies e riscos. Sem eleger o melhor.",
      },
      { property: "og:title", content: "Comparador de produtos" },
      { property: "og:url", content: "/produtos/comparar" },
    ],
    links: [{ rel: "canonical", href: "/produtos/comparar" }],
  }),
  component: Comparar,
});

const linhas = [
  { label: "Categoria", get: (p: (typeof produtos)[number]) => p.categoria },
  { label: "Função", get: (p: (typeof produtos)[number]) => p.funcao },
  { label: "pH", get: (p: (typeof produtos)[number]) => p.ph },
  { label: "Diluição", get: (p: (typeof produtos)[number]) => p.diluicao },
  { label: "Tempo de ação", get: (p: (typeof produtos)[number]) => p.tempoAcao },
  { label: "Enxágue", get: (p: (typeof produtos)[number]) => p.enxague },
  { label: "Onde usar", get: (p: (typeof produtos)[number]) => p.ondeUsar.join("; ") },
  { label: "Onde evitar", get: (p: (typeof produtos)[number]) => p.ondeEvitar.join("; ") },
];

function Comparar() {
  const [sel, setSel] = useState<string[]>(produtos.slice(0, 2).map((p) => p.slug));

  function alternar(slug: string) {
    setSel((atual) =>
      atual.includes(slug) ? atual.filter((s) => s !== slug) : atual.length >= 3 ? atual : [...atual, slug],
    );
  }

  const escolhidos = produtos.filter((p) => sel.includes(p.slug));

  return (
    <div className="pb-4">
      <Breadcrumbs
        trilha={[{ label: "Início", to: "/" }, { label: "Produtos", to: "/produtos" }, { label: "Comparar" }]}
      />
      <PageHeader
        titulo="Comparar produtos"
        eyebrow="Química por função"
        descricao="Selecione até 3 categorias. A comparação é descritiva — nenhuma é apresentada como superior. Confirme no fabricante."
      />
      <Section titulo="Selecione">
        <div className="flex flex-wrap gap-2">
          {produtos.map((p) => (
            <button key={p.slug} type="button" onClick={() => alternar(p.slug)} className="min-h-9">
              <Chip tone={sel.includes(p.slug) ? "ok" : "default"}>{p.nome}</Chip>
            </button>
          ))}
        </div>
      </Section>
      {escolhidos.length === 0 ? (
        <Section>
          <Aviso titulo="Nenhum produto selecionado">Toque em pelo menos uma categoria acima.</Aviso>
        </Section>
      ) : (
        <Section titulo="Comparação">
          <div className="-mx-4 overflow-x-auto px-4">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="w-28 py-2 pr-3 align-bottom text-xs font-semibold text-muted-foreground">Critério</th>
                  {escolhidos.map((p) => (
                    <th key={p.slug} className="py-2 pr-3 align-bottom text-sm font-bold">
                      <Link to="/produtos/$slug" params={{ slug: p.slug }} className="underline-offset-4 hover:underline">
                        {p.nome}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.label} className="border-t border-border align-top">
                    <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                      {l.label}
                    </th>
                    {escolhidos.map((p) => (
                      <td key={p.slug} className="py-3 pr-3 leading-relaxed text-muted-foreground">
                        {l.get(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
      <Section>
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Estas são categorias de química, não SKUs de marca. Para fichas oficiais, abra as fichas de fabricantes.
          </p>
        </InfoCard>
      </Section>
    </div>
  );
}
