import { createFileRoute } from "@tanstack/react-router";
import { ItemLink, PageHeader, Section } from "@/components/app/ui";
import { iaConfigurada } from "@/lib/flags";

export const Route = createFileRoute("/ferramentas/")({
  head: () => ({
    meta: [
      { title: "Ferramentas — Guia do Higienizador" },
      { name: "description", content: "Calculadora de diluição, diagnóstico e precificação para o atendimento." },
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
          {iaConfigurada() ? (
            <li>
              <ItemLink
                to="/ia"
                emoji="🤖"
                titulo="Higienizador IA"
                descricao="Chat técnico: peça orientação e use as calculadoras com a ficha na mão"
              />
            </li>
          ) : null}
          <li>
            <ItemLink
              to="/diagnostico"
              emoji="🧭"
              titulo="Diagnóstico do Higienizador"
              descricao="Peça → tecido → mancha só com páginas do catálogo; sem inventar química"
            />
          </li>
          <li>
            <ItemLink
              to="/ferramentas/diluicao"
              emoji="🧮"
              titulo="Calculadora de diluição"
              descricao="Volume, embalagem e proporção citada na ficha do fabricante"
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
          <li>
            <ItemLink
              to="/casos-reais"
              emoji="📓"
              titulo="Modelo de caso profissional"
              descricao="Estrutura material → resultado → limitações"
            />
          </li>
        </ul>
      </Section>
    </div>
  );
}
