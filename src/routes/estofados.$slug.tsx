import { createFileRoute, notFound } from "@tanstack/react-router";
import { getEstofado } from "@/data/estofados";
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

export const Route = createFileRoute("/estofados/$slug")({
  loader: ({ params }) => {
    const estofado = getEstofado(params.slug);
    if (!estofado) throw notFound();
    return { estofado };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Estofado não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const e = loaderData.estofado;
    const titulo = `${e.nome}: como higienizar — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: `${e.estrutura} Veja inspeção, higienização, secagem e cuidados pós-limpeza.` },
        { property: "og:title", content: titulo },
        { property: "og:description", content: e.estrutura },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        { property: "og:url", content: `/estofados/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/estofados/${params.slug}` }],
    };
  },
  component: Detalhe,
});

function Detalhe() {
  const { estofado: e } = Route.useLoaderData();
  return (
    <div className="pb-4">
      <RegistrarVisita nome={e.nome} href={`/estofados/${e.slug}`} tipo="Estofado" />
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Estofados", to: "/estofados" }, { label: e.nome }]} />
      <PageHeader titulo={`${e.emoji} ${e.nome}`} eyebrow="Estofado" descricao={e.estrutura} />

      <div className="mt-4">
        <FavoritoBotao id={`estofado-${e.slug}`} tipo="Estofado" nome={e.nome} href={`/estofados/${e.slug}`} />
      </div>

      <Section titulo="Materiais comuns">
        <InfoCard>
          <BulletList itens={e.materiais} />
        </InfoCard>
      </Section>

      <Section titulo="Tecidos frequentes">
        <InfoCard>
          <BulletList itens={e.tecidos} />
        </InfoCard>
      </Section>

      <Section titulo="Problemas típicos">
        <InfoCard>
          <BulletList itens={e.problemas} tone="danger" />
        </InfoCard>
      </Section>

      <Section titulo="Inspeção">
        <InfoCard>
          <BulletList itens={e.inspecao} />
        </InfoCard>
      </Section>

      <Section titulo="Higienização">
        <InfoCard>
          <BulletList itens={e.higienizacao} tone="ok" />
        </InfoCard>
      </Section>

      <Section titulo="Secagem">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">{e.secagem}</p>
        </InfoCard>
      </Section>

      <Section titulo="Pós-limpeza">
        <InfoCard>
          <BulletList itens={e.posLimpeza} />
        </InfoCard>
      </Section>

      <Section titulo="Atenção">
        <Aviso titulo="Riscos específicos desta peça">
          <BulletList itens={e.atencao} tone="danger" />
        </Aviso>
      </Section>
    </div>
  );
}
