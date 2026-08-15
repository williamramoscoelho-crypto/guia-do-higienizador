import { useState } from "react";

const KEY = "gh:erros-reportados";

type Report = { id: string; path: string; texto: string; em: number };

function salvar(r: Report) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    const lista: Report[] = raw ? (JSON.parse(raw) as Report[]) : [];
    lista.unshift(r);
    window.localStorage.setItem(KEY, JSON.stringify(lista.slice(0, 40)));
  } catch {
    /* quota */
  }
}

/** Canal leve “encontrou um erro?” — local até existir endpoint editorial. */
export function EncontrouErro({ path }: { path: string }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [ok, setOk] = useState(false);

  function enviar() {
    const t = texto.trim();
    if (t.length < 8) return;
    salvar({ id: `${Date.now()}`, path, texto: t, em: Date.now() });
    setOk(true);
    setTexto("");
    setAberto(false);
  }

  return (
    <section className="mt-4 rounded-2xl border border-dashed border-border p-4">
      <button
        type="button"
        onClick={() => {
          setOk(false);
          setAberto((v) => !v);
        }}
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Encontrou um erro?
      </button>
      <p className="mt-1 text-xs text-muted-foreground">
        Erro técnico, informação desatualizada, fonte incorreta ou procedimento perigoso.
      </p>
      {ok ? <p className="mt-2 text-sm text-success">Registro salvo neste aparelho. Obrigado.</p> : null}
      {aberto ? (
        <div className="mt-3 grid gap-2">
          <label htmlFor="erro-texto" className="sr-only">
            Descreva o problema
          </label>
          <textarea
            id="erro-texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            placeholder="Descreva o problema (mín. 8 caracteres)…"
            className="w-full rounded-xl border border-border bg-background p-3 text-sm"
          />
          <button type="button" onClick={enviar} className="btn-primary min-h-11 w-full sm:w-auto">
            Enviar relatório
          </button>
        </div>
      ) : null}
    </section>
  );
}
