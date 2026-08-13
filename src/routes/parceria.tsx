import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, BulletList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/parceria")({
  head: () => ({
    meta: [
      { title: "Parceria Auto Limpeza Pro — Guia do Higienizador" },
      { name: "description", content: "O Guia do Higienizador é um projeto parceiro da Auto Limpeza Pro, empresa que atua na prática com higienização de estofados." },
      { property: "og:title", content: "Parceria com a Auto Limpeza Pro" },
      { property: "og:description", content: "Experiência de campo aplicada à formação de novos profissionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
        titulo="🤝 Auto Limpeza Pro"
        eyebrow="Projeto parceiro"
        descricao="O Guia do Higienizador conta com a parceria da Auto Limpeza Pro, empresa que atua no dia a dia da higienização de estofados."
      />

      <Section titulo="Por que essa parceria existe">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Muita gente entra no ramo sem acesso a informação confiável e acaba aprendendo por tentativa e erro — com
            prejuízo. A parceria une conteúdo organizado e experiência real de atendimento para acelerar essa curva.
          </p>
        </InfoCard>
      </Section>

      <Section titulo="O que a parceria agrega">
        <InfoCard>
          <BulletList
            itens={[
              "Validação prática do conteúdo com base em atendimentos reais.",
              "Casos de campo: o que costuma dar errado e como contornar.",
              "Orientação sobre processo de atendimento e relacionamento com o cliente.",
              "Visão realista sobre limitações de remoção de manchas.",
            ]}
          />
        </InfoCard>
      </Section>

      <Section titulo="Transparência">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A parceria é institucional e não interfere na neutralidade técnica do guia: nenhuma marca ou fornecedor é
            apresentado como superior, e recomendações seguem sempre critério técnico.
          </p>
        </InfoCard>
      </Section>
    </div>
  );
}
