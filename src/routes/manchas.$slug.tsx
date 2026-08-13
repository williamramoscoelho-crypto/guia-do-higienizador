import { createFileRoute, notFound } from "@tanstack/react-router";
import { getMancha } from "@/data/manchas";
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

export const Route = createFileRoute("/manchas/$slug")({
  loader: ({ params }) => {
    const mancha = getMancha(params.slug);
    if (!mancha) throw notFound();
    return { mancha };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Mancha não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const m = loaderData.mancha;
    const titulo = `Como remover mancha de ${m.nome} em estofado — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: `${m.caracteristica} Veja procedimento, produtos indicados, cuidados e limitações na remoção de ${m.nome}.` },
        { property: "og:title", content: titulo },
        { property: "og:description", content: m.caracteristica },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
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
      <PageHeader titulo={`${m.emoji} ${m.nome}`} eyebrow={m.categoria} descricao={m.caracteristica} />

      <div className="mt-4">
        <FavoritoBotao id={`mancha-${m.slug}`} tipo="Mancha" nome={m.nome} href={`/manchas/${m.slug}`} />
      </div>

      <Section titulo="Resumo">
        <DataList
          itens={[
            { label: "Origem", valor: m.origem },
            { label: "Categoria", valor: m.categoria },
            { label: "Dificuldade", valor: m.dificuldade },
          ]}
        />
      </Section>

      <Section titulo="Procedimento">
        <ol className="grid gap-2">
          {m.procedimento.map((p, i) => (
            <li key={p} className="flex gap-3 rounded-2xl border border-border bg-card p-3.5 text-sm leading-relaxed">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section titulo="Produtos indicados">
        <InfoCard>
          <BulletList itens={m.produtos} tone="ok" />
        </InfoCard>
      </Section>

      <Section titulo="Cuidados">
        <InfoCard>
          <BulletList itens={m.cuidados} />
        </InfoCard>
      </Section>

      <Section titulo="Não faça isso">
        <Aviso titulo="Erros que pioram esta mancha">
          <BulletList itens={m.naoFazer} tone="danger" />
        </Aviso>
      </Section>

      <Section titulo="Limitações reais">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">{m.limitacoes}</p>
        </InfoCard>
      </Section>
    </div>
  );
}
