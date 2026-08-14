/**
 * Cliente HTTP da API PHP do Guia do Higienizador (mesmo origin /api).
 */
import { phpApiBase, usesPhpApi } from "@/lib/backend";
import type { AutorResumo } from "@/components/app/community";
import type { PostFeed } from "@/components/app/PostCard";

const TOKEN_KEY = "gh_token";

export type ApiUser = { id: string; email?: string | null };
export type ApiSession = { access_token: string; user: ApiUser };

export type PerfilResumo = {
  id: string;
  handle: string | null;
  nome: string;
  nome_profissional: string | null;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  perfil_publico: boolean;
  suspenso: boolean;
};

export type PerfilCompleto = PerfilResumo & {
  bio: string | null;
  experiencia: string | null;
  especialidades: string[];
  servicos: string[];
  instagram: string | null;
  site: string | null;
  telefone: string | null;
  whatsapp: string | null;
  mostrar_cidade: boolean;
  mostrar_telefone: boolean;
  mostrar_whatsapp: boolean;
  mostrar_instagram: boolean;
  mostrar_site: boolean;
  permitir_mensagens: boolean;
  pontos?: number;
  seguindo?: boolean;
};

export type ProfissionalCard = {
  id: string;
  handle: string | null;
  nome: string;
  nome_profissional: string | null;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  mostrar_cidade: boolean;
  bio: string | null;
  especialidades: string[];
};

export type Grupo = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  emoji: string;
  tipo: string;
  uf: string | null;
  membro?: boolean;
};

export type Pergunta = {
  id: string;
  titulo: string;
  corpo: string | null;
  categoria: string;
  resolvida: boolean;
  answers_count: number;
  created_at: string;
  author_id: string;
  author: AutorResumo | null;
};

export type Resposta = {
  id: string;
  corpo: string;
  melhor: boolean;
  likes_count: number;
  created_at: string;
  author: AutorResumo | null;
};

export type Notificacao = {
  id: string;
  titulo: string;
  corpo: string | null;
  link: string | null;
  lida: boolean;
  created_at: string;
};

export type Denuncia = {
  id: string;
  alvo_tipo: string;
  alvo_id: string;
  motivo: string;
  detalhe: string | null;
  status: string;
  created_at: string;
};

export type SessaoCompleta = {
  user: ApiUser | null;
  perfil: PerfilResumo | null;
  papeis: string[];
  pontos: number;
  token: string | null;
};

export function lerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function gravarToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* quota */
  }
  window.dispatchEvent(new Event("gh-auth"));
}

function url(path: string, query?: Record<string, string | undefined>) {
  const base = phpApiBase();
  const u = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v) u.searchParams.set(k, v);
    }
  }
  return u.toString();
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    if (j.error) return j.error;
  } catch {
    /* ignore */
  }
  return `A API não respondeu (${res.status}).`;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { query?: Record<string, string | undefined> } = {},
): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("API só no cliente.");
  }
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const token = lerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url(path, init.query), {
    ...init,
    headers,
    credentials: "include",
  });

  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiSessao(): Promise<SessaoCompleta> {
  return apiRequest<SessaoCompleta>("/auth/session");
}

export async function apiSignup(input: {
  email: string;
  password: string;
  nome?: string | undefined;
}): Promise<SessaoCompleta> {
  const s = await apiRequest<SessaoCompleta>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  gravarToken(s.token);
  return s;
}

export async function apiLogin(input: { email: string; password: string }): Promise<SessaoCompleta> {
  const s = await apiRequest<SessaoCompleta>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  gravarToken(s.token);
  return s;
}

export async function apiLogout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    gravarToken(null);
  }
}

export async function apiForgot(email: string) {
  return apiRequest<{ ok: boolean; message?: string }>("/auth/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiReset(token: string, password: string): Promise<SessaoCompleta> {
  const s = await apiRequest<SessaoCompleta>("/auth/reset", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  gravarToken(s.token);
  return s;
}

export async function apiMe(): Promise<PerfilCompleto> {
  return apiRequest<PerfilCompleto>("/me");
}

export async function apiSalvarPerfil(dados: Record<string, unknown>) {
  return apiRequest("/me", { method: "PATCH", body: JSON.stringify(dados) });
}

export type FiltroPosts = {
  kind?: string | null | undefined;
  groupId?: string | null | undefined;
  autorId?: string | null | undefined;
  ordem?: "recentes" | "populares" | undefined;
  limite?: number | undefined;
};

export async function apiListarPosts(filtro: FiltroPosts = {}): Promise<PostFeed[]> {
  return apiRequest<PostFeed[]>("/posts", {
    query: {
      kind: filtro.kind ?? undefined,
      group_id: filtro.groupId ?? undefined,
      author_id: filtro.autorId ?? undefined,
      ordem: filtro.ordem,
      limite: filtro.limite ? String(filtro.limite) : undefined,
    },
  });
}

export async function apiPost(id: string): Promise<PostFeed | null> {
  try {
    return await apiRequest<PostFeed>(`/posts/${id}`);
  } catch {
    return null;
  }
}

export async function apiCriarPost(input: {
  kind: string;
  titulo?: string | undefined;
  corpo: string;
  tags?: string[] | undefined;
  group_id?: string | undefined;
}): Promise<{ id: string }> {
  return apiRequest("/posts", { method: "POST", body: JSON.stringify(input) });
}

export async function apiCurtir(id: string, on: boolean) {
  return apiRequest(`/posts/${id}/like`, { method: on ? "POST" : "DELETE" });
}

export async function apiSalvarPost(id: string, on: boolean) {
  return apiRequest(`/posts/${id}/save`, { method: on ? "POST" : "DELETE" });
}

export async function apiInteracoes(postIds: string[]): Promise<{ curtidos: Set<string>; salvos: Set<string> }> {
  if (postIds.length === 0) return { curtidos: new Set(), salvos: new Set() };
  const r = await apiRequest<{ curtidos: string[]; salvos: string[] }>("/interactions", {
    query: { post_ids: postIds.join(",") },
  });
  return { curtidos: new Set(r.curtidos), salvos: new Set(r.salvos) };
}

export async function apiComentarios(postId: string) {
  return apiRequest<Array<{ id: string; corpo: string; created_at: string; author: AutorResumo | null }>>(
    `/posts/${postId}/comments`,
  );
}

export async function apiComentar(postId: string, corpo: string) {
  return apiRequest(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ corpo }) });
}

export async function apiSalvos(): Promise<PostFeed[]> {
  return apiRequest("/saves");
}

export async function apiPerguntas(filtro: { categoria?: string | null; somenteAbertas?: boolean }): Promise<Pergunta[]> {
  return apiRequest<Pergunta[]>("/questions", {
    query: {
      categoria: filtro.categoria ?? undefined,
      abertas: filtro.somenteAbertas ? "1" : undefined,
    },
  });
}

export async function apiPergunta(id: string): Promise<Pergunta | null> {
  try {
    return await apiRequest<Pergunta>(`/questions/${id}`);
  } catch {
    return null;
  }
}

export async function apiCriarPergunta(input: {
  titulo: string;
  corpo?: string | undefined;
  categoria: string;
}) {
  return apiRequest<{ id: string }>("/questions", { method: "POST", body: JSON.stringify(input) });
}

export async function apiRespostas(questionId: string): Promise<Resposta[]> {
  return apiRequest<Resposta[]>(`/questions/${questionId}/answers`);
}

export async function apiResponder(questionId: string, corpo: string) {
  return apiRequest(`/questions/${questionId}/answers`, { method: "POST", body: JSON.stringify({ corpo }) });
}

export async function apiMelhorResposta(answerId: string) {
  return apiRequest(`/answers/${answerId}/best`, { method: "POST" });
}

export async function apiGrupos(): Promise<Grupo[]> {
  return apiRequest<Grupo[]>("/groups");
}

export async function apiGrupo(slug: string): Promise<Grupo> {
  return apiRequest<Grupo>(`/groups/${slug}`);
}

export async function apiEntrarGrupo(id: string, on: boolean) {
  return apiRequest(`/groups/${id}/join`, { method: on ? "POST" : "DELETE" });
}

export async function apiProfissionais(filtro: {
  uf?: string | undefined;
  especialidade?: string | undefined;
}): Promise<ProfissionalCard[]> {
  return apiRequest<ProfissionalCard[]>("/profiles", {
    query: { uf: filtro.uf || undefined, especialidade: filtro.especialidade || undefined },
  });
}

export async function apiPerfilHandle(handle: string): Promise<PerfilCompleto> {
  return apiRequest<PerfilCompleto>(`/profiles/handle/${encodeURIComponent(handle)}`);
}

export async function apiSeguir(id: string, on: boolean) {
  return apiRequest(`/profiles/${id}/follow`, { method: on ? "POST" : "DELETE" });
}

export async function apiPontos(userId: string): Promise<number> {
  const r = await apiRequest<{ pontos: number }>(`/points/${userId}`);
  return r.pontos;
}

export async function apiNotificacoes(): Promise<Notificacao[]> {
  return apiRequest<Notificacao[]>("/notifications");
}

export async function apiNaoLidas(): Promise<number> {
  const r = await apiRequest<{ count: number }>("/notifications/unread");
  return r.count;
}

export async function apiMarcarLidas() {
  return apiRequest("/notifications/read", { method: "POST" });
}

export async function apiDenunciar(input: {
  alvo_tipo: string;
  alvo_id: string;
  motivo: string;
  detalhe?: string | null;
}) {
  return apiRequest("/reports", { method: "POST", body: JSON.stringify(input) });
}

export async function apiDenuncias(): Promise<Denuncia[]> {
  return apiRequest<Denuncia[]>("/reports");
}

export async function apiReportStatus(id: string, status: string) {
  return apiRequest(`/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function apiOcultar(alvo_tipo: string, alvo_id: string, report_id: string) {
  return apiRequest("/moderation/hide", {
    method: "POST",
    body: JSON.stringify({ alvo_tipo, alvo_id, report_id }),
  });
}

export function endpointIaPhp(): string {
  return `${phpApiBase()}/ia`;
}

export { usesPhpApi };
