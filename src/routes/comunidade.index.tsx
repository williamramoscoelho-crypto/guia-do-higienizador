import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AbasComunidade, CardPost } from "@/components/app/comunidade-ui";
import { PageHeader, Section } from "@/components/app/ui";
import { postsDemo, tagsPopulares } from "@/data/comunidade";
import { useSessao } from "@/hooks/use-sessao";

export const Route = createFileRoute("/comunidade/")({
  head: () => ({
    meta: [
      { title: "Comunidade de higienizadores — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Feed da comunidade: casos reais, antes e depois, dicas de campo e protocolos compartilhados por profissionais de higienização de estofados.",
      },
      { property: "og:title", content: "Comunidade de higienizadores" },
      { property: "og:description", content: "Casos reais, dicas e protocolos de quem vive a higienização de estofados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { autenticado } = useSessao();
  const [tag, setTag] = useState<string | null>(null);

  const posts = useMemo(
    () => (tag ? postsDemo.filter((p) => p.tags.some((t) => t.includes(tag))) : postsDemo),
    [tag],
  );

  return (
    <div className="pb-6">
      <PageHeader
        eyebrow="Comunidade"
        titulo="Feed dos higienizadores"
        descricao="O que outros profissionais estão resolvendo hoje: casos, antes e depois e dicas testadas em campo."
      />
      <AbasComunidade />

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        {autenticado ? (
          <p className="text-sm text-muted-foreground">
            Publicar no feed chega em breve. Enquanto isso, participe respondendo nas{" "}
            <Link to="/comunidade/perguntas" className="font-semibold text-primary">
              perguntas abertas
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold">Entre para participar</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Com a conta você acompanha o feed, responde dúvidas e mantém seu perfil no diretório.
            </p>
            <Link to="/auth" search={{ redirect: "/comunidade" }} className="btn-primary mt-3 inline-flex min-h-11 px-5">
              Entrar ou criar conta
            </Link>
          </>
        )}
      </div>

      <Section titulo="Assuntos">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag(null)}
            aria-pressed={tag === null}
            className={
              tag === null
                ? "min-h-9 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground"
                : "min-h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground"
            }
          >
            Tudo
          </button>
          {tagsPopulares.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t === tag ? null : t)}
              aria-pressed={t === tag}
              className={
                t === tag
                  ? "min-h-9 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground"
                  : "min-h-9 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground"
              }
            >
              #{t}
            </button>
          ))}
        </div>
      </Section>

      <Section titulo={`Publicações (${posts.length})`}>
        <div className="grid gap-3">
          {posts.map((p) => (
            <CardPost key={p.id} post={p} />
          ))}
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Nenhuma publicação com essa tag ainda.
            </p>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
