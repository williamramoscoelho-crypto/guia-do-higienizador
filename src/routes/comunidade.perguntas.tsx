import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { useState } from "react";

import { AbasComunidade, AutorLinha } from "@/components/app/comunidade-ui";
import { PageHeader, Section } from "@/components/app/ui";
import { perguntasDemo } from "@/data/comunidade";
import { useSessao } from "@/hooks/use-sessao";

export const Route = createFileRoute("/comunidade/perguntas")({
  head: () => ({
    meta: [
      { title: "Perguntas e respostas técnicas — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Dúvidas reais de higienização de estofados respondidas por profissionais: pré-spray, pH, odor, equipamentos e precificação.",
      },
      { property: "og:title", content: "Perguntas e respostas de higienização" },
      { property: "og:description", content: "Dúvidas de campo respondidas por higienizadores experientes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perguntas,
});

function Perguntas() {
  const { autenticado } = useSessao();
  const [filtro, setFiltro] = useState<"todas" | "abertas" | "resolvidas">("todas");
  const lista = perguntasDemo.filter((q) =>
    filtro === "todas" ? true : filtro === "abertas" ? !q.resolvida : q.resolvida,
  );

  return (
    <div className="pb-6">
      <PageHeader
        eyebrow="Comunidade"
        titulo="Perguntas e respostas"
        descricao="Pergunte antes de arriscar o estofado do cliente. Respostas de profissionais com anos de campo."
      />
      <AbasComunidade />

      <div className="mt-4 flex gap-2">
        {(["todas", "abertas", "resolvidas"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
            className={
              filtro === f
                ? "min-h-10 flex-1 rounded-xl bg-primary text-sm font-semibold capitalize text-primary-foreground"
                : "min-h-10 flex-1 rounded-xl border border-border text-sm font-medium capitalize text-muted-foreground"
            }
          >
            {f}
          </button>
        ))}
      </div>

      {!autenticado ? (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Quer perguntar?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie sua conta para abrir dúvidas e receber respostas da comunidade.
          </p>
          <Link
            to="/auth"
            search={{ redirect: "/comunidade/perguntas" }}
            className="btn-primary mt-3 inline-flex min-h-11 px-5"
          >
            Entrar ou criar conta
          </Link>
        </div>
      ) : null}

      <Section titulo={`${lista.length} pergunta(s)`}>
        <div className="grid gap-3">
          {lista.map((q) => (
            <article key={q.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <AutorLinha autorId={q.autorId} extra={q.criadoEm} />
              <h3 className="mt-3 flex items-start gap-2 text-base font-bold leading-snug">
                {q.resolvida ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="Resolvida" />
                ) : (
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-label="Em aberto" />
                )}
                {q.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.detalhe}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {q.tags.map((t) => (
                  <li key={t} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    #{t}
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid gap-2">
                {q.respostas.map((r) => (
                  <div
                    key={r.id}
                    className={
                      r.melhor
                        ? "rounded-xl border border-success/50 bg-success/10 p-3"
                        : "rounded-xl border border-border bg-background p-3"
                    }
                  >
                    <AutorLinha autorId={r.autorId} extra={`${r.votos} votos`} />
                    {r.melhor ? (
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-success">Melhor resposta</p>
                    ) : null}
                    <p className="mt-1.5 text-sm leading-relaxed">{r.texto}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
