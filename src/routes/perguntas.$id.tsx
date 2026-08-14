import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { AutorLinha, Carregando, EntrarCTA, Vazio } from "@/components/app/community";
import { AvisoHospedagemEstatica } from "@/components/app/AvisoHospedagemEstatica";
import { DenunciarBotao } from "@/components/app/DenunciarBotao";
import { supabase } from "@/integrations/supabase/client";
import { apiMelhorResposta, apiPergunta, apiResponder, apiRespostas } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";
import { tempoRelativo } from "@/lib/community";
import { COLUNAS_AUTOR } from "@/lib/community-data";

export const Route = createFileRoute("/perguntas/$id")({
  head: () => ({
    meta: [
      { title: "Dúvida técnica — Guia do Higienizador" },
      { name: "description", content: "Veja a dúvida completa e as respostas de profissionais de higienização de estofados." },
      { property: "og:title", content: "Dúvida técnica — Guia do Higienizador" },
      { property: "og:description", content: "Resposta técnica da comunidade de higienizadores." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerguntaDetalhe,
});

const respostaSchema = z.string().trim().min(10, "Escreva ao menos 10 caracteres.").max(3000, "Máximo de 3000 caracteres.");

function PerguntaDetalhe() {
  const { id } = Route.useParams();
  const { user, isStaff } = useAuth();
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const pergunta = useQuery({
    queryKey: ["pergunta", id],
    enabled: isCommunityEnabled(),
    queryFn: async () => {
      if (!isCommunityEnabled()) return null;
      if (usesPhpApi()) return apiPergunta(id);
      const { data, error } = await supabase
        .from("questions")
        .select(
          `id,titulo,corpo,categoria,resolvida,answers_count,created_at,author_id,author:profiles!questions_author_profile_fkey(${COLUNAS_AUTOR})`,
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const respostas = useQuery({
    queryKey: ["respostas", id],
    enabled: isCommunityEnabled(),
    queryFn: async () => {
      if (!isCommunityEnabled()) return [];
      if (usesPhpApi()) return apiRespostas(id);
      const { data, error } = await supabase
        .from("answers")
        .select(`id,corpo,melhor,likes_count,created_at,author:profiles!answers_author_profile_fkey(${COLUNAS_AUTOR})`)
        .eq("question_id", id)
        .eq("oculto", false)
        .order("melhor", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const ehDono = Boolean(user && pergunta.data && user.id === pergunta.data.author_id);

  async function responder(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const parsed = respostaSchema.safeParse(texto);
    if (!parsed.success) return setErro(parsed.error.issues[0]?.message ?? "Revise sua resposta.");

    setEnviando(true);
    try {
      if (usesPhpApi()) await apiResponder(id, parsed.data);
      else {
        const { error } = await supabase.from("answers").insert({ question_id: id, author_id: user!.id, corpo: parsed.data });
        if (error) throw error;
      }
    } catch {
      setEnviando(false);
      return setErro("Não foi possível enviar sua resposta agora.");
    }
    setEnviando(false);
    setTexto("");
    void respostas.refetch();
    void pergunta.refetch();
  }

  /** Somente autor da pergunta ou moderação marcam a melhor resposta. */
  async function marcarMelhor(respostaId: string) {
    if (!ehDono && !isStaff) return;
    if (usesPhpApi()) {
      await apiMelhorResposta(respostaId);
    } else {
      await supabase.from("answers").update({ melhor: false }).eq("question_id", id);
      await supabase.from("answers").update({ melhor: true }).eq("id", respostaId);
      await supabase.from("questions").update({ resolvida: true }).eq("id", id);
    }
    void respostas.refetch();
    void pergunta.refetch();
  }

  if (!isCommunityEnabled()) {
    return (
      <div className="pt-6">
        <AvisoHospedagemEstatica />
      </div>
    );
  }

  if (pergunta.isLoading) return <div className="pt-6"><Carregando linhas={2} /></div>;
  if (!pergunta.data) {
    return (
      <div className="pt-10">
        <Vazio titulo="Pergunta não encontrada" />
        <div className="mt-4 text-center">
          <Link to="/perguntas" className="btn-primary">
            Ver perguntas
          </Link>
        </div>
      </div>
    );
  }

  const q = pergunta.data;

  return (
    <div className="space-y-5 pt-6 pb-6">
      <article className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{q.categoria}</span>
          {q.resolvida ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
              <CheckCircle2 className="size-3.5" aria-hidden />
              Resolvida
            </span>
          ) : null}
        </div>

        <h1 className="mt-2 text-xl font-bold leading-snug">{q.titulo}</h1>
        {q.corpo ? <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{q.corpo}</p> : null}

        <div className="mt-4">
          {q.author ? (
            <AutorLinha
              autor={q.author}
              data={tempoRelativo(q.created_at ?? "")}
              extra={<DenunciarBotao alvoTipo="question" alvoId={q.id} />}
            />
          ) : null}
        </div>
      </article>

      <section aria-labelledby="respostas">
        <h2 id="respostas" className="mb-3 text-base font-bold">
          Respostas ({q.answers_count})
        </h2>

        {user ? (
          <form onSubmit={responder} className="mb-4 grid gap-2">
            <label htmlFor="resposta" className="sr-only">
              Escrever resposta
            </label>
            <textarea
              id="resposta"
              value={texto}
              maxLength={3000}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Explique o passo a passo, produto, diluição e cuidados."
              className="min-h-28 w-full rounded-xl border border-border bg-card p-3 text-sm"
            />
            {erro ? (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            ) : null}
            <button type="submit" disabled={enviando} className="btn-primary w-full justify-center disabled:opacity-60">
              {enviando ? "Enviando…" : "Responder"}
            </button>
          </form>
        ) : (
          <div className="mb-4">
            <EntrarCTA mensagem="Entre para responder esta dúvida." />
          </div>
        )}

        {respostas.isLoading ? <Carregando linhas={2} /> : null}
        {respostas.data?.length === 0 ? <p className="text-sm text-muted-foreground">Ainda sem respostas.</p> : null}

        <ul className="grid gap-3">
          {respostas.data?.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl border p-4 ${r.melhor ? "border-success bg-success/5" : "border-border bg-card"}`}
            >
              {r.melhor ? (
                <p className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-success">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Melhor resposta
                </p>
              ) : null}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{r.corpo}</p>
              <div className="mt-3">
                {r.author ? (
                  <AutorLinha
                    autor={r.author}
                    data={tempoRelativo(r.created_at ?? "")}
                    extra={<DenunciarBotao alvoTipo="answer" alvoId={r.id} />}
                  />
                ) : null}
              </div>
              {(ehDono || isStaff) && !r.melhor ? (
                <button
                  type="button"
                  onClick={() => marcarMelhor(r.id)}
                  className="mt-3 min-h-10 w-full rounded-xl border border-success/50 text-xs font-bold text-success"
                >
                  Marcar como melhor resposta
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
