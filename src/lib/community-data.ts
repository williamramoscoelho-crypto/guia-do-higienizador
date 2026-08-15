import type { AutorResumo } from "@/components/app/community";
import type { PostFeed } from "@/components/app/PostCard";
import {
  apiInteracoes,
  apiListarPosts,
  apiPerfilHandle,
  apiPontos,
} from "@/lib/api";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";

/** Colunas públicas do perfil embutidas em cada conteúdo. */
export const COLUNAS_AUTOR =
  "id,handle,nome,nome_profissional,avatar_url,cidade,estado,mostrar_cidade,perfil_publico";

export const SELECT_POST = `id,kind,titulo,corpo,imagens,created_at,likes_count,comments_count,group_id,author:profiles!posts_author_profile_fkey(${COLUNAS_AUTOR})`;

export interface FiltroFeed {
  kind?: string | null | undefined;
  groupId?: string | null | undefined;
  autorId?: string | null | undefined;
  ordem?: "recentes" | "populares" | undefined;
  limite?: number | undefined;
}

function vazioInteracoes() {
  return { curtidos: new Set<string>(), salvos: new Set<string>() };
}

async function supabaseClient() {
  const m = await import("@/integrations/supabase/client");
  return m.supabase;
}

/** Lê o feed público respeitando as políticas de acesso do banco. */
export async function buscarPosts(filtro: FiltroFeed = {}): Promise<PostFeed[]> {
  if (!isCommunityEnabled()) return [];
  if (typeof window === "undefined") return [];
  if (usesPhpApi()) return apiListarPosts(filtro);

  const supabase = await supabaseClient();
  let q = supabase.from("posts").select(SELECT_POST).is("deleted_at", null).eq("oculto", false);

  if (filtro.kind) q = q.eq("kind", filtro.kind as never);
  if (filtro.groupId) q = q.eq("group_id", filtro.groupId);
  if (filtro.autorId) q = q.eq("author_id", filtro.autorId);

  q =
    filtro.ordem === "populares"
      ? q.order("likes_count", { ascending: false }).order("created_at", { ascending: false })
      : q.order("created_at", { ascending: false });

  const { data, error } = await q.limit(filtro.limite ?? 30);
  if (error) throw error;
  return (data ?? []) as unknown as PostFeed[];
}

/** Ids de posts curtidos/salvos pelo usuário atual, para exibir o estado dos botões. */
export async function buscarInteracoes(userId: string | undefined, postIds: string[]) {
  if (!isCommunityEnabled() || !userId || postIds.length === 0) return vazioInteracoes();
  if (typeof window === "undefined") return vazioInteracoes();
  if (usesPhpApi()) return apiInteracoes(postIds);

  const supabase = await supabaseClient();
  const [curtidas, salvos] = await Promise.all([
    supabase.from("post_likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
    supabase.from("post_saves").select("post_id").eq("user_id", userId).in("post_id", postIds),
  ]);
  return {
    curtidos: new Set((curtidas.data ?? []).map((r) => r.post_id)),
    salvos: new Set((salvos.data ?? []).map((r) => r.post_id)),
  };
}

export async function buscarPerfilPorHandle(handle: string): Promise<AutorResumo | null> {
  if (!isCommunityEnabled()) return null;
  if (typeof window === "undefined") return null;
  if (usesPhpApi()) return (await apiPerfilHandle(handle)) as unknown as AutorResumo;

  const supabase = await supabaseClient();
  const { data } = await supabase.from("profiles").select("*").eq("handle", handle).maybeSingle();
  return (data as unknown as AutorResumo) ?? null;
}

export async function buscarPontos(userId: string): Promise<number> {
  if (!isCommunityEnabled()) return 0;
  if (typeof window === "undefined") return 0;
  if (usesPhpApi()) return apiPontos(userId);

  const supabase = await supabaseClient();
  const { data } = await supabase.from("user_points").select("pontos").eq("user_id", userId).maybeSingle();
  return data?.pontos ?? 0;
}

export { isCommunityEnabled };
