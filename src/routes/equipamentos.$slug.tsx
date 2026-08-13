import { createFileRoute, notFound } from "@tanstack/react-router";
import { getEquipamento } from "@/data/equipamentos";
import {
  Aviso,
  Breadcrumbs,
  BulletList,
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
    if (!loaderData) {
      return { meta: [{ title: "Equipamento não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const e = loaderData.equipamento;
    const titulo = `${e.nome}: uso correto e manutenção — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: `${e.funcao} Veja quando usar, como usar, manutenção e erros comuns.` },
        { property: "og:title", content: titulo },
        { property: "og:description", content: e.funcao },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
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

      <Section titulo="Quando usar">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">{e.quandoUsar}</p>
        </InfoCard>
      </Section>

      <Section titulo="Como usar">
        <InfoCard>
          <BulletList itens={e.comoUsar} tone="ok" />
        </InfoCard>
      </Section>

      <Section titulo="Cuidados">
        <InfoCard>
          <BulletList itens={e.cuidados} />
        </InfoCard>
      </Section>

      <Section titulo="Manutenção">
        <InfoCard>
          <BulletList itens={e.manutencao} />
        </InfoCard>
      </Section>

      <Section titulo="Erros comuns">
        <Aviso titulo="Evite estes erros">
          <BulletList itens={e.errosComuns} tone="danger" />
        </Aviso>
      </Section>
    </div>
  );
}
