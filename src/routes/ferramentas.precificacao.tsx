import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Aviso, Breadcrumbs, DataList, PageHeader, Section } from "@/components/app/ui";
import { iaConfigurada } from "@/lib/ia";

export const Route = createFileRoute("/ferramentas/precificacao")({
  head: () => ({
    meta: [
      { title: "Calculadora de precificação — Guia do Higienizador" },
      {
        name: "description",
        content: "Estime custo, preço mínimo e preço recomendado com produto, deslocamento, tempo e margem.",
      },
      { property: "og:title", content: "Calculadora de preço para higienização" },
      { property: "og:url", content: "/ferramentas/precificacao" },
    ],
    links: [{ rel: "canonical", href: "/ferramentas/precificacao" }],
  }),
  component: Precificacao,
});

function Precificacao() {
  const [produto, setProduto] = useState("25");
  const [deslocamento, setDeslocamento] = useState("30");
  const [horas, setHoras] = useState("2");
  const [maoDeObra, setMaoDeObra] = useState("50");
  const [despesas, setDespesas] = useState("20");
  const [margem, setMargem] = useState("40");

  const calc = useMemo(() => {
    const nums = [produto, deslocamento, horas, maoDeObra, despesas, margem].map(Number);
    if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
    const [p, d, h, m, desp, mg] = nums as [number, number, number, number, number, number];
    const custo = p + d + h * m + desp;
    const minimo = custo;
    const recomendado = custo * (1 + mg / 100);
    return { custo, minimo, recomendado };
  }, [produto, deslocamento, horas, maoDeObra, despesas, margem]);

  return (
    <div className="pb-4">
      <Breadcrumbs
        trilha={[
          { label: "Início", to: "/" },
          { label: "Ferramentas", to: "/ferramentas" },
          { label: "Precificação" },
        ]}
      />
      <PageHeader
        titulo="Calculadora de preço"
        eyebrow="Ferramenta"
        descricao="Use os seus números reais. O resultado é uma estimativa, não uma tabela de mercado."
      />
      <Section>
        <div className="grid gap-3">
          <Campo label="Custo do produto (R$)" value={produto} onChange={setProduto} />
          <Campo label="Custo de deslocamento (R$)" value={deslocamento} onChange={setDeslocamento} />
          <Campo label="Tempo de serviço (horas)" value={horas} onChange={setHoras} />
          <Campo label="Mão de obra por hora (R$)" value={maoDeObra} onChange={setMaoDeObra} />
          <Campo label="Outras despesas (R$)" value={despesas} onChange={setDespesas} />
          <Campo label="Margem de lucro (%)" value={margem} onChange={setMargem} />
        </div>
        {calc ? (
          <div className="mt-4">
            <DataList
              itens={[
                { label: "Custo estimado", valor: brl(calc.custo) },
                { label: "Preço mínimo", valor: brl(calc.minimo) },
                { label: "Preço recomendado", valor: brl(calc.recomendado) },
              ]}
            />
          </div>
        ) : null}
      </Section>
      <Aviso titulo="Preço mínimo cobre só o custo">
        Abaixo do custo você trabalha no prejuízo. Ajuste a margem conforme a sua região, a complexidade da peça e o
        risco do atendimento.
      </Aviso>
      {iaConfigurada() ? (
        <p className="mt-4 text-sm">
          <Link to="/ia" search={{ modo: "precificacao" }} className="font-semibold text-primary underline">
            Pedir orientação à IA
          </Link>{" "}
          — ela não publica tabela de mercado; ajuda a usar os seus números nesta calculadora.
        </p>
      ) : null}
    </div>
  );
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
