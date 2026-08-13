import { createFileRoute, notFound } from "@tanstack/react-router";
import { getMarca } from "@/data/marcas";
import { fichasPorMarca, marcasFichas } from "@/data/fichas-fabricantes";
import {
  Aviso,
  Breadcrumbs,
  DataList,
  InfoCard,
  ItemLink,
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
  const fichas = fichasPorMarca(m.slug);
  const catalogo = marcasFichas.find((x) => x.slug === m.slug);
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
      {m.siteOficial ? (
        <Section titulo="Site oficial">
          <a href={m.siteOficial} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
            {m.siteOficial}
          </a>
        </Section>
      ) : null}
      {fichas.length > 0 ? (
        <Section titulo="Fichas lidas no site oficial">
          <ul className="grid gap-2">
            {fichas.map((f) => (
              <li key={f.slug}>
                <ItemLink to="/fichas/$slug" params={{ slug: f.slug }} titulo={f.nome} descricao={f.resumo} />
              </li>
            ))}
          </ul>
          {catalogo ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Lista parcial, focada em estofados, interior e couro. Catálogo completo: {catalogo.site}
            </p>
          ) : null}
        </Section>
      ) : null}
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
