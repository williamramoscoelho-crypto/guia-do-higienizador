import { createFileRoute, notFound } from "@tanstack/react-router";
import { getMarca } from "@/data/marcas";
import {
  Aviso,
  Breadcrumbs,
  DataList,
  InfoCard,
  PageHeader,
  RegistrarVisita,
  Section,
} from "@/components/app/ui";

export const Route = createFileRoute("/onde-comprar/$slug")({
  loader: ({ params }) => {
    const marca = getMarca(params.slug);
    if (!marca) throw notFound();
    return { marca };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Marca não encontrada" }, { name: "robots", content: "noindex" }] };
    const m = loaderData.marca;
    const titulo = `${m.nome}: consulta de marca — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: m.tipoProduto },
        { property: "og:title", content: titulo },
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
      <PageHeader titulo={m.nome} eyebrow="Marca" descricao={m.tipoProduto} />
      <Section>
        <DataList
          itens={[
            { label: "Público", valor: m.publico },
            { label: "Linha profissional", valor: m.linhaProfissional },
            { label: "Linha de entrada", valor: m.linhaEntrada },
            { label: "Categorias", valor: m.categorias.join(", ") },
            { label: "Catálogo", valor: m.catalogo },
            { label: "Treinamentos", valor: m.treinamentos },
            { label: "Distribuidores", valor: m.distribuidores },
            { label: "Histórico", valor: m.historico },
            { label: "Verificação", valor: m.ultimaVerificacao },
          ]}
        />
      </Section>
      <Section titulo="Observações">
        <InfoCard>
          <p className="text-sm leading-relaxed">{m.observacoes}</p>
        </InfoCard>
      </Section>
      <Aviso titulo="Confirme no fabricante">
        Este guia não endossa marca, não publica preço e não substitui ficha técnica nem FISPQ.
      </Aviso>
    </div>
  );
}
