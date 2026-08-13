import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { perguntasIdentificacao } from "@/data/conteudo";
import { tecidos } from "@/data/tecidos";
import { Aviso, Breadcrumbs, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/identificar")({
  head: () => ({
    meta: [
      { title: "Identificar o tecido do estofado — Guia do Higienizador" },
      { name: "description", content: "Assistente de identificação por perguntas: pelo, brilho, toque, trama e absorção indicam o tecido mais provável do estofado." },
      { property: "og:title", content: "Identificar o tecido do estofado" },
      { property: "og:description", content: "Responda algumas perguntas e veja o tecido provável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/identificar" },
    ],
    links: [{ rel: "canonical", href: "/identificar" }],
  }),
  component: Identificar,
});

function Identificar() {
  const [respostas, setRespostas] = useState<Record<string, number>>({});

  const pontos: Record<string, number> = {};
  for (const p of perguntasIdentificacao) {
    const idx = respostas[p.id];
    if (idx === undefined) continue;
    for (const slug of p.opcoes[idx]?.tecidos ?? []) {
      pontos[slug] = (pontos[slug] ?? 0) + 1;
    }
  }

  const ranking = Object.entries(pontos)
    .map(([slug, score]) => ({ tecido: tecidos.find((t) => t.slug === slug), score }))
    .filter((r) => r.tecido)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const respondidas = Object.keys(respostas).length;

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Identificar tecido" }]} />
      <PageHeader
        titulo="🔍 Identificar o tecido"
        eyebrow="Assistente"
        descricao="O resultado é uma indicação provável, nunca uma confirmação. A etiqueta continua sendo a fonte oficial."
      />

      <Section titulo="Responda o que conseguir observar">
        <ul className="grid gap-2.5">
          {perguntasIdentificacao.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold">{p.pergunta}</h2>
              <div className="mt-3 grid gap-2">
                {p.opcoes.map((o, i) => {
                  const ativo = respostas[p.id] === i;
                  return (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() =>
                        setRespostas((prev) => {
                          const next = { ...prev };
                          if (next[p.id] === i) delete next[p.id];
                          else next[p.id] = i;
                          return next;
                        })
                      }
                      className={`min-h-12 rounded-xl border px-4 text-left text-sm transition-colors ${
                        ativo ? "border-primary bg-primary/10 font-semibold" : "border-border bg-background"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section titulo="Resultado provável">
        {respondidas === 0 ? (
          <p className="text-sm text-muted-foreground">Responda ao menos uma pergunta para ver as sugestões.</p>
        ) : ranking.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum tecido correspondeu. Procure a etiqueta e trate a peça pelo método mais conservador.
          </p>
        ) : (
          <ul className="grid gap-2">
            {ranking.map((r) => (
              <li key={r.tecido!.slug}>
                <ItemLink
                  to="/tecidos/$slug"
                  params={{ slug: r.tecido!.slug }}
                  emoji={r.tecido!.emoji}
                  titulo={`${r.tecido!.nome} · ${r.score} indício${r.score > 1 ? "s" : ""}`}
                  descricao={r.tecido!.resumo}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section>
        <Aviso titulo="Sem etiqueta, seja conservador">
          Na dúvida entre dois tecidos, use o método mais seguro dos dois: menos água, menos calor e química mais neutra.
        </Aviso>
      </Section>

      <Section>
        <button
          type="button"
          onClick={() => setRespostas({})}
          className="min-h-12 rounded-full border border-border px-5 text-sm font-semibold"
        >
          Recomeçar
        </button>
      </Section>
    </div>
  );
}
