/**
 * Camada de sessão do Guia do Higienizador.
 *
 * Por que um provider e não `useQuery` solto em cada tela: a sessão é lida em
 * praticamente todo componente da comunidade (curtir, comentar, seguir). Um
 * provider único evita N chamadas a `getSession()` por render e centraliza a
 * invalidação de cache quando o usuário entra ou sai.
 */
import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export interface PerfilAtual {
  id: string;
  handle: string | null;
  nome: string;
  nome_profissional: string | null;
  avatar_url: string | null;
  cidade: string | null;
  estado: string | null;
  perfil_publico: boolean;
  suspenso: boolean;
}

interface AuthState {
  /** `undefined` enquanto a sessão ainda não foi resolvida no cliente. */
  carregando: boolean;
  session: Session | null;
  user: User | null;
  perfil: PerfilAtual | null;
  pontos: number;
  isStaff: boolean;
  isAdmin: boolean;
  recarregarPerfil: () => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState<PerfilAtual | null>(null);
  const [pontos, setPontos] = useState(0);
  const [papeis, setPapeis] = useState<string[]>([]);

  const carregarDadosDoUsuario = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setPerfil(null);
      setPapeis([]);
      setPontos(0);
      return;
    }

    // Executa em paralelo: são três leituras independentes.
    const [perfilRes, papeisRes, pontosRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, handle, nome, nome_profissional, avatar_url, cidade, estado, perfil_publico, suspenso")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("user_points").select("pontos").eq("user_id", userId).maybeSingle(),
    ]);

    setPerfil((perfilRes.data as PerfilAtual | null) ?? null);
    setPapeis((papeisRes.data ?? []).map((r) => r.role as string));
    setPontos(pontosRes.data?.pontos ?? 0);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCarregando(false);
      return;
    }

    let ativo = true;

    // Assina antes de ler a sessão para não perder o evento inicial.
    const { data: sub } = supabase.auth.onAuthStateChange((event, novaSessao) => {
      if (!ativo) return;
      setSession(novaSessao);

      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      // Evita atualizar estado dentro do callback síncrono do Supabase.
      setTimeout(() => {
        if (!ativo) return;
        void carregarDadosDoUsuario(novaSessao?.user?.id);
        if (event === "SIGNED_OUT") queryClient.clear();
        else void queryClient.invalidateQueries();
      }, 0);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!ativo) return;
      setSession(data.session);
      await carregarDadosDoUsuario(data.session?.user?.id);
      if (ativo) setCarregando(false);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, [carregarDadosDoUsuario, queryClient]);

  const recarregarPerfil = useCallback(async () => {
    await carregarDadosDoUsuario(session?.user?.id);
  }, [carregarDadosDoUsuario, session?.user?.id]);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    setPerfil(null);
    setPapeis([]);
    queryClient.clear();
  }, [queryClient]);

  const valor = useMemo<AuthState>(
    () => ({
      carregando,
      session,
      user: session?.user ?? null,
      perfil,
      pontos,
      isStaff: papeis.includes("admin") || papeis.includes("moderator"),
      isAdmin: papeis.includes("admin"),
      recarregarPerfil,
      sair,
    }),
    [carregando, session, perfil, pontos, papeis, recarregarPerfil, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
