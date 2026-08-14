import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { EntrarCTA } from "@/components/app/community";
import { supabase } from "@/integrations/supabase/client";
import { apiCriarPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usesPhpApi } from "@/lib/backend";
import { TIPOS_POST } from "@/lib/community";

export const Route = createFileRoute("/comunidade/novo")({
  head: () => ({
    meta: [
      { title: "Nova publicação — Guia do Higienizador" },
      { name: "description", content: "Compartilhe um antes e depois, uma dica prática ou uma dúvida com a comunidade." },
      { property: "og:title", content: "Nova publicação — Guia do Higienizador" },
      { property: "og:description", content: "Compartilhe seu trabalho e aprenda com outros higienizadores." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NovoPost,
});

/** Limites alinhados às restrições do banco e à leitura no celular. */
const postSchema = z.object({
  kind: z.enum(TIPOS_POST.map((t) => t.slug) as [string, ...string[]]),
  titulo: z.string().trim().max(120, "Título com no máximo 120 caracteres.").optional(),
  corpo: z.string().trim().min(10, "Escreva ao menos 10 caracteres.").max(4000, "Máximo de 4000 caracteres."),
  tags: z.array(z.string().trim().min(2).max(24)).max(5, "No máximo 5 tags."),
});

function NovoPost() {
  const { user, carregando } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState<string>("discussao");
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [tagsTexto, setTagsTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (carregando) return <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>;
  if (!user) {
    return (
      <div className="py-10">
        <EntrarCTA mensagem="Entre na sua conta para publicar na comunidade." />
      </div>
    );
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const tags = tagsTexto
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

    const parsed = postSchema.safeParse({ kind, titulo, corpo, tags });
    if (!parsed.success) return setErro(parsed.error.issues[0]?.message ?? "Revise os campos.");

    setEnviando(true);
    try {
      const data = usesPhpApi()
        ? await apiCriarPost({
            kind: parsed.data.kind,
            titulo: parsed.data.titulo || undefined,
            corpo: parsed.data.corpo,
            tags: parsed.data.tags,
          })
        : (
            await supabase
              .from("posts")
              .insert({
                author_id: user!.id,
                kind: parsed.data.kind as never,
                titulo: parsed.data.titulo || null,
                corpo: parsed.data.corpo,
                tags: parsed.data.tags,
              })
              .select("id")
              .single()
          ).data;
      if (!data?.id) throw new Error("fail");
      void navigate({ to: "/comunidade/post/$id", params: { id: data.id } });
    } catch {
      setErro("Não foi possível publicar agora. Tente novamente.");
    }
    setEnviando(false);
  }

  return (
    <div className="pb-6">
      <header className="pt-6">
        <h1 className="text-2xl font-bold leading-tight">Nova publicação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conteúdo técnico e respeitoso. Nada de venda agressiva ou promessa milagrosa.
        </p>
      </header>

      <form onSubmit={publicar} className="mt-5 grid gap-4">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</legend>
          <div className="flex flex-wrap gap-2">
            {TIPOS_POST.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setKind(t.slug)}
                aria-pressed={kind === t.slug}
                className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${
                  kind === t.slug ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span aria-hidden>{t.emoji} </span>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="titulo" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Título (opcional)
          </label>
          <input
            id="titulo"
            value={titulo}
            maxLength={120}
            onChange={(e) => setTitulo(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="corpo" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Conteúdo
          </label>
          <textarea
            id="corpo"
            value={corpo}
            maxLength={4000}
            onChange={(e) => setCorpo(e.target.value)}
            placeholder="Conte o contexto: tipo de tecido, mancha, produto usado, diluição, tempo de ação e resultado."
            className="min-h-44 w-full rounded-xl border border-border bg-card p-3 text-sm"
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">{corpo.length}/4000</p>
        </div>

        <div>
          <label htmlFor="tags" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tags (separadas por vírgula)
          </label>
          <input
            id="tags"
            value={tagsTexto}
            maxLength={140}
            onChange={(e) => setTagsTexto(e.target.value)}
            placeholder="sofá, gordura, extratora"
            className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
          />
        </div>

        {erro ? (
          <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        ) : null}

        <button type="submit" disabled={enviando} className="btn-primary w-full justify-center disabled:opacity-60">
          {enviando ? "Publicando…" : "Publicar"}
        </button>
      </form>
    </div>
  );
}
