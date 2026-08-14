import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Bookmark, HelpCircle, PenLine, Settings, ShieldCheck } from "lucide-react";

import { Avatar, Carregando, NivelBadge, Vazio } from "@/components/app/community";
import { PostCard } from "@/components/app/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { apiNaoLidas, apiSalvos } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usesPhpApi } from "@/lib/backend";
import { nivelPorPontos } from "@/lib/community";
import { buscarInteracoes, buscarPosts, SELECT_POST } from "@/lib/community-data";
import type { PostFeed } from "@/components/app/PostCard";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Meu painel — Guia do Higienizador" },
      { name: "description", content: "Seu resumo na comunidade: pontos, nível, publicações e conteúdos salvos." },
      { property: "og:title", content: "Meu painel — Guia do Higienizador" },
      { property: "og:description", content: "Acompanhe sua evolução na comunidade." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { user, perfil, pontos, isStaff } = useAuth();
  const { atual, proximo, progresso } = nivelPorPontos(pontos);
  const faltam = proximo ? Math.max(0, proximo.min - pontos) : 0;

  const meusPosts = useQuery({
    queryKey: ["posts", { autorId: user?.id }],
    queryFn: () => buscarPosts({ autorId: user?.id, limite: 10 }),
    enabled: Boolean(user),
  });

  const salvos = useQuery({
    queryKey: ["salvos", user?.id],
    queryFn: async () => {
      if (usesPhpApi()) return apiSalvos();
      const { data: refs } = await supabase.from("post_saves").select("post_id").eq("user_id", user!.id).limit(20);
      const ids = (refs ?? []).map((r) => r.post_id);
      if (ids.length === 0) return [] as PostFeed[];
      const { data } = await supabase.from("posts").select(SELECT_POST).in("id", ids).is("deleted_at", null);
      return (data ?? []) as unknown as PostFeed[];
    },
    enabled: Boolean(user),
  });

  const todosIds = [...(meusPosts.data ?? []), ...(salvos.data ?? [])].map((p) => p.id);
  const interacoes = useQuery({
    queryKey: ["interacoes", user?.id, todosIds],
    queryFn: () => buscarInteracoes(user?.id, todosIds),
    enabled: Boolean(user) && todosIds.length > 0,
  });

  const naoLidas = useQuery({
    queryKey: ["nao-lidas", user?.id],
    queryFn: async () => {
      if (usesPhpApi()) return apiNaoLidas();
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("lida", false);
      return count ?? 0;
    },
    enabled: Boolean(user),
  });

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-7 pt-8">
        <div className="flex items-center gap-3">
          <Avatar nome={perfil?.nome ?? "Você"} url={perfil?.avatar_url} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold leading-tight">Olá, {perfil?.nome?.split(" ")[0] ?? "profissional"}</h1>
            {perfil?.handle ? <p className="truncate text-sm opacity-80">@{perfil.handle}</p> : null}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-background/20 p-4">
          <div className="flex items-center justify-between">
            <NivelBadge pontos={pontos} />
            <span className="text-sm font-bold">{pontos} pts</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/30">
            <div className="h-full rounded-full bg-background/80" style={{ width: `${progresso}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-85">
            {proximo ? `Faltam ${faltam} pontos para ${proximo.nome}.` : "Você chegou ao nível máximo. Continue ajudando a comunidade!"}
          </p>
        </div>
      </header>

      <nav aria-label="Atalhos" className="mt-5 grid grid-cols-2 gap-2">
        <Atalho to="/comunidade/novo" Icon={PenLine} rotulo="Publicar" />
        <Atalho to="/perguntas/nova" Icon={HelpCircle} rotulo="Perguntar" />
        <Atalho to="/notificacoes" Icon={Bell} rotulo={`Notificações${naoLidas.data ? ` (${naoLidas.data})` : ""}`} />
        <Atalho to="/perfil" Icon={Settings} rotulo="Editar perfil" />
        {isStaff ? <Atalho to="/moderacao" Icon={ShieldCheck} rotulo="Moderação" /> : null}
      </nav>

      <section className="mt-6">
        <h2 className="mb-3 text-base font-bold">Minhas publicações</h2>
        {meusPosts.isLoading ? <Carregando linhas={2} /> : null}
        {meusPosts.data?.length === 0 ? (
          <Vazio titulo="Você ainda não publicou" descricao="Compartilhe um antes e depois para começar a somar pontos." />
        ) : null}
        <div className="grid gap-3">
          {meusPosts.data?.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              compacto
              curtido={interacoes.data?.curtidos.has(p.id) ?? false}
              salvo={interacoes.data?.salvos.has(p.id) ?? false}
              onMudou={() => void interacoes.refetch()}
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
          <Bookmark className="size-4" aria-hidden />
          Salvos
        </h2>
        {salvos.data?.length === 0 ? <Vazio titulo="Nada salvo ainda" descricao="Toque no marcador de uma publicação para guardá-la." /> : null}
        <div className="grid gap-3">
          {salvos.data?.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              compacto
              curtido={interacoes.data?.curtidos.has(p.id) ?? false}
              salvo
              onMudou={() => {
                void salvos.refetch();
                void interacoes.refetch();
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Atalho({ to, Icon, rotulo }: { to: string; Icon: typeof Bell; rotulo: string }) {
  return (
    <Link
      to={to}
      className="card-tap flex min-h-16 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
    >
      <Icon className="size-4 text-primary" aria-hidden />
      {rotulo}
    </Link>
  );
}
