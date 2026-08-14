import { createFileRoute, Link } from "@tanstack/react-router";
import { Aviso, Breadcrumbs, BulletList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Guia do Higienizador — Guia do Higienizador" },
      {
        name: "description",
        content: "Um manual de bolso digital feito para consulta rápida durante o atendimento. Ferramenta de apoio, não substitui ficha técnica nem FISPQ.",
      },
      { property: "og:title", content: "Sobre o Guia do Higienizador" },
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
        titulo="Sobre o Guia do Higienizador"
        eyebrow="Guia do Higienizador"
        descricao="Um manual de bolso digital feito para consulta rápida durante o atendimento."
      />
      <Section titulo="O que é">
        <InfoCard>
          <p className="text-sm leading-relaxed">
            O Guia do Higienizador ajuda o profissional a decidir com mais segurança e clareza:
          </p>
          <div className="mt-3">
            <BulletList
              itens={[
                "Qual tecido",
                "Qual tipo de mancha",
                "Qual produto usar",
                "Qual equipamento",
                "Qual procedimento seguir",
              ]}
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed">A linguagem é direta, brasileira e prática — sem enrolação.</p>
        </InfoCard>
      </Section>
      <Section titulo="Importante: Ferramenta de Apoio">
        <Aviso titulo="Ferramenta de Apoio">
          <p>
            As recomendações deste guia <strong>não substituem</strong>:
          </p>
          <div className="mt-2">
            <BulletList
              itens={[
                "Ficha técnica do produto",
                "FISPQ / SDS",
                "Orientações do fabricante",
                "Etiqueta do tecido",
                "Treinamento profissional",
                "Normas de segurança",
              ]}
            />
          </div>
        </Aviso>
        <div className="mt-3">
          <InfoCard>
            <p className="mb-2 text-sm font-bold">Regras de ouro</p>
            <BulletList
              tone="danger"
              itens={[
                "Nunca misture produtos químicos.",
                "Nunca invente diluição, concentração ou tempo de ação.",
                "Na dúvida sobre composição ou resistência do tecido, teste em área discreta e consulte o fabricante.",
                "Manchas antigas, queimadas, desbotamentos e danos químicos podem ser permanentes.",
              ]}
            />
          </InfoCard>
        </div>
      </Section>
      <Section titulo="Independência e Transparência">
        <InfoCard>
          <p className="text-sm leading-relaxed">
            Este é um projeto independente, com código e operação próprios.{" "}
            <Link to="/parceria" className="text-primary underline">
              Saiba mais sobre a parceria editorial
            </Link>
            . A comunidade ao vivo ainda não está aberta — confira o{" "}
            <Link to="/codigo-da-comunidade" className="text-primary underline">
              código de conduta
            </Link>
            .
          </p>
        </InfoCard>
      </Section>
      <Section>
        <Link
          to="/transparencia"
          className="inline-flex min-h-12 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold"
        >
          Transparência e política editorial
        </Link>
      </Section>
    </div>
  );
}
