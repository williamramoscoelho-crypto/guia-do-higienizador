import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader, InfoCard } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";

const buscaSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (busca) => buscaSchema.parse(busca),
  head: () => ({
    meta: [
      { title: "Entrar na comunidade — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Acesse a comunidade do Guia do Higienizador para publicar casos, tirar dúvidas com profissionais e manter seu perfil no diretório.",
      },
      { property: "og:title", content: "Entrar na comunidade — Guia do Higienizador" },
      { property: "og:description", content: "Login de profissionais de higienização de estofados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaAuth,
});

function PaginaAuth() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const destino = redirect && redirect.startsWith("/") ? redirect : "/comunidade";
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: destino, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sessao) => {
      if (sessao?.user) void navigate({ to: destino, replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [destino, navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      if (modo === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin, data: { nome } },
        });
        if (error) throw error;
        if (!data.session) {
          setConfirmar(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
    } catch (erro) {
      toast.error((erro as Error).message || "Não foi possível concluir. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pb-6">
      <PageHeader
        eyebrow="Comunidade"
        titulo={modo === "entrar" ? "Entrar" : "Criar conta"}
        descricao="Sua conta libera o feed, as perguntas, o perfil profissional e o diretório de higienizadores."
      />

      {confirmar ? (
        <InfoCard className="mt-6">
          <h2 className="text-base font-bold">Confirme seu e-mail</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Enviamos um link de confirmação para <strong>{email}</strong>. Abra o link e volte aqui para entrar na
            comunidade.
          </p>
        </InfoCard>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1.5">
            <button
              type="button"
              onClick={() => setModo("entrar")}
              aria-pressed={modo === "entrar"}
              className={
                modo === "entrar"
                  ? "min-h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                  : "min-h-11 rounded-xl text-sm font-medium"
              }
            >
              Já tenho conta
            </button>
            <button
              type="button"
              onClick={() => setModo("criar")}
              aria-pressed={modo === "criar"}
              className={
                modo === "criar"
                  ? "min-h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                  : "min-h-11 rounded-xl text-sm font-medium"
              }
            >
              Criar conta
            </button>
          </div>


          <form onSubmit={enviar} className="grid gap-3">
            {modo === "criar" ? (
              <div>
                <label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nome
                </label>
                <input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  required
                  className="mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="senha" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={modo === "criar" ? "new-password" : "current-password"}
                minLength={6}
                required
                className="mt-1 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="btn-primary mt-2 min-h-12 w-full disabled:opacity-60"
            >
              {enviando ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : modo === "entrar" ? (
                <LogIn className="size-4" aria-hidden />
              ) : (
                <UserPlus className="size-4" aria-hidden />
              )}
              {modo === "entrar" ? "Entrar" : "Criar minha conta"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
