import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, Globe, MapPin } from "lucide-react";

import { Avatar, Carregando, NivelBadge, Vazio } from "@/components/app/community";
import { AvisoHospedagemEstatica } from "@/components/app/AvisoHospedagemEstatica";
import { DenunciarBotao } from "@/components/app/DenunciarBotao";
import { PostCard } from "@/components/app/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { apiPerfilHandle, apiSeguir } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";
import { buscarInteracoes, buscarPontos, buscarPosts } from "@/lib/community-data";

export const Route = createFileRoute("/p/$handle")({
  head: ({ params }) => {
    const titulo = `@${params.handle} — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        {
          name: "description",
          content: `Perfil profissional de @${params.handle} na comunidade Guia do Higienizador: especialidades, experiência e publicações técnicas.`,
        },
        { property: "og:title", content: titulo },
        { property: "og:description", content: "Perfil profissional na comunidade de higienização de estofados." },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PerfilPublico,
});

function PerfilPublico() {
  const { handle } = Route.useParams();
  const { user } = useAuth();

  const perfil = useQuery({
    queryKey: ["perfil", handle],
    enabled: isCommunityEnabled(),
    queryFn: async () => {
      if (!isCommunityEnabled()) return null;
      if (usesPhpApi()) return apiPerfilHandle(handle);
      const { data, error } = await supabase.from("profiles").select("*").eq("handle", handle).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const perfilId = perfil.data?.id;

  const pontos = useQuery({
    queryKey: ["pontos", perfilId],
    queryFn: () => buscarPontos(perfilId!),
    enabled: Boolean(perfilId),
  });

  const posts = useQuery({
    queryKey: ["posts", { autorId: perfilId }],
    queryFn: () => buscarPosts({ autorId: perfilId }),
    enabled: Boolean(perfilId),
  });

  const ids = (posts.data ?? []).map((p) => p.id);
  const interacoes = useQuery({
    queryKey: ["interacoes", user?.id, ids],
    queryFn: () => buscarInteracoes(user?.id, ids),
    enabled: Boolean(user) && ids.length > 0,
  });

  const seguindo = useQuery({
    queryKey: ["seguindo", user?.id, perfilId],
    queryFn: async () => {
      if (usesPhpApi()) return Boolean((perfil.data as { seguindo?: boolean } | undefined)?.seguindo);
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user!.id)
        .eq("following_id", perfilId!)
        .maybeSingle();
      return Boolean(data);
    },
    enabled: Boolean(user && perfilId && user.id !== perfilId),
  });

  async function alternarSeguir() {
    if (!user || !perfilId) return;
    if (usesPhpApi()) await apiSeguir(perfilId, !seguindo.data);
    else if (seguindo.data) await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", perfilId);
    else await supabase.from("follows").insert({ follower_id: user.id, following_id: perfilId });
    void seguindo.refetch();
    void perfil.refetch();
  }

  if (!isCommunityEnabled()) {
    return (
      <div className="pt-6">
        <AvisoHospedagemEstatica />
      </div>
    );
  }

  if (perfil.isLoading) return <div className="pt-6"><Carregando linhas={2} /></div>;
  if (!perfil.data) {
    return (
      <div className="pt-10">
        <Vazio titulo="Perfil não encontrado" descricao="Este perfil pode ser privado ou o endereço está incorreto." />
        <div className="mt-4 text-center">
          <Link to="/profissionais" className="btn-primary">
            Ver profissionais
          </Link>
        </div>
      </div>
    );
  }

  const p = perfil.data;
  const local = p.mostrar_cidade ? [p.cidade, p.estado].filter(Boolean).join(" – ") : null;

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-7 pt-8">
        <div className="flex items-start gap-4">
          <Avatar nome={p.nome} url={p.avatar_url} tamanho="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold leading-tight">{p.nome_profissional || p.nome}</h1>
            <p className="truncate text-sm opacity-80">@{p.handle}</p>
            {local ? (
              <p className="mt-1 flex items-center gap-1 text-xs opacity-80">
                <MapPin className="size-3.5" aria-hidden />
                {local}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <NivelBadge pontos={pontos.data ?? 0} />
          <span className="rounded-full bg-background/25 px-2.5 py-1 text-[11px] font-bold">{pontos.data ?? 0} pontos</span>
        </div>

        {p.bio ? <p className="mt-3 whitespace-pre-wrap text-sm opacity-90">{p.bio}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {user && user.id !== p.id ? (
            <button type="button" onClick={alternarSeguir} className="btn-primary">
              {seguindo.data ? "Seguindo" : "Seguir"}
            </button>
          ) : null}
          {p.mostrar_instagram && p.instagram ? (
            <a
              href={`https://instagram.com/${encodeURIComponent(p.instagram.replace(/^@/, ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-background/30 px-3 text-sm font-semibold"
            >
              <Instagram className="size-4" aria-hidden />
              Instagram
            </a>
          ) : null}
          {p.mostrar_site && p.site ? (
            <a
              href={p.site.startsWith("http") ? p.site : `https://${p.site}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-background/30 px-3 text-sm font-semibold"
            >
              <Globe className="size-4" aria-hidden />
              Site
            </a>
          ) : null}
          <DenunciarBotao alvoTipo="profile" alvoId={p.id} />
        </div>
      </header>

      {p.especialidades.length > 0 ? (
        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Especialidades</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {p.especialidades.map((e) => (
              <li key={e} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
                {e}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="mb-3 text-base font-bold">Publicações</h2>
        {posts.isLoading ? <Carregando linhas={2} /> : null}
        {posts.data?.length === 0 ? <Vazio titulo="Ainda sem publicações" /> : null}
        <div className="grid gap-3">
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
      </section>
    </div>
  );
}
