import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Aviso, Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/ferramentas/diluicao")({
  head: () => ({
    meta: [
      { title: "Calculadora de diluição — Guia do Higienizador" },
      {
        name: "description",
        content: "Calcule produto e água a partir do volume desejado e da diluição indicada pelo fabricante.",
      },
      { property: "og:title", content: "Calculadora de diluição" },
      { property: "og:url", content: "/ferramentas/diluicao" },
    ],
    links: [{ rel: "canonical", href: "/ferramentas/diluicao" }],
  }),
  component: Diluicao,
});

function Diluicao() {
  const [volume, setVolume] = useState("1000");
  const [produto, setProduto] = useState("1");
  const [agua, setAgua] = useState("10");

  const resultado = useMemo(() => {
    const v = Number(volume);
    const p = Number(produto);
    const a = Number(agua);
    if (![v, p, a].every((n) => Number.isFinite(n) && n > 0)) return null;
    const partes = p + a;
    const mlProduto = (v * p) / partes;
    const mlAgua = (v * a) / partes;
    return { mlProduto, mlAgua };
  }, [volume, produto, agua]);

  return (
    <div className="pb-4">
      <Breadcrumbs
        trilha={[
          { label: "Início", to: "/" },
          { label: "Ferramentas", to: "/ferramentas" },
          { label: "Diluição" },
        ]}
      />
      <PageHeader
        titulo="Calculadora de diluição"
        eyebrow="Ferramenta"
        descricao="Informe o volume final e a proporção do fabricante (ex.: 1:10)."
      />
      <Section>
        <div className="grid gap-3">
          <Campo label="Volume desejado (ml)" value={volume} onChange={setVolume} />
          <Campo label="Partes de produto" value={produto} onChange={setProduto} />
          <Campo label="Partes de água" value={agua} onChange={setAgua} />
        </div>
        {resultado ? (
          <InfoCard className="mt-4">
            <p className="text-sm font-bold">Resultado</p>
            <p className="mt-2 text-sm leading-relaxed">
              Utilize <strong>{resultado.mlProduto.toFixed(1)} ml</strong> de produto +{" "}
              <strong>{resultado.mlAgua.toFixed(1)} ml</strong> de água.
            </p>
          </InfoCard>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Preencha números maiores que zero.</p>
        )}
      </Section>
      <Aviso titulo="Confirme sempre a diluição indicada pelo fabricante">
        Esta calculadora só faz a conta. A proporção correta está no rótulo, na ficha técnica e no lote do produto que
        você está usando.
      </Aviso>
    </div>
  );
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
