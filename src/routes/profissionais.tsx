import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { useState } from "react";

import { Avatar, Carregando, Vazio } from "@/components/app/community";
import { supabase } from "@/integrations/supabase/client";
import { ESPECIALIDADES, UFS } from "@/lib/community";

export const Route = createFileRoute("/profissionais")({
  head: () => ({
    meta: [
      { title: "Profissionais de higienização no Brasil — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Encontre higienizadores de estofados e profissionais de estética automotiva por estado e especialidade. Diretório aberto da comunidade Guia do Higienizador.",
      },
      { property: "og:title", content: "Profissionais de higienização no Brasil — Guia do Higienizador" },
      { property: "og:description", content: "Diretório de higienizadores por estado e especialidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfissionaisPage,
});

function ProfissionaisPage() {
  const [termo, setTermo] = useState("");
  const [uf, setUf] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  const lista = useQuery({
    queryKey: ["profissionais", { uf, especialidade }],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("id,handle,nome,nome_profissional,avatar_url,cidade,estado,mostrar_cidade,bio,especialidades")
        .eq("perfil_publico", true)
        .eq("suspenso", false)
        .not("handle", "is", null)
        .order("created_at", { ascending: false })
        .limit(60);

      if (uf) q = q.eq("estado", uf);
      if (especialidade) q = q.contains("especialidades", [especialidade]);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const termoNormalizado = termo.trim().toLowerCase();
  const filtrados = (lista.data ?? []).filter((p) =>
    termoNormalizado
      ? [p.nome, p.nome_profissional, p.cidade, p.bio].some((c) => c?.toLowerCase().includes(termoNormalizado))
      : true,
  );

  return (
    <div className="pb-6">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-7 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Networking</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">Profissionais da comunidade</h1>
        <p className="mt-2 text-sm opacity-85">
          Conecte-se com higienizadores e profissionais de estética automotiva do seu estado.
        </p>
      </header>

      <div className="mt-5 grid gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="busca-prof" className="sr-only">
            Buscar profissional
          </label>
          <input
            id="busca-prof"
            value={termo}
            maxLength={60}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por nome ou cidade"
            className="min-h-12 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="uf" className="sr-only">
              Estado
            </label>
            <select
              id="uf"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
            >
              <option value="">Todos os estados</option>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="esp" className="sr-only">
              Especialidade
            </label>
            <select
              id="esp"
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
            >
              <option value="">Todas especialidades</option>
              {ESPECIALIDADES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {lista.isLoading ? <Carregando linhas={3} /> : null}
        {!lista.isLoading && filtrados.length === 0 ? (
          <Vazio titulo="Nenhum profissional encontrado" descricao="Ajuste os filtros ou volte mais tarde." />
        ) : null}

        {filtrados.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border bg-card p-4">
            <Link to="/p/$handle" params={{ handle: p.handle! }} className="flex items-center gap-3">
              <Avatar nome={p.nome} url={p.avatar_url} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{p.nome_profissional || p.nome}</span>
                {p.mostrar_cidade && (p.cidade || p.estado) ? (
                  <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3.5" aria-hidden />
                    {[p.cidade, p.estado].filter(Boolean).join(" – ")}
                  </span>
                ) : null}
              </span>
            </Link>
            {p.bio ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.bio}</p> : null}
            {p.especialidades.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {p.especialidades.slice(0, 3).map((e) => (
                  <li key={e} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {e}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
