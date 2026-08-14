import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { AutorLinha, Carregando, EntrarCTA, Vazio } from "@/components/app/community";
import { AvisoHospedagemEstatica } from "@/components/app/AvisoHospedagemEstatica";
import { DenunciarBotao } from "@/components/app/DenunciarBotao";
import { PostCard, type PostFeed } from "@/components/app/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { apiComentar, apiComentarios, apiPost } from "@/lib/api";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";
import { useAuth } from "@/lib/auth";
import { tempoRelativo } from "@/lib/community";
import { buscarInteracoes, COLUNAS_AUTOR, SELECT_POST } from "@/lib/community-data";

export const Route = createFileRoute("/comunidade/post/$id")({
  head: () => ({
    meta: [
      { title: "Publicação da comunidade — Guia do Higienizador" },
      { name: "description", content: "Veja a publicação completa, os comentários e a experiência de outros higienizadores." },
      { property: "og:title", content: "Publicação da comunidade — Guia do Higienizador" },
      { property: "og:description", content: "Discussão técnica entre profissionais de higienização de estofados." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostDetalhe,
});

const comentarioSchema = z.string().trim().min(2, "Escreva um comentário.").max(2000, "Máximo de 2000 caracteres.");

function PostDetalhe() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const post = useQuery({
    queryKey: ["post", id],
    enabled: isCommunityEnabled(),
    queryFn: async () => {
      if (!isCommunityEnabled()) return null;
      if (usesPhpApi()) return apiPost(id);
      const { data, error } = await supabase.from("posts").select(SELECT_POST).eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as unknown as PostFeed) ?? null;
    },
  });

  const comentarios = useQuery({
    queryKey: ["comentarios", id],
    enabled: isCommunityEnabled(),
    queryFn: async () => {
      if (!isCommunityEnabled()) return [];
      if (usesPhpApi()) return apiComentarios(id);
      const { data, error } = await supabase
        .from("comments")
        .select(`id,corpo,created_at,author:profiles!comments_author_profile_fkey(${COLUNAS_AUTOR})`)
        .eq("post_id", id)
        .is("deleted_at", null)
        .eq("oculto", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const interacoes = useQuery({
    queryKey: ["interacoes", user?.id, [id]],
    queryFn: () => buscarInteracoes(user?.id, [id]),
    enabled: Boolean(user),
  });

  async function comentar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const parsed = comentarioSchema.safeParse(texto);
    if (!parsed.success) return setErro(parsed.error.issues[0]?.message ?? "Revise o comentário.");

    setEnviando(true);
    try {
      if (usesPhpApi()) await apiComentar(id, parsed.data);
      else {
        const { error } = await supabase.from("comments").insert({ post_id: id, author_id: user!.id, corpo: parsed.data });
        if (error) throw error;
      }
    } catch {
      setEnviando(false);
      return setErro("Não foi possível comentar agora.");
    }
    setEnviando(false);
    setTexto("");
    void comentarios.refetch();
    void post.refetch();
  }

  if (!isCommunityEnabled()) {
    return (
      <div className="pt-6">
        <AvisoHospedagemEstatica />
      </div>
    );
  }

  if (post.isLoading) return <div className="pt-6"><Carregando linhas={2} /></div>;
  if (post.isError || !post.data) {
    return (
      <div className="pt-10">
        <Vazio titulo="Publicação não encontrada" descricao="Ela pode ter sido removida pelo autor ou pela moderação." />
        <div className="mt-4 text-center">
          <Link to="/comunidade" className="btn-primary">
            Voltar ao feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-6 pb-6">
      <PostCard
        post={post.data}
        curtido={interacoes.data?.curtidos.has(id) ?? false}
        salvo={interacoes.data?.salvos.has(id) ?? false}
        onMudou={() => {
          void post.refetch();
          void interacoes.refetch();
        }}
      />

      <section aria-labelledby="comentarios">
        <h2 id="comentarios" className="mb-3 text-base font-bold">
          Comentários ({post.data.comments_count})
        </h2>

        {user ? (
          <form onSubmit={comentar} className="mb-4 grid gap-2">
            <label htmlFor="comentario" className="sr-only">
              Escrever comentário
            </label>
            <textarea
              id="comentario"
              value={texto}
              maxLength={2000}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Contribua com sua experiência…"
              className="min-h-24 w-full rounded-xl border border-border bg-card p-3 text-sm"
            />
            {erro ? (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            ) : null}
            <button type="submit" disabled={enviando} className="btn-primary w-full justify-center disabled:opacity-60">
              {enviando ? "Enviando…" : "Comentar"}
            </button>
          </form>
        ) : (
          <div className="mb-4">
            <EntrarCTA mensagem="Entre para comentar nesta publicação." />
          </div>
        )}

        {comentarios.isLoading ? <Carregando linhas={2} /> : null}
        {comentarios.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a contribuir.</p>
        ) : null}

        <ul className="grid gap-3">
          {comentarios.data?.map((c) => (
            <li key={c.id} className="rounded-2xl border border-border bg-card p-4">
              {c.author ? (
                <AutorLinha
                  autor={c.author}
                  data={tempoRelativo(c.created_at)}
                  extra={<DenunciarBotao alvoTipo="comment" alvoId={c.id} />}
                />
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{c.corpo}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
