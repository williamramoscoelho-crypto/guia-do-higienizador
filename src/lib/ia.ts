import { endpointIaPhp } from "@/lib/api";
import { usesPhpApi } from "@/lib/backend";
import type { ModoIA } from "@/data/ia-prompt";

export type PapelIA = "user" | "assistant";

/** Reexporta flag leve — preferir `@/lib/flags` na home/nav. */
export { iaConfigurada } from "@/lib/flags";
export type { ModoIA } from "@/data/ia-prompt";

export type MensagemIA = {
  role: PapelIA;
  content: string;
};

export type ConversaIA = {
  id: string;
  titulo: string;
  modo: ModoIA;
  atualizadoEm: number;
  mensagens: MensagemIA[];
};

const KEY_LISTA = "gh:ia-conversas";
const KEY_ATIVA = "gh:ia-conversa-ativa";
const MAX_CONVERSAS = 20;
const MAX_MENSAGENS = 28;

function ler<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function gravar(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function listarConversas(): ConversaIA[] {
  return ler<ConversaIA[]>(KEY_LISTA, []);
}

export function salvarConversas(lista: ConversaIA[]) {
  gravar(KEY_LISTA, lista.slice(0, MAX_CONVERSAS));
}

export function idConversaAtiva() {
  return ler<string | null>(KEY_ATIVA, null);
}

export function definirConversaAtiva(id: string | null) {
  if (id) gravar(KEY_ATIVA, id);
  else window.localStorage.removeItem(KEY_ATIVA);
}

export function novaConversa(modo: ModoIA = "chat"): ConversaIA {
  return {
    id: crypto.randomUUID(),
    titulo: "Nova conversa",
    modo,
    atualizadoEm: Date.now(),
    mensagens: [],
  };
}

export function tituloDe(texto: string) {
  const t = texto.replace(/\s+/g, " ").trim();
  return t.length > 48 ? `${t.slice(0, 48)}…` : t || "Nova conversa";
}

export function limitarHistorico(msgs: MensagemIA[]) {
  return msgs.slice(-MAX_MENSAGENS);
}

function endpointIA() {
  const custom = import.meta.env["VITE_IA_API_URL"] as string | undefined;
  if (custom) return custom;
  if (usesPhpApi()) return endpointIaPhp();
  const url = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || "";
  return `${url.replace(/\/$/, "")}/functions/v1/higienizador-ia`;
}

function headersIA(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (usesPhpApi()) {
    try {
      const token = window.localStorage.getItem("gh_token");
      if (token) h["Authorization"] = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
    return h;
  }
  const key =
    (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) || "";
  if (key) {
    h["Authorization"] = `Bearer ${key}`;
    h["apikey"] = key;
  }
  return h;
}

/** Reduz foto para JPEG pequeno o bastante para o modelo de visão. */
export function compactarImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1024;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas indisponível"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem"));
    };
    img.src = url;
  });
}

export async function transmitirRespostaIA(opts: {
  modo: ModoIA;
  mensagens: MensagemIA[];
  imagem?: string;
  onDelta: (texto: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const { catalogoParaIA, extraDoModo } = await import("@/data/ia-prompt");
  const res = await fetch(endpointIA(), {
    method: "POST",
    headers: headersIA(),
    credentials: usesPhpApi() ? "include" : "same-origin",
    signal: opts.signal ?? null,
    body: JSON.stringify({
      modo: opts.modo,
      catalogo: catalogoParaIA(),
      extra: extraDoModo(opts.modo),
      mensagens: limitarHistorico(opts.mensagens),
      imagem: opts.imagem,
    }),
  });

  if (!res.ok) {
    let detalhe = `A IA não respondeu (${res.status}).`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) detalhe = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(detalhe);
  }

  if (!res.body) throw new Error("Resposta sem corpo.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const linhas = buf.split("\n");
    buf = linhas.pop() ?? "";
    for (const linha of linhas) {
      const t = linha.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const piece = json.choices?.[0]?.delta?.content ?? "";
        if (piece) {
          acc += piece;
          opts.onDelta(acc);
        }
      } catch {
        /* chunk incompleto */
      }
    }
  }

  if (!acc.trim()) throw new Error("A IA devolveu uma resposta vazia.");
  return acc;
}

export function baixarTexto(nome: string, texto: string) {
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function copiarTexto(texto: string) {
  await navigator.clipboard.writeText(texto);
}
