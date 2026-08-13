import { createFileRoute } from "@tanstack/react-router";
import { categoriasAutomotivas, etapasAutomotivas, kitsAutomotivos } from "@/data/conteudo";
import { Aviso, Breadcrumbs, BulletList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/automotiva")({
  head: () => ({
    meta: [
      { title: "Estética automotiva e higienização interna — Guia do Higienizador" },
      { name: "description", content: "Bancos, couro automotivo, manchas em interiores, categorias de produtos e kits: como higienizar o interior do veículo com segurança." },
      { property: "og:title", content: "Estética automotiva e higienização interna" },
      { property: "og:description", content: "Bancos, couro e interior: procedimento e riscos." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/automotiva" },
    ],
    links: [{ rel: "canonical", href: "/automotiva" }],
  }),
  component: Automotiva,
});

function Automotiva() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Automotiva" }]} />
      <PageHeader
        titulo="🚗 Estética automotiva"
        eyebrow="Mercado"
        descricao="Interior de veículo exige controle rigoroso de umidade e cuidado com eletrônica."
      />

      <Section>
        <Aviso titulo="Regra de ouro no interior">
          Menos água, mais extração. Proteja módulos elétricos, nunca pulverize próximo a centrais e só feche o veículo
          após a secagem completa.
        </Aviso>
      </Section>

      <Section titulo="Procedimentos">
        <ul className="grid gap-2.5">
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

      <Section titulo="Categorias de produtos">
        <ul className="grid gap-2.5">
          {categoriasAutomotivas.map((c) => (
            <li key={c.grupo}>
              <InfoCard>
                <h2 className="text-sm font-bold">{c.grupo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.itens.join(" · ")}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>

      <Section titulo="Kits por objetivo">
        <ul className="grid gap-2.5">
          {kitsAutomotivos.map((k) => (
            <li key={k.objetivo}>
              <InfoCard>
                <h2 className="text-sm font-bold">{k.objetivo}</h2>
                <div className="mt-2">
                  <BulletList itens={k.itens} tone="ok" />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
