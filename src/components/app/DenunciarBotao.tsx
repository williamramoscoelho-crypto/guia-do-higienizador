import { Flag } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";

import { apiDenunciar } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usesPhpApi } from "@/lib/backend";
import { MOTIVOS_DENUNCIA } from "@/lib/community";

const denunciaSchema = z.object({
  motivo: z.enum(MOTIVOS_DENUNCIA as unknown as [string, ...string[]]),
  detalhe: z.string().trim().max(500, "Máximo de 500 caracteres.").optional(),
});

/** Denúncia de conteúdo — visível apenas para quem está logado. */
export function DenunciarBotao({
  alvoTipo,
  alvoId,
}: {
  alvoTipo: "post" | "comment" | "question" | "answer" | "profile";
  alvoId: string;
}) {
  const { user } = useAuth();
  const tituloId = useId();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState<string>(MOTIVOS_DENUNCIA[0]);
  const [detalhe, setDetalhe] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  if (!user) return null;

  async function enviar() {
    const parsed = denunciaSchema.safeParse({ motivo, detalhe });
    if (!parsed.success) return setEstado("erro");
    setEstado("enviando");
    try {
      if (usesPhpApi()) {
        await apiDenunciar({
          alvo_tipo: alvoTipo,
          alvo_id: alvoId,
          motivo: parsed.data.motivo,
          detalhe: parsed.data.detalhe || null,
        });
      } else {
        const { supabase } = await import("@/integrations/supabase/client");
        const { error } = await supabase.from("reports").insert({
          reporter_id: user!.id,
          alvo_tipo: alvoTipo,
          alvo_id: alvoId,
          motivo: parsed.data.motivo,
          detalhe: parsed.data.detalhe || null,
        });
        if (error) throw error;
      }
      setEstado("ok");
      setTimeout(() => setAberto(false), 1500);
    } catch {
      setEstado("erro");
    }
  }

  const sheet =
    aberto && portalReady
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setAberto(false);
            }}
          >
            <div className="app-shell w-full rounded-t-2xl border border-border bg-card p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl">
              <h2 id={tituloId} className="text-base font-bold">
                Denunciar conteúdo
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                A moderação analisa todas as denúncias. Sua identidade não é exibida.
              </p>

              <div className="mt-3 grid gap-2">
                {MOTIVOS_DENUNCIA.map((m) => (
                  <label
                    key={m}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-border p-3 text-sm"
                  >
                    <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => setMotivo(m)} />
                    {m}
                  </label>
                ))}
              </div>

              <textarea
                value={detalhe}
                maxLength={500}
                onChange={(e) => setDetalhe(e.target.value)}
                placeholder="Detalhe (opcional)"
                className="mt-3 min-h-20 w-full rounded-xl border border-border bg-background p-3 text-sm"
              />

              {estado === "ok" ? <p className="mt-2 text-sm text-success">Denúncia enviada. Obrigado!</p> : null}
              {estado === "erro" ? (
                <p className="mt-2 text-sm text-destructive">Não foi possível enviar. Tente novamente.</p>
              ) : null}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="min-h-12 flex-1 rounded-xl border border-border text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={enviar}
                  disabled={estado === "enviando"}
                  className="btn-primary min-h-12 flex-1 justify-center"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setEstado("idle");
          setAberto(true);
        }}
        aria-label="Denunciar conteúdo"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2.5 text-xs font-semibold text-muted-foreground"
      >
        <Flag className="size-4" aria-hidden />
      </button>
      {sheet}
    </>
  );
}
