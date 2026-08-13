import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Aviso, Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/ferramentas/precificacao")({
  head: () => ({
    meta: [
      { title: "Calculadora de precificação de serviço — Guia do Higienizador" },
      { name: "description", content: "Calcule custo de produtos, deslocamento, hora de trabalho e margem para chegar ao preço mínimo do serviço de higienização." },
      { property: "og:title", content: "Calculadora de precificação" },
      { property: "og:description", content: "Do custo real ao preço mínimo saudável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/ferramentas/precificacao" },
    ],
    links: [{ rel: "canonical", href: "/ferramentas/precificacao" }],
  }),
  component: Precificacao,
});

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Precificacao() {
  const [produtos, setProdutos] = useState(15);
  const [deslocamento, setDeslocamento] = useState(30);
  const [horas, setHoras] = useState(2);
  const [valorHora, setValorHora] = useState(60);
  const [margem, setMargem] = useState(30);

  const custo = produtos + deslocamento + horas * valorHora;
  const preco = custo * (1 + margem / 100);

  const campos = [
    { id: "produtos", label: "Custo de produtos (R$)", valor: produtos, set: setProdutos },
    { id: "deslocamento", label: "Deslocamento (R$)", valor: deslocamento, set: setDeslocamento },
    { id: "horas", label: "Horas de trabalho", valor: horas, set: setHoras },
    { id: "valorHora", label: "Valor da sua hora (R$)", valor: valorHora, set: setValorHora },
    { id: "margem", label: "Margem desejada (%)", valor: margem, set: setMargem },
  ];

  return (
    <div className="pb-4">
      <Breadcrumbs
        trilha={[{ label: "Início", to: "/" }, { label: "Ferramentas", to: "/ferramentas" }, { label: "Precificação" }]}
      />
      <PageHeader titulo="💰 Precificação" eyebrow="Ferramenta" descricao="Preço abaixo do custo real é prejuízo disfarçado de movimento." />

      <Section>
        <InfoCard className="grid gap-4">
          {campos.map((c) => (
            <div key={c.id}>
              <label htmlFor={c.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {c.label}
              </label>
              <input
                id={c.id}
                type="number"
                min={0}
                value={c.valor}
                onChange={(e) => c.set(Number(e.target.value))}
                className="mt-1 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
        </InfoCard>
      </Section>

      <Section titulo="Resultado">
        <div className="grid grid-cols-2 gap-2.5">
          <InfoCard>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custo total</p>
            <p className="mt-1 text-xl font-bold">{brl(custo)}</p>
          </InfoCard>
          <InfoCard>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preço mínimo</p>
            <p className="mt-1 text-xl font-bold text-primary">{brl(preco)}</p>
          </InfoCard>
        </div>
      </Section>

      <Section>
        <Aviso titulo="Não esqueça">
          Inclua depreciação de equipamentos, impostos, energia, água e tempo de deslocamento improdutivo. Serviço barato
          demais impede reinvestimento.
        </Aviso>
      </Section>
    </div>
  );
}
