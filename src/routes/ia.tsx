import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Download, Loader2, Send, Sparkles, Square, Trash2, History, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { modos, type ModoIA } from "@/lib/ia-prompt";
import { tituloDaConversa, useConversas, type ConversaIA, type MensagemIA } from "@/lib/ia-historico";

/**
 * Higienizador IA — assistente do Guia do Higienizador.
 *
 * Arquitetura:
 * - UI (este arquivo) → POST /api/ia → gateway de IA (streaming de texto).
 * - System prompt e modos: src/lib/ia-prompt.ts
 * - Histórico local: src/lib/ia-historico.ts (localStorage; trocar por banco
 *   quando as contas de usuário entrarem).
 *
 * Para expandir: upload de foto (enviar parte `input_image` no endpoint),
 * respostas salvas por usuário e integração com o feed da comunidade.
 */

export const Route = createFileRoute("/ia")({
  head: () => ({
    meta: [
      { title: "Higienizador IA — assistente técnico de higienização de estofados" },
      {
        name: "description",
        content:
          "Assistente de IA para higienização de estofados: identifica tecidos, resolve manchas, gera protocolos e apoia diluição e precificação.",
      },
      { property: "og:title", content: "Higienizador IA" },
      {
        property: "og:description",
        content: "Chat técnico especializado em tecidos, manchas, produtos e protocolos de higienização profissional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaginaIA,
});

const AVISO = "Confirme sempre a etiqueta da peça e a ficha técnica/FISPQ do produto. Teste em área discreta.";

function PaginaIA() {
  const [modo, setModo] = useState<ModoIA>("chat");
  const [mensagens, setMensagens] = useState<MensagemIA[]>([]);
  const [entrada, setEntrada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [conversaId, setConversaId] = useState(() => `c${Date.now()}`);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const { conversas, salvar, apagar } = useConversas();

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [mensagens, carregando]);

  const persistir = useCallback(
    (lista: MensagemIA[]) => {
      if (lista.length === 0) return;
      const conversa: ConversaIA = {
        id: conversaId,
        titulo: tituloDaConversa(lista),
        modo,
        atualizadaEm: Date.now(),
        mensagens: lista,
      };
      salvar(conversa);
    },
    [conversaId, modo, salvar],
  );

  async function enviar(texto: string) {
    const pergunta = texto.trim();
    if (!pergunta || carregando) return;

    const base: MensagemIA[] = [...mensagens, { role: "user", content: pergunta }];
    setMensagens([...base, { role: "assistant", content: "" }]);
    setEntrada("");
    setErro(null);
    setCarregando(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resposta = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo, mensagens: base }),
        signal: controller.signal,
      });

      if (!resposta.ok || !resposta.body) {
        const detalhe = await resposta.text().catch(() => "");
        throw new Error(detalhe || "O assistente não conseguiu responder agora.");
      }

      const reader = resposta.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        setMensagens([...base, { role: "assistant", content: acumulado }]);
      }

      const finais: MensagemIA[] = [
        ...base,
        { role: "assistant", content: acumulado || "Não consegui gerar uma resposta. Reformule a pergunta, por favor." },
      ];
      setMensagens(finais);
      persistir(finais);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setMensagens((atual) => atual.filter((m, i) => !(i === atual.length - 1 && m.content === "")));
      } else {
        setMensagens(base);
        setErro((e as Error).message);
      }
    } finally {
      setCarregando(false);
      abortRef.current = null;
    }
  }

  function novaConversa() {
    abortRef.current?.abort();
    setMensagens([]);
    setEntrada("");
    setErro(null);
    setConversaId(`c${Date.now()}`);
  }

  function abrirConversa(c: ConversaIA) {
    abortRef.current?.abort();
    setConversaId(c.id);
    setModo(c.modo);
    setMensagens(c.mensagens);
    setMostrarHistorico(false);
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(`${texto}\n\n---\n${AVISO}`);
      toast.success("Protocolo copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  function exportar(texto: string) {
    const conteudo = `Higienizador IA — Guia do Higienizador\n\n${texto}\n\n---\n${AVISO}\n`;
    const url = URL.createObjectURL(new Blob([conteudo], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "protocolo-higienizador.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const preset = modos[modo];

  return (
    <div className="pb-4">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-6 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Assistente</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold leading-tight">
          <Sparkles className="size-7" aria-hidden /> Higienizador IA
        </h1>
        <p className="mt-1 text-sm opacity-85">
          Consulta técnica sobre tecidos, manchas, produtos, protocolos, diluição e preço.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={novaConversa}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-3 text-sm font-semibold text-foreground shadow"
          >
            <Plus className="size-4" aria-hidden /> Nova conversa
          </button>
          <button
            type="button"
            onClick={() => setMostrarHistorico((v) => !v)}
            aria-expanded={mostrarHistorico}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-3 text-sm font-semibold"
          >
            <History className="size-4" aria-hidden /> Histórico ({conversas.length})
          </button>
        </div>
      </header>

      {mostrarHistorico ? (
        <section className="mt-4 rounded-2xl border border-border bg-card p-3">
          <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Conversas salvas neste aparelho
          </h2>
          {conversas.length === 0 ? (
            <p className="px-1 pb-1 text-sm text-muted-foreground">Nenhuma conversa salva ainda.</p>
          ) : (
            <ul className="grid gap-1.5">
              {conversas.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => abrirConversa(c)}
                    className="flex-1 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    <span className="block font-medium">{c.titulo}</span>
                    <span className="block text-xs text-muted-foreground">{modos[c.modo].titulo}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => apagar(c.id)}
                    aria-label={`Apagar conversa ${c.titulo}`}
                    className="rounded-xl p-2.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Modo</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(modos) as ModoIA[]).map((chave) => (
            <button
              key={chave}
              type="button"
              onClick={() => setModo(chave)}
              aria-pressed={modo === chave}
              className={
                modo === chave
                  ? "min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  : "min-h-11 rounded-full border border-border bg-card px-4 text-sm"
              }
            >
              {modos[chave].titulo}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{preset.descricao}</p>
      </section>

      <section className="mt-5 grid gap-3" aria-live="polite">
        {mensagens.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Descreva o caso com o máximo de detalhe: tipo de peça, tecido (ou o que diz a etiqueta), origem da mancha,
              há quanto tempo e o que já tentou. Quanto melhor a descrição, mais seguro o protocolo.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {preset.exemplos.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    onClick={() => void enviar(ex)}
                    className="min-h-11 rounded-full border border-primary/40 bg-primary/10 px-4 text-sm font-medium text-primary"
                  >
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          mensagens.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground">
                {m.content}
              </p>
            ) : (
              <article key={i} className="rounded-2xl border border-border bg-card p-4">
                {m.content ? (
                  <>
                    <div className="prose-ia text-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={() => void copiar(m.content)}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold"
                      >
                        <Copy className="size-3.5" aria-hidden /> Copiar protocolo
                      </button>
                      <button
                        type="button"
                        onClick={() => exportar(m.content)}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold"
                      >
                        <Download className="size-3.5" aria-hidden /> Exportar
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden /> Analisando o caso…
                  </p>
                )}
              </article>
            ),
          )
        )}
        <div ref={fimRef} />
      </section>

      {erro ? (
        <p role="alert" className="mt-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {erro}
        </p>
      ) : null}

      <form
        className="sticky bottom-20 mt-4 rounded-2xl border border-border bg-card p-2 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(entrada);
        }}
      >
        <label htmlFor="pergunta-ia" className="sr-only">
          Sua pergunta para o Higienizador IA
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="pergunta-ia"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void enviar(entrada);
              }
            }}
            rows={2}
            maxLength={6000}
            placeholder="Ex.: mancha de urina antiga em sofá de suede claro…"
            className="min-h-14 w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          {carregando ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Parar resposta"
              className="grid size-12 shrink-0 place-items-center rounded-xl border border-border"
            >
              <Square className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!entrada.trim()}
              aria-label="Enviar pergunta"
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </form>

      <p className="mt-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs leading-relaxed">
        ⚠️ Orientação técnica de referência, não substitui avaliação presencial. {AVISO} Consulte também{" "}
        <Link to="/fichas" className="underline">
          as fichas técnicas
        </Link>{" "}
        e a página de{" "}
        <Link to="/cuidados" className="underline">
          cuidados
        </Link>
        .
      </p>
    </div>
  );
}
