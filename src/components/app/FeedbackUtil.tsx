import { useState } from "react";
import { cn } from "@/lib/utils";

const KEY = "gh:feedback-util";

function lerMapa(): Record<string, "sim" | "nao"> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, "sim" | "nao">) : {};
  } catch {
    return {};
  }
}

function gravar(id: string, v: "sim" | "nao") {
  const m = lerMapa();
  m[id] = v;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* quota */
  }
}

/** Feedback editorial local — não inventa conteúdo; só registra utilidade. */
export function FeedbackUtil({ idPagina }: { idPagina: string }) {
  const [voto, setVoto] = useState<"sim" | "nao" | null>(() => lerMapa()[idPagina] ?? null);

  function escolher(v: "sim" | "nao") {
    gravar(idPagina, v);
    setVoto(v);
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-4" aria-label="Feedback sobre o conteúdo">
      <p className="text-sm font-semibold">Esta informação foi útil?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => escolher("sim")}
          aria-pressed={voto === "sim"}
          className={cn(
            "min-h-11 rounded-full border px-4 text-sm font-semibold",
            voto === "sim" ? "border-success bg-success/20 text-success-foreground" : "border-border bg-background",
          )}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => escolher("nao")}
          aria-pressed={voto === "nao"}
          className={cn(
            "min-h-11 rounded-full border px-4 text-sm font-semibold",
            voto === "nao" ? "border-destructive bg-destructive/15 text-destructive" : "border-border bg-background",
          )}
        >
          Não
        </button>
      </div>
      {voto ? <p className="mt-2 text-xs text-muted-foreground">Obrigado — isso ajuda a priorizar revisões.</p> : null}
    </section>
  );
}
