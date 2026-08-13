import { createFileRoute, Link } from "@tanstack/react-router";
import { Aviso, Breadcrumbs, BulletList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o projeto — Guia do Higienizador" },
      {
        name: "description",
        content: "Manual digital de consulta para higienizadores. Ferramenta de apoio, não substitui ficha técnica nem FISPQ.",
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
        titulo="Sobre o projeto"
        eyebrow="Guia do Higienizador"
        descricao="Um manual de bolso digital para consulta rápida durante o atendimento."
      />
      <Section titulo="O que é">
        <InfoCard>
          <p className="text-sm leading-relaxed">
            O Guia do Higienizador ajuda o profissional a decidir com mais segurança: tecido, mancha, produto,
            equipamento e procedimento. A linguagem é direta, brasileira e prática.
          </p>
        </InfoCard>
      </Section>
      <Section titulo="Importante">
        <Aviso titulo="Ferramenta de apoio">
          As recomendações não substituem ficha técnica, FISPQ/SDS, orientações do fabricante, etiqueta do tecido,
          treinamento profissional nem normas de segurança.
        </Aviso>
        <div className="mt-3">
          <InfoCard>
            <BulletList
              tone="danger"
              itens={[
                "Nunca misture produtos químicos.",
                "Nunca invente diluição, concentração ou tempo de ação.",
                "Na dúvida de composição ou resistência, teste em área discreta e consulte o fabricante.",
                "Manchas antigas, queimadas, desbotamentos e danos químicos podem ser permanentes.",
              ]}
            />
          </InfoCard>
        </div>
      </Section>
      <Section titulo="Independência">
        <InfoCard>
          <p className="text-sm leading-relaxed">
            Este é um projeto independente, com código e operação próprios.{" "}
            <Link to="/parceria" className="text-primary underline">
              Saiba mais sobre a parceria editorial
            </Link>
            . A comunidade ao vivo ainda não está aberta — veja o{" "}
            <Link to="/comunidade" className="text-primary underline">
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
