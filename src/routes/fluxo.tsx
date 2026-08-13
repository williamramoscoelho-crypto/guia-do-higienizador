import { createFileRoute } from "@tanstack/react-router";
import { fluxoHigienizacao } from "@/data/conteudo";
import { Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/fluxo")({
  head: () => ({
    meta: [
      { title: "Passo a passo da higienização de estofados — Guia do Higienizador" },
      { name: "description", content: "As 12 etapas da higienização profissional: inspeção, identificação, aspiração, teste, aplicação, extração, secagem e orientação ao cliente." },
      { property: "og:title", content: "Passo a passo da higienização" },
      { property: "og:description", content: "12 etapas com avisos de segurança em cada fase." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/fluxo" },
    ],
    links: [{ rel: "canonical", href: "/fluxo" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Passo a passo da higienização de estofados",
          step: fluxoHigienizacao.map((e) => ({ "@type": "HowToStep", name: e.titulo, text: e.texto })),
        }),
      },
    ],
  }),
  component: Fluxo,
});

function Fluxo() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Guia", to: "/guia" }, { label: "Passo a passo" }]} />
      <PageHeader
        titulo="💦 Passo a passo"
        eyebrow="Procedimento"
        descricao="A sequência que separa um serviço profissional de um improviso."
      />
      <Section>
        <ol className="grid gap-2.5">
          {fluxoHigienizacao.map((e) => (
            <li key={e.n}>
              <InfoCard>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {e.n}
                  </span>
                  <h2 className="text-sm font-bold">{e.titulo}</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.texto}</p>
                <p className="mt-2 rounded-xl bg-warning/15 p-2.5 text-xs font-medium text-warning-foreground">
                  ⚠️ {e.aviso}
                </p>
              </InfoCard>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
