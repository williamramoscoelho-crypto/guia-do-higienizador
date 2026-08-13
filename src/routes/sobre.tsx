import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o projeto — Guia do Higienizador" },
      { name: "description", content: "O Guia do Higienizador é um manual digital de consulta rápida para profissionais de higienização de estofados e estética automotiva." },
      { property: "og:title", content: "Sobre o Guia do Higienizador" },
      { property: "og:description", content: "Conhecimento para quem limpa. Experiência de quem faz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Sobre" }]} />
      <PageHeader
        titulo="📖 Sobre o projeto"
        eyebrow="Guia do Higienizador"
        descricao="Um manual de bolso para quem está começando ou se aperfeiçoando na higienização de estofados."
      />

      <Section titulo="Para que serve">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            O objetivo é permitir consulta rápida em campo: identificar o tecido, entender a mancha, escolher o produto
            certo e seguir o procedimento correto — em poucos toques, direto do celular.
          </p>
        </InfoCard>
      </Section>

      <Section titulo="Como o conteúdo é tratado">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            O conteúdo é orientativo e baseado em prática de campo. Nenhuma marca é apresentada como superior e não
            publicamos dados, preços ou links que não tenham sido verificados. Sempre siga a etiqueta da peça e as
            instruções do fabricante do produto.
          </p>
        </InfoCard>
      </Section>

      <Section titulo="Privacidade">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Favoritos, histórico e checklist ficam salvos apenas no seu dispositivo. Não coletamos dados pessoais.
          </p>
        </InfoCard>
      </Section>

      <Section>
        <Link
          to="/parceria"
          className="inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Conheça a parceria com a Auto Limpeza Pro
        </Link>
      </Section>
    </div>
  );
}
