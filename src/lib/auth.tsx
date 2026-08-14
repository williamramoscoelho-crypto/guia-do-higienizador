/**
 * Camada de sessão do Guia do Higienizador.
 *
 * Por que um provider e não `useQuery` solto em cada tela: a sessão é lida em
 * praticamente todo componente da comunidade (curtir, comentar, seguir). Um
 * provider único evita N chamadas a `getSession()` por render e centraliza a
 * invalidação de cache quando o usuário entra ou sai.
 */
import { useQueryClient } from "@tanstack/react-query";
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
import { apiLogout, apiSessao, gravarToken, type ApiUser } from "@/lib/api";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";

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

export type SessaoApp = {
  access_token: string;
  user: ApiUser;
};

interface AuthState {
  /** `undefined` enquanto a sessão ainda não foi resolvida no cliente. */
  carregando: boolean;
  session: SessaoApp | null;
  user: ApiUser | null;
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
  const [session, setSession] = useState<SessaoApp | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState<PerfilAtual | null>(null);
  const [pontos, setPontos] = useState(0);
  const [papeis, setPapeis] = useState<string[]>([]);

  const aplicarPhp = useCallback(async () => {
    try {
      const s = await apiSessao();
      if (!s.user) {
        setSession(null);
        setPerfil(null);
        setPapeis([]);
        setPontos(0);
        return;
      }
      setSession({ access_token: s.token ?? "", user: s.user });
      setPerfil(s.perfil);
      setPapeis(s.papeis);
      setPontos(s.pontos);
    } catch {
      setSession(null);
      setPerfil(null);
      setPapeis([]);
      setPontos(0);
    }
  }, []);

  const carregarDadosDoUsuario = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setPerfil(null);
      setPapeis([]);
      setPontos(0);
      return;
    }

    if (usesPhpApi()) {
      await aplicarPhp();
      return;
    }

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
  }, [aplicarPhp]);

  useEffect(() => {
    if (!isCommunityEnabled()) {
      setCarregando(false);
      return;
    }

    let ativo = true;

    if (usesPhpApi()) {
      const onAuth = () => {
        void aplicarPhp().then(() => {
          if (ativo) {
            void queryClient.invalidateQueries();
          }
        });
      };
      window.addEventListener("gh-auth", onAuth);
      void aplicarPhp().then(() => {
        if (ativo) setCarregando(false);
      });
      return () => {
        ativo = false;
        window.removeEventListener("gh-auth", onAuth);
      };
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, novaSessao) => {
      if (!ativo) return;
      setSession(
        novaSessao?.user
          ? { access_token: novaSessao.access_token, user: { id: novaSessao.user.id, email: novaSessao.user.email ?? null } }
          : null,
      );

      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setTimeout(() => {
        if (!ativo) return;
        void carregarDadosDoUsuario(novaSessao?.user?.id);
        if (event === "SIGNED_OUT") queryClient.clear();
        else void queryClient.invalidateQueries();
      }, 0);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!ativo) return;
      const s = data.session;
      setSession(s?.user ? { access_token: s.access_token, user: { id: s.user.id, email: s.user.email ?? null } } : null);
      await carregarDadosDoUsuario(s?.user?.id);
      if (ativo) setCarregando(false);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, [aplicarPhp, carregarDadosDoUsuario, queryClient]);

  const recarregarPerfil = useCallback(async () => {
    if (usesPhpApi()) {
      await aplicarPhp();
      return;
    }
    await carregarDadosDoUsuario(session?.user?.id);
  }, [aplicarPhp, carregarDadosDoUsuario, session?.user?.id]);

  const sair = useCallback(async () => {
    if (usesPhpApi()) await apiLogout();
    else if (isSupabaseConfigured()) await supabase.auth.signOut();
    gravarToken(null);
    setSession(null);
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
