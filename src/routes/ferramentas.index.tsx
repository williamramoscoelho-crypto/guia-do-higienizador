import { createFileRoute } from "@tanstack/react-router";
import { ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/ferramentas/")({
  head: () => ({
    meta: [
      { title: "Ferramentas — Guia do Higienizador" },
      { name: "description", content: "Calculadora de diluição e precificação para o atendimento de higienização." },
      { property: "og:title", content: "Ferramentas do higienizador" },
      { property: "og:url", content: "/ferramentas" },
    ],
    links: [{ rel: "canonical", href: "/ferramentas" }],
  }),
  component: Ferramentas,
});

function Ferramentas() {
  return (
    <div className="pb-4">
      <PageHeader
        titulo="Ferramentas"
        eyebrow="Calculadoras"
        descricao="Apoio rápido no atendimento. Confirme sempre a diluição do fabricante e os seus custos reais."
      />
      <Section>
        <ul className="grid gap-2">
          <li>
            <ItemLink
              to="/ferramentas/diluicao"
              emoji="🧮"
              titulo="Calculadora de diluição"
              descricao="Volume desejado e proporção recomendada pelo fabricante"
            />
          </li>
          <li>
            <ItemLink
              to="/ferramentas/precificacao"
              emoji="💰"
              titulo="Calculadora de preço"
              descricao="Custo, tempo, deslocamento e margem"
            />
          </li>
          <li>
            <ItemLink to="/checklist" emoji="📋" titulo="Checklist" descricao="Pré-inspeção salva no aparelho" />
          </li>
          <li>
            <ItemLink to="/identificar" emoji="🔍" titulo="Identificar tecido" descricao="Assistente por perguntas" />
          </li>
        </ul>
      </Section>
    </div>
  );
}
