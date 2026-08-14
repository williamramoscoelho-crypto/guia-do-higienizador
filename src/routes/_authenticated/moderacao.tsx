import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Carregando, Vazio } from "@/components/app/community";
import { supabase } from "@/integrations/supabase/client";
import { apiDenuncias, apiOcultar, apiReportStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usesPhpApi } from "@/lib/backend";
import { tempoRelativo } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/moderacao")({
  head: () => ({
    meta: [
      { title: "Moderação — Guia do Higienizador" },
      { name: "description", content: "Painel interno de análise de denúncias da comunidade." },
      { property: "og:title", content: "Moderação — Guia do Higienizador" },
      { property: "og:description", content: "Análise de denúncias e conteúdo reportado." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Moderacao,
});

/** Tabelas que podem ser ocultadas pela moderação, por tipo de alvo. */
const TABELA_POR_ALVO = {
  post: "posts",
  comment: "comments",
  question: "questions",
  answer: "answers",
} as const;

function Moderacao() {
  const { isStaff } = useAuth();

  const denuncias = useQuery({
    queryKey: ["denuncias"],
    queryFn: async () => {
      if (usesPhpApi()) return apiDenuncias();
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
    enabled: isStaff,
  });

  if (!isStaff) {
    return (
      <div className="pt-10">
        <Vazio titulo="Área restrita" descricao="Somente a equipe de moderação acessa esta página." />
      </div>
    );
  }

  async function ocultar(alvoTipo: string, alvoId: string, reportId: string) {
    if (usesPhpApi()) {
      await apiOcultar(alvoTipo, alvoId, reportId);
    } else {
      const tabela = TABELA_POR_ALVO[alvoTipo as keyof typeof TABELA_POR_ALVO];
      if (!tabela) return;
      await supabase.from(tabela).update({ oculto: true }).eq("id", alvoId);
      await supabase.from("reports").update({ status: "resolvida" }).eq("id", reportId);
    }
    void denuncias.refetch();
  }

  async function descartar(reportId: string) {
    if (usesPhpApi()) await apiReportStatus(reportId, "descartada");
    else await supabase.from("reports").update({ status: "descartada" }).eq("id", reportId);
    void denuncias.refetch();
  }

  return (
    <div className="pb-6">
      <header className="pt-6">
        <h1 className="text-2xl font-bold leading-tight">Moderação</h1>
        <p className="mt-1 text-sm text-muted-foreground">Denúncias recebidas da comunidade.</p>
      </header>

      <div className="mt-5 grid gap-3">
        {denuncias.isLoading ? <Carregando linhas={3} /> : null}
        {denuncias.data?.length === 0 ? <Vazio titulo="Nenhuma denúncia" descricao="Tudo tranquilo por aqui." /> : null}

        {denuncias.data?.map((d) => (
          <article key={d.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{d.alvo_tipo}</span>
              <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-destructive">{d.motivo}</span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{d.status}</span>
              <span className="ml-auto font-normal text-muted-foreground">{tempoRelativo(d.created_at ?? "")}</span>
            </div>

            {d.detalhe ? <p className="mt-2 text-sm text-muted-foreground">{d.detalhe}</p> : null}
            <p className="mt-2 break-all text-[11px] text-muted-foreground">Alvo: {d.alvo_id}</p>

            {d.status === "aberta" ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => descartar(d.id)}
                  className="min-h-11 flex-1 rounded-xl border border-border text-xs font-bold text-muted-foreground"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={() => ocultar(d.alvo_tipo, d.alvo_id, d.id)}
                  className="min-h-11 flex-1 rounded-xl bg-destructive text-xs font-bold text-destructive-foreground"
                >
                  Ocultar conteúdo
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
