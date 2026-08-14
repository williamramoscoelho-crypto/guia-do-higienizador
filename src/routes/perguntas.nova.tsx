import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { EntrarCTA } from "@/components/app/community";
import { supabase } from "@/integrations/supabase/client";
import { apiCriarPergunta } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usesPhpApi } from "@/lib/backend";
import { CATEGORIAS_DUVIDA } from "@/lib/community";

export const Route = createFileRoute("/perguntas/nova")({
  head: () => ({
    meta: [
      { title: "Fazer uma pergunta — Guia do Higienizador" },
      { name: "description", content: "Descreva sua dúvida técnica e receba respostas de higienizadores experientes." },
      { property: "og:title", content: "Fazer uma pergunta — Guia do Higienizador" },
      { property: "og:description", content: "Dúvidas técnicas respondidas pela comunidade." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NovaPergunta,
});

const perguntaSchema = z.object({
  titulo: z.string().trim().min(10, "Escreva um título com ao menos 10 caracteres.").max(140, "Máximo de 140 caracteres."),
  corpo: z.string().trim().max(3000, "Máximo de 3000 caracteres.").optional(),
  categoria: z.enum(CATEGORIAS_DUVIDA as unknown as [string, ...string[]]),
});

function NovaPergunta() {
  const { user, carregando } = useAuth();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_DUVIDA[0]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (carregando) return <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>;
  if (!user) {
    return (
      <div className="py-10">
        <EntrarCTA mensagem="Entre na sua conta para fazer uma pergunta." />
      </div>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const parsed = perguntaSchema.safeParse({ titulo, corpo, categoria });
    if (!parsed.success) return setErro(parsed.error.issues[0]?.message ?? "Revise os campos.");

    setEnviando(true);
    try {
      const data = usesPhpApi()
        ? await apiCriarPergunta({
            titulo: parsed.data.titulo,
            corpo: parsed.data.corpo,
            categoria: parsed.data.categoria,
          })
        : (
            await supabase
              .from("questions")
              .insert({
                author_id: user!.id,
                titulo: parsed.data.titulo,
                corpo: parsed.data.corpo || null,
                categoria: parsed.data.categoria,
              })
              .select("id")
              .single()
          ).data;
      if (!data?.id) throw new Error("fail");
      void navigate({ to: "/perguntas/$id", params: { id: data.id } });
    } catch {
      setErro("Não foi possível enviar sua pergunta agora.");
    }
    setEnviando(false);
  }

  return (
    <div className="pb-6">
      <header className="pt-6">
        <h1 className="text-2xl font-bold leading-tight">Fazer uma pergunta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quanto mais contexto (tecido, mancha, produto já usado), melhor a resposta.
        </p>
      </header>

      <form onSubmit={enviar} className="mt-5 grid gap-4">
        <div>
          <label htmlFor="q-titulo" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pergunta
          </label>
          <input
            id="q-titulo"
            value={titulo}
            maxLength={140}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Como remover mancha de caneta em sofá de camurça?"
            className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="q-categoria" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categoria
          </label>
          <select
            id="q-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
          >
            {CATEGORIAS_DUVIDA.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="q-corpo" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Detalhes (opcional)
          </label>
          <textarea
            id="q-corpo"
            value={corpo}
            maxLength={3000}
            onChange={(e) => setCorpo(e.target.value)}
            className="min-h-40 w-full rounded-xl border border-border bg-card p-3 text-sm"
          />
        </div>

        {erro ? (
          <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        ) : null}

        <button type="submit" disabled={enviando} className="btn-primary w-full justify-center disabled:opacity-60">
          {enviando ? "Enviando…" : "Publicar pergunta"}
        </button>
      </form>
    </div>
  );
}
