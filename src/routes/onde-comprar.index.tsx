import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { criteriosCompra, marcas } from "@/data/marcas";
import { kitsHigienizacao, perfilCompra } from "@/data/conteudo";
import { Aviso, Breadcrumbs, BulletList, CatalogList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/onde-comprar/")({
  head: () => ({
    meta: [
      { title: "Onde comprar — Guia do Higienizador" },
      {
        name: "description",
        content: "Critérios de compra, kits por nível e marcas do mercado. Nenhuma marca é apresentada como superior.",
      },
      { property: "og:title", content: "Onde comprar produtos e equipamentos" },
      { property: "og:url", content: "/onde-comprar" },
    ],
    links: [{ rel: "canonical", href: "/onde-comprar" }],
  }),
  component: OndeComprar,
});

function OndeComprar() {
  const [perfil, setPerfil] = useState(perfilCompra[0]?.id ?? "custo-beneficio");
  const dica = useMemo(() => perfilCompra.find((p) => p.id === perfil), [perfil]);

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Onde comprar" }]} />
      <PageHeader
        titulo="Onde comprar"
        eyebrow="Mercado"
        descricao="Este guia não vende produto e não ranqueia marcas. Use os critérios abaixo e confirme tudo no fabricante."
      />
      <Section titulo="Qual o seu momento?">
        <div className="flex flex-wrap gap-2">
          {perfilCompra.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPerfil(p.id)}
              className={
                perfil === p.id
                  ? "min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  : "min-h-11 rounded-full border border-border bg-card px-4 text-sm"
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        {dica ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{dica.dica}</p> : null}
      </Section>
      <Section titulo="Critérios de compra">
        <ul className="grid gap-3">
          {criteriosCompra.map((c) => (
            <li key={c.titulo}>
              <InfoCard>
                <h2 className="text-sm font-bold">{c.titulo}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.texto}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
      <Section titulo="Kits por nível">
        <ul className="grid gap-3">
          {kitsHigienizacao.map((k) => (
            <li key={k.nivel}>
              <InfoCard>
                <h2 className="text-sm font-bold">{k.nivel}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{k.descricao}</p>
                <div className="mt-2">
                  <BulletList itens={k.itens} />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
      <Section titulo="Marcas (consulta, sem ranking)">
        <CatalogList
          placeholder="Filtrar marca…"
          itens={marcas.map((m) => ({
            key: m.slug,
            to: "/onde-comprar/$slug",
            params: { slug: m.slug },
            titulo: m.nome,
            descricao: m.tipoProduto,
          }))}
        />
      </Section>
      <Aviso titulo="Política editorial">
        Nenhuma marca é apresentada como superior. Links, preços e características específicas devem ser confirmados no
        canal oficial do fabricante.
      </Aviso>
    </div>
  );
}
