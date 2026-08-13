import { createFileRoute, notFound } from "@tanstack/react-router";
import { getMancha } from "@/data/manchas";
import { ConhecimentoVivo } from "@/components/app/ConhecimentoVivo";
import {
  Aviso,
  Breadcrumbs,
  BulletList,
  Chip,
  DataList,
  FavoritoBotao,
  InfoCard,
  PageHeader,
  RegistrarVisita,
  Section,
} from "@/components/app/ui";

export const Route = createFileRoute("/manchas/$slug")({
  loader: ({ params }) => {
    const mancha = getMancha(params.slug);
    if (!mancha) throw notFound();
    return { mancha };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Mancha não encontrada" }, { name: "robots", content: "noindex" }] };
    const m = loaderData.mancha;
    const titulo = `Mancha de ${m.nome}: como tratar — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: `${m.caracteristica} Dificuldade ${m.dificuldade}. ${m.limitacoes}` },
        { property: "og:title", content: titulo },
        { property: "og:url", content: `/manchas/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/manchas/${params.slug}` }],
    };
  },
  component: Detalhe,
});

function Detalhe() {
  const { mancha: m } = Route.useLoaderData();
  return (
    <div className="pb-4">
      <RegistrarVisita nome={m.nome} href={`/manchas/${m.slug}`} tipo="Mancha" />
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Manchas", to: "/manchas" }, { label: m.nome }]} />
      <PageHeader titulo={`${m.emoji} ${m.nome}`} eyebrow={m.categoria} descricao={m.caracteristica}>
        <div className="mt-3">
          <Chip tone={m.dificuldade === "Fácil" ? "ok" : m.dificuldade === "Média" ? "default" : "warn"}>
            Dificuldade: {m.dificuldade}
          </Chip>
        </div>
      </PageHeader>
      <div className="mt-4">
        <FavoritoBotao id={`mancha-${m.slug}`} tipo="Mancha" nome={m.nome} href={`/manchas/${m.slug}`} />
      </div>
      <Section titulo="Origem">
        <DataList itens={[{ label: "Origem", valor: m.origem }]} />
      </Section>
      <Section titulo="Cuidados">
        <InfoCard>
          <BulletList itens={m.cuidados} />
        </InfoCard>
      </Section>
      <Section titulo="Produtos geralmente utilizados">
        <InfoCard>
          <BulletList itens={m.produtos} tone="ok" />
        </InfoCard>
      </Section>
      <Section titulo="Procedimento sugerido">
        <InfoCard>
          <ol className="space-y-2">
            {m.procedimento.map((passo, i) => (
              <li key={passo} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span>{passo}</span>
              </li>
            ))}
          </ol>
        </InfoCard>
      </Section>
      <Section titulo="O que não fazer">
        <Aviso titulo="Erros que pioram a mancha">
          <BulletList itens={m.naoFazer} tone="danger" />
        </Aviso>
      </Section>
      <Section titulo="Limitações">
        <Aviso titulo="Não prometa remoção total">{m.limitacoes}</Aviso>
      </Section>
      <ConhecimentoVivo tema={m.nome} />
    </div>
  );
}
