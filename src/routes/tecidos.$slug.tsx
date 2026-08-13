import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTecido } from "@/data/tecidos";
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

export const Route = createFileRoute("/tecidos/$slug")({
  loader: ({ params }) => {
    const tecido = getTecido(params.slug);
    if (!tecido) throw notFound();
    return { tecido };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Tecido não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const t = loaderData.tecido;
    const titulo = `${t.nome}: como limpar, riscos e cuidados — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: `${t.resumo} Veja composição, testes, produtos compatíveis e riscos do tecido ${t.nome}.` },
        { property: "og:title", content: titulo },
        { property: "og:description", content: t.resumo },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/tecidos/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/tecidos/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: "/" },
              { "@type": "ListItem", position: 2, name: "Tecidos", item: "/tecidos" },
              { "@type": "ListItem", position: 3, name: t.nome, item: `/tecidos/${params.slug}` },
            ],
          }),
        },
        ...(t.faq.length
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: t.faq.map((f) => ({
                    "@type": "Question",
                    name: f.p,
                    acceptedAnswer: { "@type": "Answer", text: f.r },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: Detalhe,
});

function Detalhe() {
  const { tecido: t } = Route.useLoaderData();
  const c = t.caracteristicas;

  return (
    <div className="pb-4">
      <RegistrarVisita nome={t.nome} href={`/tecidos/${t.slug}`} tipo="Tecido" />
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Tecidos", to: "/tecidos" }, { label: t.nome }]} />
      <PageHeader titulo={`${t.emoji} ${t.nome}`} eyebrow="Tecido" descricao={t.resumo}>
        <p className="mt-3 text-xs opacity-75">Também conhecido como: {t.nomesComerciais.join(", ")}</p>
      </PageHeader>

      <div className="mt-4">
        <FavoritoBotao id={`tecido-${t.slug}`} tipo="Tecido" nome={t.nome} href={`/tecidos/${t.slug}`} />
      </div>

      <Section titulo="Identificação">
        <DataList
          itens={[
            { label: "Aparência", valor: t.aparencia },
            { label: "Textura", valor: t.textura },
            { label: "Brilho", valor: t.brilho },
            { label: "Toque", valor: t.toque },
          ]}
        />
      </Section>

      <Section titulo="Composição provável">
        <InfoCard>
          <BulletList itens={t.composicao} />
          <p className="mt-3 text-xs text-muted-foreground">
            A composição só é confirmada pela etiqueta ou pelo fabricante. Sem etiqueta, trate como provável.
          </p>
        </InfoCard>
      </Section>

      <Section titulo="Características">
        <DataList
          itens={[
            { label: "Absorção", valor: c.absorcao },
            { label: "Secagem", valor: c.secagem },
            { label: "Resistência", valor: c.resistencia },
            { label: "Sensib. à água", valor: c.sensibilidadeAgua },
            { label: "Sensib. ao calor", valor: c.sensibilidadeCalor },
            { label: "Tende a manchar", valor: c.tendenciaManchas },
            { label: "Alteração de cor", valor: c.alteracaoCor },
            { label: "Encolhimento", valor: c.encolhimento },
            { label: "Migração de cor", valor: c.migracaoCor },
          ]}
        />
      </Section>

      <Section titulo="Higienização">
        <div className="grid gap-3">
          <InfoCard>
            <h3 className="text-sm font-bold">Teste recomendado</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.teste}</p>
          </InfoCard>
          <InfoCard>
            <h3 className="text-sm font-bold">Método indicado</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.metodo}</p>
          </InfoCard>
          <InfoCard>
            <h3 className="text-sm font-bold">Produtos geralmente compatíveis</h3>
            <div className="mt-2">
              <BulletList itens={t.produtosCompativeis} tone="ok" />
            </div>
          </InfoCard>
          <InfoCard>
            <h3 className="text-sm font-bold">Exigem cautela</h3>
            <div className="mt-2">
              <BulletList itens={t.produtosCautela} tone="danger" />
            </div>
          </InfoCard>
          <InfoCard>
            <h3 className="text-sm font-bold">Técnicas a evitar</h3>
            <div className="mt-2">
              <BulletList itens={t.evitar} tone="danger" />
            </div>
          </InfoCard>
          <InfoCard>
            <h3 className="text-sm font-bold">Cuidados na extração</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.cuidadosExtracao}</p>
          </InfoCard>
          <InfoCard>
            <h3 className="text-sm font-bold">Cuidados na secagem</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.cuidadosSecagem}</p>
          </InfoCard>
        </div>
      </Section>

      <Section titulo="Atenção">
        <Aviso titulo="Principais riscos deste tecido">
          <BulletList itens={t.atencao} tone="danger" />
        </Aviso>
      </Section>

      {t.faq.length > 0 ? (
        <Section titulo="Perguntas frequentes">
          <div className="grid gap-3">
            {t.faq.map((f) => (
              <InfoCard key={f.p}>
                <h3 className="text-sm font-bold">{f.p}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.r}</p>
              </InfoCard>
            ))}
          </div>
        </Section>
      ) : null}

      <ConhecimentoVivo tema={t.nome} />
    </div>
  );
}
