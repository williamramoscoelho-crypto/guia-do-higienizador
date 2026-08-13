import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { lovable } from "@/integrations/lovable/index";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({
  modo: z.enum(["entrar", "criar", "recuperar"]).catch("entrar"),
  proximo: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar na comunidade — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Crie sua conta gratuita no Guia do Higienizador e participe da comunidade brasileira de higienizadores e profissionais de estética automotiva.",
      },
      { property: "og:title", content: "Entrar na comunidade — Guia do Higienizador" },
      { property: "og:description", content: "Aprenda, pergunte e compartilhe experiências com outros profissionais." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

/** Validação de entrada: aplicada antes de qualquer chamada ao backend. */
const credenciais = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").max(255),
  senha: z.string().min(8, "A senha precisa ter ao menos 8 caracteres.").max(72),
  nome: z.string().trim().min(2, "Informe seu nome.").max(80).optional(),
});

function AuthPage() {
  const { modo, proximo } = Route.useSearch();
  const navigate = useNavigate();
  const { user, carregando } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  /** Só aceita caminho relativo do próprio site — nunca URL externa. */
  const destino = proximo && proximo.startsWith("/") && !proximo.startsWith("//") ? proximo : "/painel";

  useEffect(() => {
    if (!carregando && user) void navigate({ to: destino, replace: true });
  }, [carregando, user, destino, navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (!isSupabaseConfigured()) {
      return setErro("A comunidade ainda não está conectada neste ambiente. O guia técnico continua disponível.");
    }

    if (modo === "recuperar") {
      const emailOk = z.string().trim().email().safeParse(email);
      if (!emailOk.success) return setErro("Informe um e-mail válido.");
      setEnviando(true);
      const { error } = await supabase.auth.resetPasswordForEmail(emailOk.data, {
        redirectTo: `${window.location.origin}/perfil`,
      });
      setEnviando(false);
      if (error) return setErro(error.message);
      return setAviso("Enviamos um link de redefinição para o seu e-mail.");
    }

    const parsed = credenciais.safeParse({ email, senha, ...(modo === "criar" ? { nome } : {}) });
    if (!parsed.success) return setErro(parsed.error.issues[0]?.message ?? "Dados inválidos.");

    setEnviando(true);
    if (modo === "criar") {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.senha,
        options: {
          emailRedirectTo: `${window.location.origin}${destino}`,
          data: { nome: parsed.data.nome },
        },
      });
      setEnviando(false);
      if (error) return setErro(traduzirErro(error.message));
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.senha,
    });
    setEnviando(false);
    if (error) setErro(traduzirErro(error.message));
  }

  async function entrarComGoogle() {
    setErro(null);
    const resultado = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (resultado.error) setErro("Não foi possível entrar com o Google. Tente novamente.");
  }

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-8 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Comunidade</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">
          {modo === "criar" ? "Criar minha conta" : modo === "recuperar" ? "Recuperar senha" : "Entrar na comunidade"}
        </h1>
        <p className="mt-2 text-sm opacity-85">
          Aprenda, consulte, compartilhe experiências e evolua junto com outros profissionais.
        </p>
      </header>

      <form onSubmit={enviar} className="mt-6 grid gap-3">
        {modo === "criar" ? (
          <Campo id="nome" label="Nome" value={nome} onChange={setNome} autoComplete="name" maxLength={80} />
        ) : null}
        <Campo id="email" label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" maxLength={255} />
        {modo !== "recuperar" ? (
          <Campo
            id="senha"
            label="Senha"
            type="password"
            value={senha}
            onChange={setSenha}
            autoComplete={modo === "criar" ? "new-password" : "current-password"}
            maxLength={72}
          />
        ) : null}

        {erro ? (
          <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        ) : null}
        {aviso ? (
          <p role="status" className="rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-success">
            {aviso}
          </p>
        ) : null}

        <button type="submit" disabled={enviando} className="btn-primary w-full justify-center disabled:opacity-60">
          {enviando ? "Enviando…" : modo === "criar" ? "Criar conta" : modo === "recuperar" ? "Enviar link" : "Entrar"}
        </button>
      </form>

      {modo !== "recuperar" ? (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={entrarComGoogle}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold"
          >
            Continuar com Google
          </button>
        </>
      ) : null}

      <div className="mt-6 grid gap-2 text-center text-sm">
        {modo === "entrar" ? (
          <>
            <Link to="/auth" search={{ modo: "criar" }} className="font-semibold text-primary">
              Ainda não tenho conta
            </Link>
            <Link to="/auth" search={{ modo: "recuperar" }} className="text-muted-foreground">
              Esqueci minha senha
            </Link>
          </>
        ) : (
          <Link to="/auth" search={{ modo: "entrar" }} className="font-semibold text-primary">
            Já tenho conta
          </Link>
        )}
        <Link to="/" className="text-muted-foreground">
          Explorar conteúdos sem entrar
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ao continuar você concorda com o{" "}
        <Link to="/codigo-da-comunidade" className="underline">
          Código da Comunidade
        </Link>
        .
      </p>
    </div>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:border-primary"
      />
    </div>
  );
}

function traduzirErro(mensagem: string): string {
  if (/invalid login credentials/i.test(mensagem)) return "E-mail ou senha incorretos.";
  if (/user already registered/i.test(mensagem)) return "Já existe uma conta com este e-mail.";
  if (/pwned|compromised/i.test(mensagem)) return "Essa senha apareceu em vazamentos públicos. Escolha outra.";
  return mensagem;
}
