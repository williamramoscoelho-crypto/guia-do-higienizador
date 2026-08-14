import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Carregando, Vazio } from "@/components/app/community";
import { AvisoHospedagemEstatica } from "@/components/app/AvisoHospedagemEstatica";
import { supabase } from "@/integrations/supabase/client";
import { apiGrupos } from "@/lib/api";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";

export const Route = createFileRoute("/grupos/")({
  head: () => ({
    meta: [
      { title: "Grupos por tema e estado — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Participe de grupos de higienizadores por tema (sofás, colchões, automotiva, empreendedorismo) e por estado brasileiro.",
      },
      { property: "og:title", content: "Grupos por tema e estado — Guia do Higienizador" },
      { property: "og:description", content: "Comunidades menores para conversas mais próximas entre profissionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GruposPage,
});

function GruposPage() {
  const [aba, setAba] = useState<"tema" | "estado">("tema");

  const grupos = useQuery({
    queryKey: ["grupos"],
    enabled: isCommunityEnabled(),
    queryFn: async () => {
      if (!isCommunityEnabled()) return [];
      if (usesPhpApi()) return apiGrupos();
      const { data, error } = await supabase.from("groups").select("*").order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtrados = (grupos.data ?? []).filter((g) => (aba === "estado" ? g.tipo === "estado" : g.tipo !== "estado"));

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-7 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Grupos</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">Encontre a sua turma</h1>
        <p className="mt-2 text-sm opacity-85">Conversas por especialidade e por região, no ritmo de quem está perto de você.</p>
      </header>

      {!isCommunityEnabled() ? (
        <div className="mt-5">
          <AvisoHospedagemEstatica />
        </div>
      ) : (
        <>
      <div role="tablist" aria-label="Tipo de grupo" className="mt-5 flex gap-1 rounded-full border border-border bg-card p-1">
        {(["tema", "estado"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={aba === t}
            onClick={() => setAba(t)}
            className={`min-h-10 flex-1 rounded-full text-xs font-bold ${
              aba === t ? "bg-primary/15 text-primary" : "text-muted-foreground"
            }`}
          >
            {t === "tema" ? "Por tema" : "Por estado"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {grupos.isLoading ? <Carregando linhas={3} /> : null}
        {!grupos.isLoading && filtrados.length === 0 ? <Vazio titulo="Nenhum grupo disponível ainda" /> : null}

        {filtrados.map((g) => (
          <Link
            key={g.id}
            to="/grupos/$slug"
            params={{ slug: g.slug }}
            className="card-tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <span aria-hidden className="text-2xl">
              {g.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{g.nome}</span>
              {g.descricao ? <span className="block truncate text-xs text-muted-foreground">{g.descricao}</span> : null}
            </span>
          </Link>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
