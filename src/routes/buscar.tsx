import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { buscar, sugestoes } from "@/data/busca";
import { ItemLink, PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/buscar")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Buscar — Guia do Higienizador" },
      { name: "description", content: "Busque tecidos, manchas, produtos, equipamentos, procedimentos e termos técnicos." },
      { property: "og:title", content: "Busca rápida — Guia do Higienizador" },
      { property: "og:description", content: "Encontre em segundos a informação que você precisa durante o atendimento." },
      { property: "og:url", content: "/buscar" },
    ],
    links: [{ rel: "canonical", href: "/buscar" }],
  }),
  component: Buscar,
});

function Buscar() {
  const { q } = Route.useSearch();
  const [termo, setTermo] = useState(q ?? "");
  const resultados = useMemo(() => buscar(termo), [termo]);

  const grupos = useMemo(() => {
    const map = new Map<string, typeof resultados>();
    for (const r of resultados) {
      const atual = map.get(r.grupo) ?? [];
      atual.push(r);
      map.set(r.grupo, atual);
    }
    return Array.from(map.entries());
  }, [resultados]);

  return (
    <div className="pb-4">
      <PageHeader titulo="Buscar" descricao="Consulta rápida em todo o guia." eyebrow="Guia do Higienizador">
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-4 shadow-lg">
          <Search className="size-5 text-muted-foreground" aria-hidden />
          <label htmlFor="campo-busca" className="sr-only">
            Digite o que você precisa consultar
          </label>
          <input
            id="campo-busca"
            autoFocus
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Digite o que você precisa consultar…"
            className="min-h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </PageHeader>

      {termo.trim().length < 2 ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Sugestões</h2>
          <ul className="flex flex-wrap gap-2">
            {sugestoes.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setTermo(s)}
                  className="min-h-11 rounded-full border border-border bg-card px-4 text-sm font-medium"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : resultados.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Nada encontrado para “{termo}”. Tente outro termo, como “veludo”, “urina” ou “alcalino”.
        </p>
      ) : (
        grupos.map(([grupo, itens]) => (
          <section key={grupo} className="mt-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {grupo} <span className="text-xs font-medium">({itens.length})</span>
            </h2>
            <ul className="grid gap-2">
              {itens.map((r) => (
                <li key={r.id}>
                  <ItemLink to={r.href} titulo={r.titulo} descricao={r.descricao} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
