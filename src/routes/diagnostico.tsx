import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { estofados } from "@/data/estofados";
import { manchas } from "@/data/manchas";
import { tecidos } from "@/data/tecidos";
import { AlertaPadrao } from "@/components/app/confiabilidade";
import { Breadcrumbs, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico do Higienizador — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Fluxo guiado: peça, tecido e mancha a partir do catálogo do Guia. Sem inventar diluição ou química.",
      },
      { property: "og:title", content: "Diagnóstico do Higienizador" },
      { property: "og:url", content: "/diagnostico" },
    ],
    links: [{ rel: "canonical", href: "/diagnostico" }],
  }),
  component: Diagnostico,
});

type Passo = 1 | 2 | 3 | 4;

function Diagnostico() {
  const [passo, setPasso] = useState<Passo>(1);
  const [peca, setPeca] = useState<string | null>(null);
  const [tecido, setTecido] = useState<string | null>(null);
  const [mancha, setMancha] = useState<string | null>(null);

  const pecaObj = useMemo(() => estofados.find((e) => e.slug === peca) ?? null, [peca]);
  const tecidoObj = useMemo(() => tecidos.find((t) => t.slug === tecido) ?? null, [tecido]);
  const manchaObj = useMemo(() => manchas.find((m) => m.slug === mancha) ?? null, [mancha]);

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Ferramentas", to: "/ferramentas" }, { label: "Diagnóstico" }]} />
      <PageHeader
        titulo="Diagnóstico do Higienizador"
        eyebrow="Ferramenta"
        descricao="Responda com o que você sabe. Se faltar dado confirmado no catálogo, o Guia não inventa protocolo químico."
      />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Etapa {passo} de 4
      </p>

      {passo === 1 ? (
        <Section titulo="1. O que você vai limpar?">
          <ul className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
            {estofados.map((e) => (
              <li key={e.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setPeca(e.slug);
                    setPasso(2);
                  }}
                  className="card-tap flex min-h-14 w-full items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
                >
                  {e.nome}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {passo === 2 ? (
        <Section titulo="2. Qual material / tecido?">
          <ul className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
            {tecidos.map((t) => (
              <li key={t.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setTecido(t.slug);
                    setPasso(3);
                  }}
                  className="card-tap flex min-h-14 w-full items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
                >
                  {t.emoji} {t.nome}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-4 text-sm font-semibold text-primary" onClick={() => setPasso(1)}>
            Voltar
          </button>
        </Section>
      ) : null}

      {passo === 3 ? (
        <Section titulo="3. Qual o problema / mancha?">
          <ul className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
            {manchas.map((m) => (
              <li key={m.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setMancha(m.slug);
                    setPasso(4);
                  }}
                  className="card-tap flex min-h-14 w-full items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
                >
                  {m.nome}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="mt-4 text-sm font-semibold text-primary" onClick={() => setPasso(2)}>
            Voltar
          </button>
        </Section>
      ) : null}

      {passo === 4 ? (
        <Section titulo="4. Orientação com base no catálogo">
          <div className="grid gap-3">
            <AlertaPadrao tipo="insuficiente">
              Este diagnóstico só aponta páginas já publicadas no Guia. Diluição, pH e produto de marca só valem se
              estiverem na ficha/rótulo — o assistente não inventa química.
            </AlertaPadrao>

            <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed">
              <p>
                <strong>Peça:</strong> {pecaObj?.nome ?? "—"}
              </p>
              <p className="mt-1">
                <strong>Tecido:</strong> {tecidoObj?.nome ?? "—"}
              </p>
              <p className="mt-1">
                <strong>Mancha:</strong> {manchaObj?.nome ?? "—"}
              </p>
              {tecidoObj ? (
                <p className="mt-3 text-muted-foreground">
                  Método citado no catálogo: {tecidoObj.metodo}
                </p>
              ) : null}
              {manchaObj ? (
                <p className="mt-2 text-muted-foreground">Limitação: {manchaObj.limitacoes}</p>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {tecidoObj ? (
                <Link
                  to="/tecidos/$slug"
                  params={{ slug: tecidoObj.slug }}
                  className="btn-primary min-h-12"
                >
                  Abrir ficha do tecido
                </Link>
              ) : null}
              {manchaObj ? (
                <Link
                  to="/manchas/$slug"
                  params={{ slug: manchaObj.slug }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold"
                >
                  Abrir guia da mancha
                </Link>
              ) : null}
              <Link
                to="/fichas"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold"
              >
                Consultar fichas oficiais
              </Link>
              <Link
                to="/ferramentas/diluicao"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold"
              >
                Calculadora de diluição
              </Link>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-primary"
              onClick={() => {
                setPasso(1);
                setPeca(null);
                setTecido(null);
                setMancha(null);
              }}
            >
              Recomeçar
            </button>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
