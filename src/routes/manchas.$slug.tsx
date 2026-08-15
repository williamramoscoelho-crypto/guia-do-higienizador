import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getMancha } from "@/data/manchas";
import { indicacoesDaMancha, nomeMarcaFicha, rotuloPapel } from "@/data/manchas-produtos";
import { ConhecimentoVivo } from "@/components/app/ConhecimentoVivo";
import { EncontrouErro } from "@/components/app/EncontrouErro";
import { FeedbackUtil } from "@/components/app/FeedbackUtil";
import { RelacionadosConhecimento } from "@/components/app/RelacionadosConhecimento";
import { AlertaPadrao } from "@/components/app/confiabilidade";
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
import { iaConfigurada } from "@/lib/flags";

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
  const indicacoes = indicacoesDaMancha(m.slug);
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
      <Section titulo="Produto da lista (por tipo de tecido)">
        <Aviso titulo="Não é ranking e não garante remoção">
          Indicação cruzada com a ficha oficial. Confirme diluição, pH e superfície no rótulo do lote. Alvejante de cloro
          (hipoclorito) não é o mesmo que peróxido profissional (BAC PEROXY, BACTRAN, OXY-4D).
        </Aviso>
        {indicacoes.length === 0 ? (
          <InfoCard className="mt-3">
            <p className="text-sm leading-relaxed">Informação não encontrada. Consulte o fabricante.</p>
          </InfoCard>
        ) : (
          <ul className="mt-3 grid gap-3">
            {indicacoes.map((ind) => (
              <li key={`${ind.papel}-${ind.ficha.slug}`}>
                <InfoCard>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip>{rotuloPapel(ind.papel)}</Chip>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {nomeMarcaFicha(ind.ficha.marca)}
                    </span>
                  </div>
                  <Link
                    to="/fichas/$slug"
                    params={{ slug: ind.ficha.slug }}
                    className="mt-2 block text-sm font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {ind.ficha.nome}
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed">{ind.citacaoFabricante}</p>
                  <dl className="mt-3 space-y-2 text-sm leading-relaxed">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quando usar</dt>
                      <dd className="mt-0.5">{ind.quandoUsar}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evitar</dt>
                      <dd className="mt-0.5">{ind.evitarEm}</dd>
                    </div>
                  </dl>
                  <a
                    href={ind.fonte}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Página oficial do fabricante
                  </a>
                </InfoCard>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section titulo="Procedimento sugerido">
        <AlertaPadrao tipo="teste">
          Faça teste prévio se houver risco de desbotamento ou alteração de fibra. Confirme diluição só na ficha/rótulo.
        </AlertaPadrao>
        <InfoCard className="mt-3">
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
      <RelacionadosConhecimento manchaNome={m.nome} />
      <FeedbackUtil idPagina={`mancha-${m.slug}`} />
      <EncontrouErro path={`/manchas/${m.slug}`} />
      <ConhecimentoVivo tema={m.nome} />
      {iaConfigurada() ? (
        <Section titulo="Higienizador IA">
          <Link
            to="/ia"
            search={{
              modo: "mancha",
              q: `Mancha de ${m.nome}. ${m.caracteristica} Monte um protocolo seguro para o tecido que eu informar, sem inventar diluição.`,
            }}
            className="card-tap flex min-h-12 items-center justify-between rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
          >
            Resolver esta mancha com a IA
          </Link>
        </Section>
      ) : null}
    </div>
  );
}
