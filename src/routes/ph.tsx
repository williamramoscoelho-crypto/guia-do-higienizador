import { createFileRoute } from "@tanstack/react-router";
import { Aviso, Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/ph")({
  head: () => ({
    meta: [
      { title: "Tabela de pH para higienização de estofados — Guia do Higienizador" },
      { name: "description", content: "Faixas de pH ácido, neutro e alcalino: para que servem, em quais tecidos usar com cautela e por que enxaguar." },
      { property: "og:title", content: "Tabela de pH na prática" },
      { property: "og:description", content: "Ácido, neutro e alcalino aplicados à higienização de estofados." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/ph" },
    ],
    links: [{ rel: "canonical", href: "/ph" }],
  }),
  component: Ph,
});

const faixas = [
  { faixa: "0 – 3", nome: "Ácido forte", uso: "Remoção de resíduo mineral e amarelamento. Uso restrito e com enxágue obrigatório.", risco: "Pode danificar fibras naturais, metais e couro." },
  { faixa: "4 – 6", nome: "Levemente ácido", uso: "Enxágue e neutralização após produto alcalino; bom para lã e seda.", risco: "Baixo, ainda assim teste antes." },
  { faixa: "7", nome: "Neutro", uso: "Limpeza geral e manutenção em tecidos sensíveis.", risco: "Menor poder sobre gordura pesada." },
  { faixa: "8 – 10", nome: "Levemente alcalino", uso: "Sujidade orgânica e uso cotidiano em sintéticos.", risco: "Resíduo pode amarelar tecido claro se não enxaguar." },
  { faixa: "11 – 14", nome: "Alcalino forte", uso: "Desengraxe pesado em superfícies resistentes.", risco: "Alto: proibido em couro, lã, seda e viscose." },
];

function Ph() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Guia", to: "/guia" }, { label: "Tabela de pH" }]} />
      <PageHeader titulo="⚗️ Tabela de pH" eyebrow="Referência" descricao="O pH prevê comportamento, mas não substitui o teste no tecido." />
      <Section>
        <ul className="grid gap-2.5">
          {faixas.map((f) => (
            <li key={f.faixa}>
              <InfoCard>
                <h2 className="text-sm font-bold">
                  pH {f.faixa} · {f.nome}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.uso}</p>
                <p className="mt-1 text-xs font-medium text-destructive">{f.risco}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
      <Section>
        <Aviso titulo="Regra prática">
          Quanto mais distante de 7, maior o poder de limpeza e maior o risco. Em dúvida, comece pelo neutro e só suba a
          alcalinidade se o resultado exigir — sempre com enxágue.
        </Aviso>
      </Section>
    </div>
  );
}
