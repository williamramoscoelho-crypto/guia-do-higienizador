import { createFileRoute } from "@tanstack/react-router";
import { errosGraves } from "@/data/conteudo";
import { Breadcrumbs, Chip, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/cuidados")({
  head: () => ({
    meta: [
      { title: "Riscos e cuidados na higienização de estofados — Guia do Higienizador" },
      { name: "description", content: "O que pode danificar um estofado de forma permanente: erros de produto, água em excesso, calor, atrito e mistura química." },
      { property: "og:title", content: "Riscos e cuidados na higienização" },
      { property: "og:description", content: "Os erros mais graves e como evitá-los na prática." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
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
        titulo="⚠️ Riscos e cuidados"
        eyebrow="Não faça isso"
        descricao="A maior parte dos danos em estofados é irreversível. Prevenir custa cinco minutos."
      />
      <Section titulo="Erros mais graves">
        <ul className="grid gap-2.5">
          {errosGraves.map((e) => (
            <li key={e.titulo}>
              <InfoCard>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold">{e.titulo}</h3>
                  <Chip tone="warn">Risco {e.risco}</Chip>
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
