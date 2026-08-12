import { createFileRoute } from "@tanstack/react-router";
import { errosGraves } from "@/data/conteudo";
import { Aviso, Breadcrumbs, Chip, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/cuidados")({
  head: () => ({
    meta: [
      { title: "Riscos e cuidados — Guia do Higienizador" },
      {
        name: "description",
        content: "Erros que danificam estofados: produto sem teste, excesso de água, mistura de químicos e mais.",
      },
      { property: "og:title", content: "Não faça isso: erros que danificam estofados" },
      { property: "og:url", content: "/cuidados" },
    ],
    links: [{ rel: "canonical", href: "/cuidados" }],
  }),
  component: Cuidados,
});

function Cuidados() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Cuidados" }]} />
      <PageHeader
        titulo="Riscos e cuidados"
        eyebrow="Não faça isso"
        descricao="Erros que podem danificar um estofado de forma permanente. Leia antes de aplicar qualquer produto."
      />
      <Section>
        <Aviso titulo="Regra de ouro">
          Nunca misture produtos químicos. Nunca invente diluição. Sempre teste em área discreta. Sem etiqueta, use o
          método mais conservador.
        </Aviso>
        <ul className="mt-4 grid gap-3">
          {errosGraves.map((e) => (
            <li key={e.titulo}>
              <InfoCard>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-bold">{e.titulo}</h2>
                  <Chip tone={e.risco === "Crítico" || e.risco === "Alto" ? "warn" : "default"}>{e.risco}</Chip>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.texto}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
