import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Carregando, EntrarCTA, Vazio } from "@/components/app/community";
import { PostCard } from "@/components/app/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { buscarInteracoes, buscarPosts } from "@/lib/community-data";

export const Route = createFileRoute("/grupos/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Grupo ${params.slug} — Guia do Higienizador` },
      {
        name: "description",
        content: `Publicações do grupo ${params.slug} na comunidade Guia do Higienizador: troca de experiências entre higienizadores.`,
      },
      { property: "og:title", content: `Grupo ${params.slug} — Guia do Higienizador` },
      { property: "og:description", content: "Conversas de um grupo da comunidade de higienização." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GrupoDetalhe,
});

function GrupoDetalhe() {
  const { slug } = Route.useParams();
  const { user } = useAuth();

  const grupo = useQuery({
    queryKey: ["grupo", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const grupoId = grupo.data?.id;

  const membro = useQuery({
    queryKey: ["membro", user?.id, grupoId],
    queryFn: async () => {
      const { data } = await supabase
        .from("group_members")
        .select("id")
        .eq("user_id", user!.id)
        .eq("group_id", grupoId!)
        .maybeSingle();
      return Boolean(data);
    },
    enabled: Boolean(user && grupoId),
  });

  const posts = useQuery({
    queryKey: ["posts", { groupId: grupoId }],
    queryFn: () => buscarPosts({ groupId: grupoId }),
    enabled: Boolean(grupoId),
  });

  const ids = (posts.data ?? []).map((p) => p.id);
  const interacoes = useQuery({
    queryKey: ["interacoes", user?.id, ids],
    queryFn: () => buscarInteracoes(user?.id, ids),
    enabled: Boolean(user) && ids.length > 0,
  });

  async function alternarParticipacao() {
    if (!user || !grupoId) return;
    if (membro.data) await supabase.from("group_members").delete().eq("user_id", user.id).eq("group_id", grupoId);
    else await supabase.from("group_members").insert({ user_id: user.id, group_id: grupoId });
    void membro.refetch();
  }

  if (grupo.isLoading) return <div className="pt-6"><Carregando linhas={2} /></div>;
  if (!grupo.data) {
    return (
      <div className="pt-10">
        <Vazio titulo="Grupo não encontrado" />
        <div className="mt-4 text-center">
          <Link to="/grupos" className="btn-primary">
            Ver grupos
          </Link>
        </div>
      </div>
    );
  }

  const g = grupo.data;

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-7 pt-8">
        <span aria-hidden className="text-3xl">
          {g.emoji}
        </span>
        <h1 className="mt-2 text-2xl font-bold leading-tight">{g.nome}</h1>
        {g.descricao ? <p className="mt-2 text-sm opacity-85">{g.descricao}</p> : null}

        <div className="mt-4">
          {user ? (
            <button type="button" onClick={alternarParticipacao} className="btn-primary">
              {membro.data ? "Sair do grupo" : "Participar"}
            </button>
          ) : null}
        </div>
      </header>

      {!user ? (
        <div className="mt-5">
          <EntrarCTA mensagem="Entre para participar do grupo e publicar nele." />
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {posts.isLoading ? <Carregando linhas={2} /> : null}
        {posts.data?.length === 0 ? (
          <Vazio titulo="Nenhuma publicação neste grupo" descricao="Comece a conversa por aqui." />
        ) : null}
        {posts.data?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            compacto
            curtido={interacoes.data?.curtidos.has(post.id) ?? false}
            salvo={interacoes.data?.salvos.has(post.id) ?? false}
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
