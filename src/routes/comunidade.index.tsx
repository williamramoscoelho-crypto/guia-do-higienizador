import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { useState } from "react";

import { Carregando, Chips, EntrarCTA, Vazio } from "@/components/app/community";
import { PostCard } from "@/components/app/PostCard";
import { useAuth } from "@/lib/auth";
import { TIPOS_POST } from "@/lib/community";
import { buscarInteracoes, buscarPosts } from "@/lib/community-data";

export const Route = createFileRoute("/comunidade/")({
  head: () => ({
    meta: [
      { title: "Comunidade de higienizadores — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Feed da comunidade brasileira de higienizadores de estofados: antes e depois, dicas, dúvidas técnicas, bastidores e experiências reais do dia a dia.",
      },
      { property: "og:title", content: "Comunidade de higienizadores — Guia do Higienizador" },
      { property: "og:description", content: "Antes e depois, dicas e dúvidas técnicas entre profissionais de higienização." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComunidadePage,
});

function ComunidadePage() {
  const { user } = useAuth();
  const [tipo, setTipo] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<"recentes" | "populares">("recentes");

  const posts = useQuery({
    queryKey: ["posts", { tipo, ordem }],
    queryFn: () => buscarPosts({ kind: tipo, ordem }),
  });

  const ids = (posts.data ?? []).map((p) => p.id);
  const interacoes = useQuery({
    queryKey: ["interacoes", user?.id, ids],
    queryFn: () => buscarInteracoes(user?.id, ids),
    enabled: Boolean(user) && ids.length > 0,
  });

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-7 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Comunidade</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">O que está rolando na higienização</h1>
        <p className="mt-2 text-sm opacity-85">
          Resultados reais, dicas testadas e dúvidas respondidas por quem vive o dia a dia do serviço.
        </p>
      </header>

      <div className="mt-5 space-y-3">
        <Chips
          rotulo="Filtrar por tipo de publicação"
          itens={TIPOS_POST.map((t) => ({ slug: t.slug, label: t.label, emoji: t.emoji }))}
          valor={tipo}
          onChange={setTipo}
        />

        <div className="flex items-center justify-between">
          <div role="group" aria-label="Ordenar feed" className="flex gap-1 rounded-full border border-border bg-card p-1">
            {(["recentes", "populares"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOrdem(o)}
                aria-pressed={ordem === o}
                className={`min-h-9 rounded-full px-3 text-xs font-semibold ${
                  ordem === o ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                {o === "recentes" ? "Recentes" : "Populares"}
              </button>
            ))}
          </div>

          {user ? (
            <Link to="/comunidade/novo" className="btn-primary gap-1.5">
              <PenLine className="size-4" aria-hidden />
              Publicar
            </Link>
          ) : null}
        </div>
      </div>

      {!user ? (
        <div className="mt-4">
          <EntrarCTA mensagem="Entre para publicar, curtir e comentar com outros profissionais." />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {posts.isLoading ? <Carregando linhas={4} /> : null}
        {posts.isError ? (
          <Vazio titulo="Não foi possível carregar o feed" descricao="Verifique sua conexão e tente novamente." />
        ) : null}
        {posts.data?.length === 0 ? (
          <Vazio
            titulo="Nenhuma publicação por aqui ainda"
            descricao="Seja o primeiro a compartilhar um antes e depois ou uma dica prática."
          />
        ) : null}

        {posts.data?.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            compacto
            curtido={interacoes.data?.curtidos.has(p.id) ?? false}
            salvo={interacoes.data?.salvos.has(p.id) ?? false}
            onMudou={() => {
              void posts.refetch();
              void interacoes.refetch();
            }}
          />
        ))}
      </div>
    </div>
  );
}
