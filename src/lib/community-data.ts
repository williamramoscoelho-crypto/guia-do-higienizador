import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { AutorResumo } from "@/components/app/community";
import type { PostFeed } from "@/components/app/PostCard";

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

/** Lê o feed público respeitando as políticas de acesso do banco. */
export async function buscarPosts(filtro: FiltroFeed = {}): Promise<PostFeed[]> {
  if (!isSupabaseConfigured()) return [];
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
  if (!isSupabaseConfigured() || !userId || postIds.length === 0) return { curtidos: new Set<string>(), salvos: new Set<string>() };
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
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.from("profiles").select("*").eq("handle", handle).maybeSingle();
  return (data as unknown as AutorResumo) ?? null;
}

export async function buscarPontos(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { data } = await supabase.from("user_points").select("pontos").eq("user_id", userId).maybeSingle();
  return data?.pontos ?? 0;
}
