import { createFileRoute } from "@tanstack/react-router";
import { fluxoHigienizacao } from "@/data/conteudo";
import { Aviso, Breadcrumbs, FavoritoBotao, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/fluxo")({
  head: () => ({
    meta: [
      { title: "Passo a passo da higienização — Guia do Higienizador" },
      {
        name: "description",
        content: "12 etapas da higienização profissional: inspeção, teste, extração, secagem e orientação ao cliente.",
      },
      { property: "og:title", content: "Fluxo de higienização de estofados" },
      { property: "og:url", content: "/fluxo" },
    ],
    links: [{ rel: "canonical", href: "/fluxo" }],
  }),
  component: Fluxo,
});

function Fluxo() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Passo a passo" }]} />
      <PageHeader
        titulo="Passo a passo da higienização"
        eyebrow="Procedimento"
        descricao="Siga a mesma sequência em todo atendimento. Pular etapa é a forma mais rápida de gerar retrabalho."
      />
      <div className="mt-4">
        <FavoritoBotao id="fluxo" tipo="Procedimento" nome="Passo a passo da higienização" href="/fluxo" />
      </div>
      <Section>
        <ol className="grid gap-3">
          {fluxoHigienizacao.map((p) => (
            <li key={p.n}>
              <InfoCard>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Etapa {p.n}</p>
                <h2 className="mt-1 text-base font-bold">{p.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
                <div className="mt-3">
                  <Aviso titulo="Segurança">{p.aviso}</Aviso>
                </div>
              </InfoCard>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
