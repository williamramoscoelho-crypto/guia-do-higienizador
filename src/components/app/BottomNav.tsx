import { Link } from "@tanstack/react-router";
import { Home, Search, BookOpen, FlaskConical, TriangleAlert } from "lucide-react";

const itens = [
  { to: "/", label: "Início", Icon: Home, exact: true },
  { to: "/buscar", label: "Buscar", Icon: Search, exact: false },
  { to: "/guia", label: "Guia", Icon: BookOpen, exact: false },
  { to: "/produtos", label: "Produtos", Icon: FlaskConical, exact: false },
  { to: "/cuidados", label: "Cuidados", Icon: TriangleAlert, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="app-shell grid grid-cols-5 gap-1 py-1.5">
        {itens.map(({ to, label, Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
