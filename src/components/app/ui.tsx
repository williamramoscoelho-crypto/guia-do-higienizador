import { Link } from "@tanstack/react-router";
import { ChevronRight, Star, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useFavoritos, registrarRecente } from "@/lib/local";
import { cn } from "@/lib/utils";

export function PageHeader({
  titulo,
  descricao,
  eyebrow,
  children,
}: {
  titulo: string;
  descricao?: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <header className="surface-hero -mx-4 px-4 pb-7 pt-7">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-2xl font-bold leading-tight">{titulo}</h1>
      {descricao ? <p className="mt-2 text-sm leading-relaxed opacity-85">{descricao}</p> : null}
      {children}
    </header>
  );
}

export function Section({
  titulo,
  children,
  className,
}: {
  titulo?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-6", className)}>
      {titulo ? (
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{titulo}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function InfoCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>{children}</div>
  );
}

export function DataList({ itens }: { itens: { label: string; valor: string }[] }) {
  return (
    <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
      {itens.map((i) => (
        <div key={i.label} className="grid grid-cols-[38%_1fr] gap-3 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{i.label}</dt>
          <dd className="text-sm leading-relaxed">{i.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BulletList({ itens, tone = "default" }: { itens: string[]; tone?: "default" | "danger" | "ok" }) {
  return (
    <ul className="space-y-2">
      {itens.map((t) => (
        <li key={t} className="flex gap-2 text-sm leading-relaxed">
          <span
            className={cn(
              "mt-2 size-1.5 shrink-0 rounded-full",
              tone === "danger" ? "bg-destructive" : tone === "ok" ? "bg-success" : "bg-primary",
            )}
            aria-hidden
          />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function Aviso({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-warning/50 bg-warning/15 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-warning-foreground">
        <TriangleAlert className="size-4" aria-hidden />
        {titulo}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-warning-foreground/90">{children}</div>
    </div>
  );
}

export function ItemLink({
  to,
  params,
  emoji,
  titulo,
  descricao,
}: {
  to: string;
  params?: Record<string, string>;
  emoji?: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="card-tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm hover:border-primary/50"
    >
      {emoji ? <span className="text-2xl">{emoji}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{titulo}</span>
        {descricao ? (
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{descricao}</span>
        ) : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

export function Breadcrumbs({ trilha }: { trilha: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="pt-3 text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {trilha.map((t, i) => (
          <li key={t.label} className="flex items-center gap-1">
            {t.to ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Link to={t.to as any} className="hover:text-foreground">
                {t.label}
              </Link>
            ) : (
              <span className="text-foreground">{t.label}</span>
            )}
            {i < trilha.length - 1 ? <span aria-hidden>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FavoritoBotao({ id, tipo, nome, href }: { id: string; tipo: string; nome: string; href: string }) {
  const { isFav, toggle } = useFavoritos();
  const ativo = isFav(id);
  return (
    <button
      type="button"
      onClick={() => toggle({ id, tipo, nome, href })}
      aria-pressed={ativo}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        ativo
          ? "border-warning bg-warning text-warning-foreground"
          : "border-border bg-card text-foreground hover:border-primary/60",
      )}
    >
      <Star className={cn("size-4", ativo && "fill-current")} aria-hidden />
      {ativo ? "Favoritado" : "Favoritar"}
    </button>
  );
}

export function RegistrarVisita({ nome, href, tipo }: { nome: string; href: string; tipo: string }) {
  useEffect(() => {
    registrarRecente({ nome, href, tipo });
  }, [nome, href, tipo]);
  return null;
}

export function CatalogList({
  itens,
  placeholder,
}: {
  itens: { key: string; to: string; params?: Record<string, string>; emoji?: string; titulo: string; descricao?: string }[];
  placeholder: string;
}) {
  const [q, setQ] = useState("");
  const filtrados = itens.filter((i) =>
    `${i.titulo} ${i.descricao ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <label className="sr-only" htmlFor="filtro-catalogo">
        {placeholder}
      </label>
      <input
        id="filtro-catalogo"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="mt-4 min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />
      <ul className="mt-4 grid gap-2">
        {filtrados.map((i) => (
          <li key={i.key}>
            <ItemLink
              to={i.to}
              titulo={i.titulo}
              {...(i.params ? { params: i.params } : {})}
              {...(i.emoji ? { emoji: i.emoji } : {})}
              {...(i.descricao ? { descricao: i.descricao } : {})}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warn" | "ok" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "warn"
          ? "bg-warning/25 text-warning-foreground"
          : tone === "ok"
            ? "bg-success/20 text-success-foreground"
            : "bg-secondary text-secondary-foreground",
      )}
    >
      {children}
    </span>
  );
}
