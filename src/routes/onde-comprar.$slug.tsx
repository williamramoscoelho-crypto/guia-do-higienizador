import { createFileRoute, notFound } from "@tanstack/react-router";
import { getMarca } from "@/data/marcas";
import { Breadcrumbs, Chip, DataList, InfoCard, PageHeader, RegistrarVisita, Section } from "@/components/app/ui";

export const Route = createFileRoute("/onde-comprar/$slug")({
  loader: ({ params }) => {
    const marca = getMarca(params.slug);
    if (!marca) throw notFound();
    return { marca };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Marca não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const m = loaderData.marca;
    const titulo = `${m.nome}: linhas, público e onde comprar — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: `${m.tipoProduto} para ${m.publico}. Veja categorias, linhas, catálogo, treinamentos e distribuição.` },
        { property: "og:title", content: titulo },
        { property: "og:description", content: m.tipoProduto },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        { property: "og:url", content: `/onde-comprar/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/onde-comprar/${params.slug}` }],
    };
  },
  component: Detalhe,
});

function Detalhe() {
  const { marca: m } = Route.useLoaderData();
  return (
    <div className="pb-4">
      <RegistrarVisita nome={m.nome} href={`/onde-comprar/${m.slug}`} tipo="Marca" />
      <Breadcrumbs
        trilha={[{ label: "Início", to: "/" }, { label: "Onde comprar", to: "/onde-comprar" }, { label: m.nome }]}
      />
      <PageHeader titulo={`🏷️ ${m.nome}`} eyebrow="Marca" descricao={m.tipoProduto} />

      <Section titulo="Categorias">
        <div className="flex flex-wrap gap-2">
          {m.categorias.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      </Section>

      <Section titulo="Ficha">
        <DataList
          itens={[
            { label: "Público", valor: m.publico },
            { label: "Linha profissional", valor: m.linhaProfissional },
            { label: "Linha de entrada", valor: m.linhaEntrada },
            { label: "Catálogo", valor: m.catalogo },
            { label: "Treinamentos", valor: m.treinamentos },
            { label: "Distribuição", valor: m.distribuidores },
            { label: "Histórico", valor: m.historico },
            { label: "Site oficial", valor: m.siteOficial ?? "Não verificado" },
            { label: "Verificado em", valor: m.ultimaVerificacao },
          ]}
        />
      </Section>

      <Section titulo="Observações">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">{m.observacoes}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Informações apenas informativas. Nenhuma marca é indicada como superior a outra.
          </p>
        </InfoCard>
      </Section>
    </div>
  );
}
