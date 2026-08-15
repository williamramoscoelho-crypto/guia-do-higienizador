import { Link } from "@tanstack/react-router";
import { BookOpen, Calculator, CircleUser, Home, MessagesSquare, Search, Users } from "lucide-react";

import { isCommunityEnabled } from "@/lib/flags";

const linksGuia = [
  { to: "/", label: "Início", exact: true },
  { to: "/buscar", label: "Buscar" },
  { to: "/guia", label: "Guia" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/sobre", label: "Sobre" },
] as const;

const linksComunidade = [
  { to: "/", label: "Início", exact: true },
  { to: "/buscar", label: "Buscar" },
  { to: "/guia", label: "Guia" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/painel", label: "Perfil" },
] as const;

/** Navegação superior — visível a partir de lg; no mobile a BottomNav cobre o essencial. */
export function AppHeader() {
  const links = isCommunityEnabled() ? linksComunidade : linksGuia;

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm lg:block">
      <div className="app-shell flex min-h-14 items-center gap-4 py-2">
        <Link to="/" className="shrink-0 text-sm font-bold tracking-tight text-foreground">
          Guia do Higienizador
        </Link>
        <nav aria-label="Navegação principal desktop" className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={"exact" in l && l.exact ? { exact: true } : undefined}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/buscar"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground"
        >
          <Search className="size-4" aria-hidden />
          Buscar
        </Link>
      </div>
    </header>
  );
}

/** Ícones auxiliares mantidos para possível uso futuro / consistência com BottomNav. */
export const NAV_ICONS = {
  Home,
  BookOpen,
  Calculator,
  Users,
  MessagesSquare,
  CircleUser,
  Search,
} as const;
