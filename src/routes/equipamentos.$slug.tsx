import { createFileRoute, notFound } from "@tanstack/react-router";
import { getEquipamento } from "@/data/equipamentos";
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

export const Route = createFileRoute("/equipamentos/$slug")({
  loader: ({ params }) => {
    const equipamento = getEquipamento(params.slug);
    if (!equipamento) throw notFound();
    return { equipamento };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Equipamento não encontrado" }, { name: "robots", content: "noindex" }] };
    const e = loaderData.equipamento;
    const titulo = `${e.nome}: uso e manutenção — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: e.funcao },
        { property: "og:title", content: titulo },
        { property: "og:url", content: `/equipamentos/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/equipamentos/${params.slug}` }],
    };
  },
  component: Detalhe,
});

function Detalhe() {
  const { equipamento: e } = Route.useLoaderData();
  return (
    <div className="pb-4">
      <RegistrarVisita nome={e.nome} href={`/equipamentos/${e.slug}`} tipo="Equipamento" />
      <Breadcrumbs
        trilha={[{ label: "Início", to: "/" }, { label: "Equipamentos", to: "/equipamentos" }, { label: e.nome }]}
      />
      <PageHeader titulo={`${e.emoji} ${e.nome}`} eyebrow="Equipamento" descricao={e.funcao} />
      <div className="mt-4">
        <FavoritoBotao id={`equip-${e.slug}`} tipo="Equipamento" nome={e.nome} href={`/equipamentos/${e.slug}`} />
      </div>
      <Section titulo="Quando utilizar">
        <DataList itens={[{ label: "Quando", valor: e.quandoUsar }]} />
      </Section>
      <Section titulo="Como utilizar">
        <InfoCard>
          <BulletList itens={e.comoUsar} tone="ok" />
        </InfoCard>
      </Section>
      <Section titulo="Cuidados">
        <Aviso titulo="Pontos de atenção">
          <BulletList itens={e.cuidados} tone="danger" />
        </Aviso>
      </Section>
      <Section titulo="Manutenção">
        <InfoCard>
          <BulletList itens={e.manutencao} />
        </InfoCard>
      </Section>
      <Section titulo="Erros comuns">
        <InfoCard>
          <BulletList itens={e.errosComuns} tone="danger" />
        </InfoCard>
      </Section>
    </div>
  );
}
