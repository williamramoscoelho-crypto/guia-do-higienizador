import { createFileRoute } from "@tanstack/react-router";
import { categoriasAutomotivas, etapasAutomotivas, kitsAutomotivos } from "@/data/conteudo";
import { Breadcrumbs, BulletList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/automotiva")({
  head: () => ({
    meta: [
      { title: "Estética automotiva — Guia do Higienizador" },
      {
        name: "description",
        content: "Bancos, couro, interior e categorias de produto para higienização automotiva com controle de risco.",
      },
      { property: "og:title", content: "Higienização e estética automotiva" },
      { property: "og:url", content: "/automotiva" },
    ],
    links: [{ rel: "canonical", href: "/automotiva" }],
  }),
  component: Automotiva,
});

function Automotiva() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Estética automotiva" }]} />
      <PageHeader
        titulo="Estética automotiva"
        eyebrow="Interior e bancos"
        descricao="O carro junta tecido, couro, plástico e eletrônicos. Controle de água e produto é ainda mais crítico."
      />
      <Section titulo="Como trabalhar">
        <ul className="grid gap-3">
          {etapasAutomotivas.map((e) => (
            <li key={e.slug}>
              <InfoCard>
                <h2 className="text-sm font-bold">{e.titulo}</h2>
                <div className="mt-2">
                  <BulletList itens={e.pontos} />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
      <Section titulo="Kits por objetivo">
        <ul className="grid gap-3">
          {kitsAutomotivos.map((k) => (
            <li key={k.objetivo}>
              <InfoCard>
                <h2 className="text-sm font-bold">{k.objetivo}</h2>
                <div className="mt-2">
                  <BulletList itens={k.itens} />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
      <Section titulo="Categorias de produto">
        <ul className="grid gap-3">
          {categoriasAutomotivas.map((c) => (
            <li key={c.grupo}>
              <InfoCard>
                <h2 className="text-sm font-bold">{c.grupo}</h2>
                <div className="mt-2">
                  <BulletList itens={c.itens} />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
