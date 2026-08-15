import { Link } from "@tanstack/react-router";

/** Abas da comunidade apontando para rotas reais (API PHP / HostGator). */
export function AbasComunidade() {
  const abas = [
    { to: "/comunidade", label: "Feed", exact: true },
    { to: "/perguntas", label: "Perguntas", exact: false },
    { to: "/comunidade/ranking", label: "Ranking", exact: false },
    { to: "/profissionais", label: "Profissionais", exact: false },
  ] as const;

  return (
    <nav aria-label="Seções da comunidade" className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
      {abas.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          activeOptions={{ exact: a.exact }}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-muted-foreground data-[status=active]:border-primary data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
        >
          {a.label}
        </Link>
      ))}
    </nav>
  );
}
