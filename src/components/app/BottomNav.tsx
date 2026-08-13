import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Users, MessagesSquare, CircleUser } from "lucide-react";

const itens = [
  { to: "/", label: "Início", Icon: Home, exact: true },
  { to: "/guia", label: "Guia", Icon: BookOpen, exact: false },
  { to: "/comunidade", label: "Comunidade", Icon: Users, exact: false },
  { to: "/perguntas", label: "Dúvidas", Icon: MessagesSquare, exact: false },
  { to: "/painel", label: "Perfil", Icon: CircleUser, exact: false },
] as const;


export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-card/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_-12px_hsl(200_95%_55%/0.25)] backdrop-blur-xl"
    >
      <ul className="app-shell grid grid-cols-5 gap-1 py-1.5">
        {itens.map(({ to, label, Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:bg-primary/15 data-[status=active]:text-primary data-[status=active]:shadow-[0_0_20px_hsl(200_95%_55%/0.2)]"
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
