import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProduto } from "@/data/produtos";
import { ConhecimentoVivo } from "@/components/app/ConhecimentoVivo";
import {
  Aviso,
  Breadcrumbs,
  BulletList,
  DataList,
  FavoritoBotao,
  InfoCard,
  PageHeader,
  RegistrarVisita,
  Section,
} from "@/components/app/ui";

export const Route = createFileRoute("/produtos/$slug")({
  loader: ({ params }) => {
    const produto = getProduto(params.slug);
    if (!produto) throw notFound();
    return { produto };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produto não encontrado" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.produto;
    const titulo = `${p.nome}: função, pH e cuidados — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: `${p.funcao} Veja onde usar, riscos, EPIs e compatibilidade.` },
        { property: "og:title", content: titulo },
        { property: "og:url", content: `/produtos/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/produtos/${params.slug}` }],
    };
  },
  component: Detalhe,
});

function Detalhe() {
  const { produto: p } = Route.useLoaderData();
  return (
    <div className="pb-4">
      <RegistrarVisita nome={p.nome} href={`/produtos/${p.slug}`} tipo="Produto" />
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Produtos", to: "/produtos" }, { label: p.nome }]} />
      <PageHeader titulo={p.nome} eyebrow={p.categoria} descricao={p.funcao} />
      <div className="mt-4">
        <FavoritoBotao id={`produto-${p.slug}`} tipo="Produto" nome={p.nome} href={`/produtos/${p.slug}`} />
      </div>
      <Section titulo="Uso">
        <DataList
          itens={[
            { label: "pH", valor: p.ph },
            { label: "Diluição", valor: p.diluicao },
            { label: "Tempo de ação", valor: p.tempoAcao },
            { label: "Enxágue", valor: p.enxague },
          ]}
        />
      </Section>
      <Section titulo="Onde pode ser utilizado">
        <InfoCard>
          <BulletList itens={p.ondeUsar} tone="ok" />
        </InfoCard>
      </Section>
      <Section titulo="Onde evitar">
        <InfoCard>
          <BulletList itens={p.ondeEvitar} tone="danger" />
        </InfoCard>
      </Section>
      <Section titulo="Características">
        <InfoCard>
          <BulletList itens={p.caracteristicas} />
        </InfoCard>
      </Section>
      <Section titulo="Compatibilidade">
        <InfoCard>
          <BulletList itens={p.compatibilidade} />
        </InfoCard>
      </Section>
      <Section titulo="Riscos">
        <Aviso titulo="Leia a FISPQ antes de usar">
          <BulletList itens={p.riscos} tone="danger" />
        </Aviso>
      </Section>
      <Section titulo="EPIs recomendados">
        <InfoCard>
          <BulletList itens={p.epis} />
        </InfoCard>
      </Section>
      <Aviso titulo="Diluição">
        Nunca invente concentração. Siga sempre a orientação do fabricante e a ficha técnica do lote que você está usando.
      </Aviso>
      <ConhecimentoVivo tema={p.nome} />
    </div>
  );
}
