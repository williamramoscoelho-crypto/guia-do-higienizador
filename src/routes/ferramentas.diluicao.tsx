import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Aviso, Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/ferramentas/diluicao")({
  head: () => ({
    meta: [
      { title: "Calculadora de diluição de produtos — Guia do Higienizador" },
      { name: "description", content: "Calcule quanto de produto concentrado e de água usar para atingir a diluição indicada pelo fabricante, em qualquer volume final." },
      { property: "og:title", content: "Calculadora de diluição" },
      { property: "og:description", content: "Produto e água na proporção certa, sem erro de conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/ferramentas/diluicao" },
    ],
    links: [{ rel: "canonical", href: "/ferramentas/diluicao" }],
  }),
  component: Diluicao,
});

function Diluicao() {
  const [volume, setVolume] = useState(1000);
  const [partes, setPartes] = useState(10);

  const produto = partes > 0 ? volume / (partes + 1) : 0;
  const agua = volume - produto;

  return (
    <div className="pb-4">
      <Breadcrumbs
        trilha={[{ label: "Início", to: "/" }, { label: "Ferramentas", to: "/ferramentas" }, { label: "Diluição" }]}
      />
      <PageHeader titulo="🧮 Calculadora de diluição" eyebrow="Ferramenta" descricao="Diluição 1:X significa 1 parte de produto para X partes de água." />

      <Section>
        <InfoCard className="grid gap-4">
          <div>
            <label htmlFor="volume" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Volume final (ml)
            </label>
            <input
              id="volume"
              type="number"
              min={1}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="mt-1 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="partes" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Diluição 1 : X (partes de água)
            </label>
            <input
              id="partes"
              type="number"
              min={1}
              value={partes}
              onChange={(e) => setPartes(Number(e.target.value))}
              className="mt-1 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </div>
        </InfoCard>
      </Section>

      <Section titulo="Resultado">
        <div className="grid grid-cols-2 gap-2.5">
          <InfoCard>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produto</p>
            <p className="mt-1 text-2xl font-bold">{produto.toFixed(0)} ml</p>
          </InfoCard>
          <InfoCard>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Água</p>
            <p className="mt-1 text-2xl font-bold">{agua.toFixed(0)} ml</p>
          </InfoCard>
        </div>
      </Section>

      <Section>
        <Aviso titulo="Antes de aplicar">
          A diluição correta é sempre a do rótulo do fabricante. Diluir menos não limpa mais: aumenta residual, risco de
          dano e re-sujeira.
        </Aviso>
      </Section>
    </div>
  );
}
