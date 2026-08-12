import { createFileRoute } from "@tanstack/react-router";
import { Aviso, Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/parceria")({
  head: () => ({
    meta: [
      { title: "Parceria — Guia do Higienizador" },
      {
        name: "description",
        content: "O Guia do Higienizador é um produto independente, com parceria editorial da Auto Limpeza Pro.",
      },
      { property: "og:title", content: "Parceria do Guia do Higienizador" },
      { property: "og:url", content: "/parceria" },
    ],
    links: [{ rel: "canonical", href: "/parceria" }],
  }),
  component: Parceria,
});

function Parceria() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Parceria" }]} />
      <PageHeader
        titulo="Parceria"
        eyebrow="Projeto independente"
        descricao="O Guia do Higienizador nasceu para profissionalizar a consulta de quem higieniza estofados."
      />
      <Section>
        <InfoCard>
          <p className="text-sm leading-relaxed">
            Este site é um produto próprio, com repositório, código e operação separados de qualquer outro sistema. A
            identidade visual (azul e ciano, visual de app profissional) foi alinhada à da Auto Limpeza Pro para
            transmitir a mesma linguagem de limpeza técnica — sem misturar plataformas, cadastros ou agendamento.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A Auto Limpeza Pro atua na prática com higienização de estofados e estética. A parceria é editorial e de
            experiência de campo: o guia continua independente.
          </p>
        </InfoCard>
      </Section>
      <Aviso titulo="Independência técnica">
        Nada neste aplicativo compartilha banco de dados, login, API ou código-fonte com outros projetos.
      </Aviso>
    </div>
  );
}
