import type { ReactNode } from "react";
import { TriangleAlert, FileWarning, Ban, HelpCircle, FlaskConical, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/** Níveis de confiabilidade editorial — só usar com fonte/revisão real; nunca inventar o nível. */
export type NivelConfiabilidade =
  | "confirmado"
  | "bem_fundamentado"
  | "condicional"
  | "atencao"
  | "nao_recomendado"
  | "insuficiente";

const ROTULOS: Record<NivelConfiabilidade, { emoji: string; label: string; className: string }> = {
  confirmado: {
    emoji: "🟢",
    label: "Confirmado",
    className: "bg-success/20 text-success-foreground border-success/40",
  },
  bem_fundamentado: {
    emoji: "🔵",
    label: "Bem fundamentado",
    className: "bg-primary/15 text-primary border-primary/40",
  },
  condicional: {
    emoji: "🟡",
    label: "Condicional",
    className: "bg-warning/20 text-warning-foreground border-warning/40",
  },
  atencao: {
    emoji: "🟠",
    label: "Atenção",
    className: "bg-warning/25 text-warning-foreground border-warning/50",
  },
  nao_recomendado: {
    emoji: "🔴",
    label: "Não recomendado",
    className: "bg-destructive/20 text-destructive border-destructive/40",
  },
  insuficiente: {
    emoji: "❓",
    label: "Informação insuficiente",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function BadgeConfiabilidade({
  nivel,
  motivo,
}: {
  nivel: NivelConfiabilidade;
  /** Explicação curta — obrigatória na prática editorial. */
  motivo?: string;
}) {
  const meta = ROTULOS[nivel];
  return (
    <div className="space-y-1">
      <span
        className={cn(
          "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
          meta.className,
        )}
      >
        <span aria-hidden>{meta.emoji}</span>
        {meta.label}
      </span>
      {motivo ? <p className="text-xs leading-relaxed text-muted-foreground">{motivo}</p> : null}
    </div>
  );
}

export type TipoAlertaPadrao =
  | "atencao"
  | "teste"
  | "consulte_fabricante"
  | "insuficiente"
  | "nao_recomendado"
  | "fonte";

const ALERTAS: Record<
  TipoAlertaPadrao,
  { titulo: string; Icon: typeof TriangleAlert; className: string }
> = {
  atencao: {
    titulo: "Atenção",
    Icon: TriangleAlert,
    className: "border-warning/50 bg-warning/15 text-warning-foreground",
  },
  teste: {
    titulo: "Teste prévio necessário",
    Icon: FlaskConical,
    className: "border-primary/40 bg-primary/10 text-foreground",
  },
  consulte_fabricante: {
    titulo: "Consulte o fabricante",
    Icon: FileWarning,
    className: "border-border bg-card text-foreground",
  },
  insuficiente: {
    titulo: "Informação insuficiente",
    Icon: HelpCircle,
    className: "border-border bg-muted/50 text-muted-foreground",
  },
  nao_recomendado: {
    titulo: "Não recomendado",
    Icon: Ban,
    className: "border-destructive/50 bg-destructive/15 text-destructive",
  },
  fonte: {
    titulo: "Fonte",
    Icon: BookOpen,
    className: "border-border bg-card text-muted-foreground",
  },
};

/** Alertas padronizados — colocar antes do procedimento quando o risco for relevante. */
export function AlertaPadrao({
  tipo,
  children,
  titulo,
}: {
  tipo: TipoAlertaPadrao;
  children: ReactNode;
  titulo?: string;
}) {
  const meta = ALERTAS[tipo];
  const Icon = meta.Icon;
  return (
    <div className={cn("rounded-2xl border p-4", meta.className)} role="note">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 shrink-0" aria-hidden />
        {titulo ?? meta.titulo}
      </p>
      <div className="mt-2 text-sm leading-relaxed opacity-90">{children}</div>
    </div>
  );
}
