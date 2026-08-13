import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { Carregando, Vazio } from "@/components/app/community";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { tempoRelativo } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — Guia do Higienizador" },
      { name: "description", content: "Respostas, comentários, curtidas e novidades da comunidade em um só lugar." },
      { property: "og:title", content: "Notificações — Guia do Higienizador" },
      { property: "og:description", content: "Acompanhe as interações com o seu conteúdo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Notificacoes,
});

function Notificacoes() {
  const { user } = useAuth();

  const lista = useQuery({
    queryKey: ["notificacoes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(user),
  });

  /** Marca como lidas assim que a tela é aberta. */
  useEffect(() => {
    if (!user || !lista.data?.some((n) => !n.lida)) return;
    void supabase.from("notifications").update({ lida: true }).eq("user_id", user.id).eq("lida", false);
  }, [user, lista.data]);

  return (
    <div className="pb-6">
      <header className="pt-6">
        <h1 className="text-2xl font-bold leading-tight">Notificações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Interações com suas publicações, respostas e perfil.</p>
      </header>

      <div className="mt-5 grid gap-2">
        {lista.isLoading ? <Carregando linhas={3} /> : null}
        {lista.data?.length === 0 ? (
          <Vazio titulo="Sem notificações" descricao="Quando alguém interagir com você, avisamos por aqui." />
        ) : null}

        {lista.data?.map((n) => {
          const conteudo = (
            <>
              <p className="text-sm font-semibold">{n.titulo}</p>
              {n.corpo ? <p className="mt-0.5 text-sm text-muted-foreground">{n.corpo}</p> : null}
              <p className="mt-1 text-[11px] text-muted-foreground">{tempoRelativo(n.created_at)}</p>
            </>
          );
          return (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 ${n.lida ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
            >
              {n.link ? (
                <Link to={n.link} className="block">
                  {conteudo}
                </Link>
              ) : (
                conteudo
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
