import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { marcas } from "@/data/marcas";
import { Aviso, Breadcrumbs, Chip, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/onde-comprar/comparar")({
  head: () => ({
    meta: [
      { title: "Comparador de marcas de produtos — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Compare marcas do setor lado a lado: categorias atendidas, público, linha profissional, linha de entrada e observações técnicas.",
      },
      { property: "og:title", content: "Comparador de marcas" },
      { property: "og:description", content: "Compare marcas lado a lado por critério técnico, sem ranking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/onde-comprar/comparar" },
    ],
    links: [{ rel: "canonical", href: "/onde-comprar/comparar" }],
  }),
  component: Comparar,
});

const linhas = [
  { label: "Tipo de produto", get: (m: (typeof marcas)[number]) => m.tipoProduto },
  { label: "Público", get: (m: (typeof marcas)[number]) => m.publico },
  { label: "Linha profissional", get: (m: (typeof marcas)[number]) => m.linhaProfissional },
  { label: "Linha de entrada", get: (m: (typeof marcas)[number]) => m.linhaEntrada },
  { label: "Distribuição", get: (m: (typeof marcas)[number]) => m.distribuidores },
  { label: "Treinamentos", get: (m: (typeof marcas)[number]) => m.treinamentos },
  { label: "Observações", get: (m: (typeof marcas)[number]) => m.observacoes },
];

function Comparar() {
  const [sel, setSel] = useState<string[]>(marcas.slice(0, 2).map((m) => m.slug));

  function alternar(slug: string) {
    setSel((atual) =>
      atual.includes(slug) ? atual.filter((s) => s !== slug) : atual.length >= 3 ? atual : [...atual, slug],
    );
  }

  const escolhidas = marcas.filter((m) => sel.includes(m.slug));

  return (
    <div className="pb-4">
      <Breadcrumbs
        trilha={[{ label: "Início", to: "/" }, { label: "Onde comprar", to: "/onde-comprar" }, { label: "Comparar" }]}
      />
      <PageHeader
        titulo="Comparador de marcas"
        eyebrow="Onde comprar"
        descricao="Selecione até 3 marcas para comparar. A comparação é descritiva — não existe ranking."
      />

      <Section titulo="Selecione as marcas">
        <div className="flex flex-wrap gap-2">
          {marcas.map((m) => (
            <button key={m.slug} type="button" onClick={() => alternar(m.slug)} className="min-h-11">
              <Chip tone={sel.includes(m.slug) ? "ok" : "default"}>{m.nome}</Chip>
            </button>
          ))}
        </div>
      </Section>

      {escolhidas.length === 0 ? (
        <Section>
          <Aviso titulo="Nenhuma marca selecionada">Toque em pelo menos uma marca acima para ver a comparação.</Aviso>
        </Section>
      ) : (
        <Section titulo="Comparação">
          <div className="grid gap-3 md:hidden">
            {escolhidas.map((m) => (
              <InfoCard key={m.slug}>
                <Link
                  to="/onde-comprar/$slug"
                  params={{ slug: m.slug }}
                  className="text-sm font-bold underline-offset-4 hover:underline"
                >
                  {m.nome}
                </Link>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.categorias.map((c) => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </div>
                <dl className="mt-3 space-y-2">
                  {linhas.map((l) => (
                    <div key={l.label}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{l.label}</dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{l.get(m)}</dd>
                    </div>
                  ))}
                </dl>
              </InfoCard>
            ))}
          </div>
          <div className="-mx-4 hidden overflow-x-auto px-4 md:block">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="w-28 py-2 pr-3 align-bottom text-xs font-semibold text-muted-foreground">Critério</th>
                  {escolhidas.map((m) => (
                    <th key={m.slug} className="py-2 pr-3 align-bottom text-sm font-bold">
                      <Link to="/onde-comprar/$slug" params={{ slug: m.slug }} className="underline-offset-4 hover:underline">
                        {m.nome}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border align-top">
                  <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                    Categorias
                  </th>
                  {escolhidas.map((m) => (
                    <td key={m.slug} className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1.5">
                        {m.categorias.map((c) => (
                          <Chip key={c}>{c}</Chip>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                {linhas.map((l) => (
                  <tr key={l.label} className="border-t border-border align-top">
                    <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                      {l.label}
                    </th>
                    {escolhidas.map((m) => (
                      <td key={m.slug} className="py-3 pr-3 leading-relaxed text-muted-foreground">
                        {l.get(m)}
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
            Nenhuma marca é apresentada como superior. Confirme ficha técnica, rendimento e suporte no canal oficial do
            fabricante antes de comprar.
          </p>
        </InfoCard>
      </Section>
    </div>
  );
}
