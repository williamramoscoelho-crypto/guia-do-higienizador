import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/ferramentas/")({
  head: () => ({
    meta: [
      { title: "Ferramentas do higienizador — Guia do Higienizador" },
      { name: "description", content: "Calculadora de diluição de produtos e calculadora de precificação de serviços de higienização de estofados." },
      { property: "og:title", content: "Ferramentas do higienizador" },
      { property: "og:description", content: "Diluição e precificação em segundos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/ferramentas" },
    ],
    links: [{ rel: "canonical", href: "/ferramentas" }],
  }),
  component: Ferramentas,
});

function Ferramentas() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Ferramentas" }]} />
      <PageHeader titulo="🧮 Ferramentas" eyebrow="Cálculo rápido" descricao="Use direto no atendimento." />
      <Section>
        <ul className="grid gap-2">
          <li>
            <ItemLink to="/ferramentas/diluicao" emoji="🧮" titulo="Calculadora de diluição" descricao="Quanto de produto e de água para a proporção desejada" />
          </li>
          <li>
            <ItemLink to="/ferramentas/precificacao" emoji="💰" titulo="Calculadora de precificação" descricao="Custo, margem e preço mínimo do serviço" />
          </li>
          <li>
            <ItemLink to="/checklist" emoji="📋" titulo="Checklist de pré-inspeção" descricao="Progresso salvo no dispositivo" />
          </li>
          <li>
            <ItemLink to="/identificar" emoji="🔍" titulo="Identificar tecido" descricao="Assistente por perguntas" />
          </li>
        </ul>
      </Section>
    </div>
  );
}
