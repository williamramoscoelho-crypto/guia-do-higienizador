import { createFileRoute, Link } from "@tanstack/react-router";
import { marcas, criteriosCompra } from "@/data/marcas";
import { perfilCompra } from "@/data/conteudo";
import { Aviso, Breadcrumbs, InfoCard, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/onde-comprar/")({
  head: () => ({
    meta: [
      { title: "Onde comprar produtos e equipamentos — Guia do Higienizador" },
      { name: "description", content: "Marcas do setor, critérios de compra, custo por aplicação e perfis de investimento para montar seu kit de higienização." },
      { property: "og:title", content: "Onde comprar produtos e equipamentos" },
      { property: "og:description", content: "Critérios técnicos para comprar bem, sem propaganda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/onde-comprar" },
    ],
    links: [{ rel: "canonical", href: "/onde-comprar" }],
  }),
  component: OndeComprar,
});

function OndeComprar() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Onde comprar" }]} />
      <PageHeader
        titulo="🏪 Onde comprar"
        eyebrow="Mercado"
        descricao="Nenhuma marca é apresentada como superior. Compare ficha técnica, rendimento e suporte."
      />

      <Section>
        <Aviso titulo="Política editorial">
          Não publicamos preços, links ou características que não tenham sido verificados. Confirme sempre no canal
          oficial do fabricante antes de comprar.
        </Aviso>
      </Section>

      <Section titulo="Critérios de compra">
        <ul className="grid gap-2.5">
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

      <Section titulo="Perfis de investimento">
        <ul className="grid gap-2.5">
          {perfilCompra.map((p) => (
            <li key={p.id}>
              <InfoCard>
                <h2 className="text-sm font-bold">{p.label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.dica}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Link
          to="/onde-comprar/comparar"
          className="inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Comparar marcas lado a lado
        </Link>
      </Section>

      <Section titulo="Marcas do setor">

        <ul className="grid gap-2">
          {marcas.map((m) => (
            <li key={m.slug}>
              <ItemLink
                to="/onde-comprar/$slug"
                params={{ slug: m.slug }}
                emoji="🏷️"
                titulo={m.nome}
                descricao={`${m.tipoProduto} · ${m.publico}`}
              />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
