import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, HelpCircle, MessageSquare, PenLine } from "lucide-react";
import { useState } from "react";

import { AutorLinha, Carregando, Chips, EntrarCTA, Vazio } from "@/components/app/community";
import { AvisoHospedagemEstatica } from "@/components/app/AvisoHospedagemEstatica";
import { supabase } from "@/integrations/supabase/client";
import { apiPerguntas } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";
import { CATEGORIAS_DUVIDA, tempoRelativo } from "@/lib/community";
import { COLUNAS_AUTOR } from "@/lib/community-data";

export const Route = createFileRoute("/perguntas/")({
  head: () => ({
    meta: [
      { title: "Perguntas e respostas técnicas — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Tire dúvidas de higienização de estofados com profissionais experientes: manchas difíceis, tecidos delicados, diluição de produtos e equipamentos.",
      },
      { property: "og:title", content: "Perguntas e respostas técnicas — Guia do Higienizador" },
      { property: "og:description", content: "Dúvidas reais respondidas por higienizadores experientes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerguntasPage,
});

function PerguntasPage() {
  const { user } = useAuth();
  const [categoria, setCategoria] = useState<string | null>(null);
  const [somenteAbertas, setSomenteAbertas] = useState(false);

  const perguntas = useQuery({
    queryKey: ["perguntas", { categoria, somenteAbertas }],
    enabled: isCommunityEnabled(),
    queryFn: async () => {
      if (!isCommunityEnabled()) return [];
      if (usesPhpApi()) return apiPerguntas({ categoria, somenteAbertas });
      let q = supabase
        .from("questions")
        .select(
          `id,titulo,corpo,categoria,resolvida,answers_count,created_at,author:profiles!questions_author_profile_fkey(${COLUNAS_AUTOR})`,
        )
        .eq("oculto", false)
        .order("created_at", { ascending: false })
        .limit(40);
      if (categoria) q = q.eq("categoria", categoria);
      if (somenteAbertas) q = q.eq("resolvida", false);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-7 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Dúvidas</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">Perguntas e respostas</h1>
        <p className="mt-2 text-sm opacity-85">
          Dúvida de serviço real? Pergunte aqui. Quem já passou por isso responde.
        </p>
      </header>

      {!isCommunityEnabled() ? (
        <div className="mt-5">
          <AvisoHospedagemEstatica />
        </div>
      ) : (
        <>
      <div className="mt-5 space-y-3">
        <Chips
          rotulo="Filtrar por categoria"
          itens={CATEGORIAS_DUVIDA.map((c) => ({ slug: c, label: c }))}
          valor={categoria}
          onChange={setCategoria}
        />

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSomenteAbertas((v) => !v)}
            aria-pressed={somenteAbertas}
            className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${
              somenteAbertas ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            Somente sem resposta aceita
          </button>

          {user ? (
            <Link to="/perguntas/nova" className="btn-primary gap-1.5">
              <PenLine className="size-4" aria-hidden />
              Perguntar
            </Link>
          ) : null}
        </div>
      </div>

      {!user ? (
        <div className="mt-4">
          <EntrarCTA mensagem="Entre para perguntar e responder dúvidas técnicas." />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {perguntas.isLoading ? <Carregando linhas={4} /> : null}
        {perguntas.data?.length === 0 ? (
          <Vazio titulo="Nenhuma pergunta por aqui" descricao="Faça a primeira pergunta e ajude quem tem a mesma dúvida." />
        ) : null}

        {perguntas.data?.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              {p.resolvida ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Resolvida
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                  <HelpCircle className="size-3.5" aria-hidden />
                  Em aberto
                </span>
              )}
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{p.categoria}</span>
            </div>

            <h2 className="mt-2 text-base font-bold leading-snug">
              <Link to="/perguntas/$id" params={{ id: p.id }}>
                {p.titulo}
              </Link>
            </h2>
            {p.corpo ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.corpo}</p> : null}

            <div className="mt-3 flex items-center justify-between gap-2">
              {p.author ? <AutorLinha autor={p.author} data={tempoRelativo(p.created_at ?? "")} /> : <span />}
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
                <MessageSquare className="size-4" aria-hidden />
                {p.answers_count}
              </span>
            </div>
          </article>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
