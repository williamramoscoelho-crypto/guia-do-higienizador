const KEY_HIST = "gh:busca-historico";
const KEY_ZERO = "gh:busca-sem-resultado";
const MAX = 8;

function lerLista(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function gravarLista(key: string, itens: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(itens.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function lerHistoricoBusca(): string[] {
  return lerLista(KEY_HIST);
}

export function registrarBusca(termo: string) {
  const t = termo.trim().toLowerCase();
  if (t.length < 2) return;
  const atual = lerLista(KEY_HIST).filter((x) => x.toLowerCase() !== t);
  gravarLista(KEY_HIST, [termo.trim(), ...atual]);
}

/** Demanda editorial local (+ API PHP quando disponível). */
export function registrarBuscaSemResultado(termo: string) {
  const t = termo.trim();
  if (t.length < 2) return;
  const atual = lerLista(KEY_ZERO).filter((x) => x.toLowerCase() !== t.toLowerCase());
  gravarLista(KEY_ZERO, [t, ...atual]);

  void import("@/lib/backend")
    .then(({ usesPhpApi, phpApiBase }) => {
      if (!usesPhpApi()) return;
      const base = phpApiBase();
      void fetch(`${base}/search-miss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termo: t.slice(0, 120) }),
        keepalive: true,
      }).catch(() => {
        /* offline / API ausente */
      });
    })
    .catch(() => {
      /* ignore */
    });
}

export function lerBuscasSemResultado(): string[] {
  return lerLista(KEY_ZERO);
}
