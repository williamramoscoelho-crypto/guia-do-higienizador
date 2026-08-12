import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { perguntasIdentificacao } from "@/data/conteudo";
import { tecidos } from "@/data/tecidos";
import { Aviso, Breadcrumbs, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/identificar")({
  head: () => ({
    meta: [
      { title: "Identificar o tecido — Guia do Higienizador" },
      {
        name: "description",
        content: "Assistente de identificação provável por aparência, toque e absorção. Confirme sempre pela etiqueta.",
      },
      { property: "og:title", content: "Assistente de identificação de tecido" },
      { property: "og:url", content: "/identificar" },
    ],
    links: [{ rel: "canonical", href: "/identificar" }],
  }),
  component: Identificar,
});

function Identificar() {
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const passo = Object.keys(respostas).length;
  const atual = perguntasIdentificacao[passo];

  const ranking = useMemo(() => {
    const score = new Map<string, number>();
    for (const pergunta of perguntasIdentificacao) {
      const idx = respostas[pergunta.id];
      if (idx === undefined) continue;
      for (const slug of pergunta.opcoes[idx]?.tecidos ?? []) {
        score.set(slug, (score.get(slug) ?? 0) + 1);
      }
    }
    return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [respostas]);

  const concluiu = passo >= perguntasIdentificacao.length;

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Identificar tecido" }]} />
      <PageHeader
        titulo="Identificar o tecido"
        eyebrow="Assistente"
        descricao="Responda o que você vê e sente. O resultado é uma hipótese — nunca uma certeza absoluta."
      />

      {!concluiu && atual ? (
        <Section titulo={`Pergunta ${passo + 1} de ${perguntasIdentificacao.length}`}>
          <h2 className="mb-3 text-lg font-bold">{atual.pergunta}</h2>
          <ul className="grid gap-2">
            {atual.opcoes.map((op, i) => (
              <li key={op.label}>
                <button
                  type="button"
                  onClick={() => setRespostas((prev) => ({ ...prev, [atual.id]: i }))}
                  className="card-tap min-h-14 w-full rounded-2xl border border-border bg-card px-4 text-left text-sm font-medium hover:border-primary/50"
                >
                  {op.label}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <Section titulo="Possíveis tipos de tecido">
          <Aviso titulo="Identificação provável — confirme antes de aplicar produtos">
            Sem etiqueta ou informação do fabricante, trate o resultado como hipótese. Use o método mais conservador e
            teste em área discreta.
          </Aviso>
          <ul className="mt-4 grid gap-2">
            {ranking.map(([slug, n]) => {
              const t = tecidos.find((x) => x.slug === slug);
              if (!t) return null;
              return (
                <li key={slug}>
                  <ItemLink
                    to="/tecidos/$slug"
                    params={{ slug }}
                    emoji={t.emoji}
                    titulo={t.nome}
                    descricao={`${n} indício(s) nas suas respostas — ${t.resumo}`}
                  />
                </li>
              );
            })}
          </ul>
          {ranking.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Não foi possível cruzar as respostas. Procure a etiqueta ou consulte o fabricante.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setRespostas({})}
            className="mt-4 min-h-11 rounded-full border border-border px-4 text-sm"
          >
            Recomeçar
          </button>
        </Section>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Prefere ir direto? Veja a lista completa em{" "}
        <Link to="/tecidos" className="text-primary underline">
          Tipos de tecidos
        </Link>
        .
      </p>
    </div>
  );
}
