import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import { AbasComunidade, SeloNivel } from "@/components/app/comunidade-ui";
import { PageHeader, Section } from "@/components/app/ui";
import { autores } from "@/data/comunidade";

export const Route = createFileRoute("/profissionais/")({
  head: () => ({
    meta: [
      { title: "Diretório de higienizadores profissionais — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Encontre profissionais de higienização de estofados por cidade e especialidade: sofás, colchões, automotivo, couro e tecidos delicados.",
      },
      { property: "og:title", content: "Diretório de higienizadores profissionais" },
      { property: "og:description", content: "Profissionais de higienização por cidade e especialidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profissionais,
});

function Profissionais() {
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return autores;
    return autores.filter((a) =>
      `${a.nome} ${a.empresa} ${a.cidade} ${a.estado} ${a.especialidades.join(" ")}`.toLowerCase().includes(q),
    );
  }, [busca]);

  return (
    <div className="pb-6">
      <PageHeader
        eyebrow="Comunidade"
        titulo="Profissionais"
        descricao="Diretório de higienizadores que participam da comunidade. Perfis públicos, sem exposição de dados privados."
      />
      <AbasComunidade />

      <label className="sr-only" htmlFor="busca-prof">
        Buscar por nome, cidade ou especialidade
      </label>
      <input
        id="busca-prof"
        value={busca}
        onChange={(e) => setBusca(e.target.value.slice(0, 80))}
        placeholder="Cidade, especialidade ou nome"
        className="mt-4 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />

      <Section titulo={`${lista.length} profissional(is)`}>
        <div className="grid gap-3">
          {lista.map((a) => (
            <Link
              key={a.id}
              to="/profissionais/$id"
              params={{ id: a.id }}
              className="card-tap rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{a.nome}</span>
                {a.verificado ? <BadgeCheck className="size-4 text-primary" aria-label="Verificado" /> : null}
                <span className="ml-auto">
                  <SeloNivel autor={a} />
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden />
                {a.cidade}/{a.estado} · {a.empresa}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {a.especialidades.map((e) => (
                  <li key={e} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                    {e}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
          {lista.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Nenhum profissional encontrado com esse filtro.
            </p>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
