/**
 * Higienizador IA — chat do Guia.
 * Backend: /api/ia (PHP → Gemini e/ou OpenAI; chaves só em api/config.php).
 * Futuro: persistir conversas na conta, RAG das FISPQ, upload em lote.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Copy,
  Download,
  History,
  ImagePlus,
  LoaderCircle,
  Plus,
  Send,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Breadcrumbs, Chip, InfoCard, PageHeader, Section } from "@/components/app/ui";
import { AvisoHospedagemEstatica } from "@/components/app/AvisoHospedagemEstatica";
import { MODOS_IA, SUGESTOES_IA, type ModoIA } from "@/data/ia-prompt";
import {
  baixarTexto,
  compactarImagem,
  copiarTexto,
  definirConversaAtiva,
  iaConfigurada,
  idConversaAtiva,
  listarConversas,
  novaConversa,
  salvarConversas,
  tituloDe,
  transmitirRespostaIA,
  type ConversaIA,
  type MensagemIA,
} from "@/lib/ia";

type SearchIA = { modo?: ModoIA; q?: string };

export const Route = createFileRoute("/ia")({
  validateSearch: (s: Record<string, unknown>): SearchIA => ({
    modo: MODOS_IA.some((m) => m.id === s.modo) ? (s.modo as ModoIA) : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Higienizador IA — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Assistente técnico de higienização de estofados: tecidos, manchas, protocolos, diluição e precificação. Sem inventar química.",
      },
      { property: "og:title", content: "Higienizador IA" },
      { property: "og:url", content: "/ia" },
    ],
    links: [{ rel: "canonical", href: "/ia" }],
  }),
  component: HigienizadorIA,
});

function HigienizadorIA() {
  const search = Route.useSearch();
  const pronto = iaConfigurada();
  const [lista, setLista] = useState<ConversaIA[]>([]);
  const [ativaId, setAtivaId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const boot = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const l = listarConversas();
    setLista(l);
    setAtivaId(idConversaAtiva() ?? l[0]?.id ?? null);
  }, []);

  const conversa = useMemo(
    () => lista.find((c) => c.id === ativaId) ?? null,
    [lista, ativaId],
  );

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversa?.mensagens, enviando]);

  useEffect(() => {
    if (boot.current) return;
    if (!search.q && !search.modo) return;
    boot.current = true;
    const c = novaConversa(search.modo ?? "chat");
    persistir([c, ...listarConversas()], c.id);
    if (search.q) setInput(search.q);
  }, [search.modo, search.q]);

  function persistir(next: ConversaIA[], id: string | null) {
    const cortada = next.slice(0, 20);
    setLista(cortada);
    salvarConversas(cortada);
    setAtivaId(id);
    definirConversaAtiva(id);
  }

  function atualizarAtiva(patch: (c: ConversaIA) => ConversaIA) {
    if (!conversa) return;
    persistir(
      lista.map((c) => (c.id === conversa.id ? patch(c) : c)),
      conversa.id,
    );
  }

  function criar(modo: ModoIA = search.modo ?? "chat") {
    const c = novaConversa(modo);
    persistir([c, ...lista.filter((x) => x.mensagens.length > 0)], c.id);
    setErro(null);
    setImagem(null);
    setInput("");
  }

  async function enviar(texto?: string, modoForcado?: ModoIA) {
    const msg = (texto ?? input).trim();
    if (!msg || enviando) return;
    if (!pronto) {
      setErro("A IA ainda não está ligada neste ambiente. Use o identificador, as manchas e as fichas.");
      return;
    }

    const atual = conversa ?? novaConversa(modoForcado ?? search.modo ?? "chat");
    const modo = modoForcado ?? atual.modo;
    const historico: MensagemIA[] = [...atual.mensagens, { role: "user", content: msg }];
    const next: ConversaIA = {
      ...atual,
      modo,
      titulo: atual.mensagens.length === 0 ? tituloDe(msg) : atual.titulo,
      mensagens: historico,
      atualizadoEm: Date.now(),
    };
    persistir([next, ...lista.filter((c) => c.id !== next.id)], next.id);

    setInput("");
    setErro(null);
    setEnviando(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const aplicarAssistente = (acc: string) => {
      persistir(
        listarConversas().map((c) =>
          c.id === next.id
            ? {
                ...c,
                mensagens: [...historico, { role: "assistant", content: acc }],
                atualizadoEm: Date.now(),
              }
            : c,
        ),
        next.id,
      );
    };

    try {
      const foto = imagem ?? undefined;
      setImagem(null);
      const textoFinal = await transmitirRespostaIA({
        modo,
        mensagens: historico,
        imagem: foto,
        signal: ac.signal,
        onDelta: aplicarAssistente,
      });
      aplicarAssistente(textoFinal);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setErro((e as Error).message || "Falha ao falar com a IA.");
    } finally {
      setEnviando(false);
    }
  }

  async function onFoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Envie uma foto (JPG ou PNG).");
      return;
    }
    try {
      setImagem(await compactarImagem(file));
      setErro(null);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const ultimaAssistente = [...(conversa?.mensagens ?? [])].reverse().find((m) => m.role === "assistant")?.content;

  async function copiarProtocolo() {
    if (!ultimaAssistente) return;
    await copiarTexto(ultimaAssistente);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  }

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Higienizador IA" }]} />
      <PageHeader
        titulo="Higienizador IA"
        eyebrow="Assistente técnico"
        descricao="Pergunte sobre tecido, mancha, protocolo, diluição ou precificação. A IA não substitui etiqueta, ficha nem teste."
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip>Spot test obrigatório</Chip>
          <Chip tone="warn">Sem mistura química</Chip>
        </div>
      </PageHeader>

      {!pronto ? (
        <div className="mt-4">
          <AvisoHospedagemEstatica />
        </div>
      ) : (
        <>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setHistoricoAberto((v) => !v)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold"
        >
          <History className="size-4" aria-hidden />
          Histórico
        </button>
        <button
          type="button"
          onClick={() => criar(conversa?.modo ?? "chat")}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold"
        >
          <Plus className="size-4" aria-hidden />
          Nova conversa
        </button>
      </div>

      {historicoAberto ? (
        <InfoCard className="mt-3">
          {lista.filter((c) => c.mensagens.length).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conversa salva neste aparelho.</p>
          ) : (
            <ul className="grid gap-1">
              {lista
                .filter((c) => c.mensagens.length)
                .map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        persistir(lista, c.id);
                        setHistoricoAberto(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm ${c.id === ativaId ? "bg-primary/15 font-semibold" : "hover:bg-secondary"}`}
                    >
                      {c.titulo}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </InfoCard>
      ) : null}

      <Section titulo="Modo">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MODOS_IA.map((m) => {
            const on = (conversa?.modo ?? search.modo ?? "chat") === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  if (conversa) atualizarAtiva((c) => ({ ...c, modo: m.id }));
                  else criar(m.id);
                }}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${on ? "border-primary bg-primary/15 text-primary" : "border-border"}`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </Section>

      <div className="mt-4 space-y-3">
        {(conversa?.mensagens.length ?? 0) === 0 ? (
          <InfoCard>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" aria-hidden />
              Sugestões rápidas
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGESTOES_IA.map((s) => (
                <button
                  key={s.texto}
                  type="button"
                  onClick={() => void enviar(s.texto, s.modo)}
                  className="rounded-full border border-border bg-secondary px-3 py-2 text-left text-xs font-medium"
                >
                  {s.texto}
                </button>
              ))}
            </div>
          </InfoCard>
        ) : null}

        {conversa?.mensagens.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`rounded-2xl border p-4 text-sm leading-relaxed ${
              m.role === "user" ? "ml-6 border-primary/30 bg-primary/10" : "mr-4 border-border bg-card"
            }`}
          >
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {m.role === "assistant" ? <Bot className="size-3.5" aria-hidden /> : null}
              {m.role === "assistant" ? "Higienizador IA" : "Você"}
            </p>
            <MensagemFormatada texto={m.content} />
          </div>
        ))}

        {enviando && conversa?.mensagens.at(-1)?.role === "user" ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Consultando com as regras de segurança…
          </p>
        ) : null}
        <div ref={fimRef} />
      </div>

      {erro ? (
        <p className="mt-3 flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {erro}
        </p>
      ) : null}

      {imagem ? (
        <div className="mt-3 flex items-start gap-2">
          <img src={imagem} alt="Foto anexada" className="h-20 w-20 rounded-xl object-cover" />
          <button type="button" onClick={() => setImagem(null)} className="rounded-full border border-border p-1" aria-label="Remover foto">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <form
        className="mt-4 rounded-2xl border border-border bg-card p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void enviar();
        }}
      >
        <label htmlFor="ia-input" className="sr-only">
          Pergunta para o Higienizador IA
        </label>
        <textarea
          id="ia-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Descreva o tecido, a mancha ou a dúvida…"
          className="min-h-20 w-full resize-y bg-transparent px-2 py-2 text-sm outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void enviar();
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFoto(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold"
          >
            <ImagePlus className="size-4" aria-hidden />
            Foto
          </button>
          <button
            type="button"
            disabled={!ultimaAssistente}
            onClick={() => void copiarProtocolo()}
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold disabled:opacity-40"
          >
            <Copy className="size-4" aria-hidden />
            {copiado ? "Copiado" : "Copiar protocolo"}
          </button>
          <button
            type="button"
            disabled={!ultimaAssistente}
            onClick={() =>
              ultimaAssistente &&
              baixarTexto(`higienizador-ia-${Date.now()}.txt`, `Higienizador IA\n\n${ultimaAssistente}\n`)
            }
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold disabled:opacity-40"
          >
            <Download className="size-4" aria-hidden />
            Exportar
          </button>
          <button type="submit" disabled={enviando || !input.trim()} className="btn-primary ml-auto min-h-10 px-4 text-sm disabled:opacity-50">
            <Send className="size-4" aria-hidden />
            Enviar
          </button>
        </div>
      </form>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Responsabilidade: a resposta é orientação técnica, não laudo. Confirme diluição, pH e superfície no rótulo e na
        FISPQ. Teste em área discreta. Não misture químicos.
      </p>
        </>
      )}

      <Section titulo="Ferramentas do Guia">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link to="/identificar" className="rounded-2xl border border-border bg-card p-3 font-semibold">
            Identificar tecido
          </Link>
          <Link to="/checklist" className="rounded-2xl border border-border bg-card p-3 font-semibold">
            Checklist
          </Link>
          <Link to="/ferramentas/diluicao" className="rounded-2xl border border-border bg-card p-3 font-semibold">
            Diluição
          </Link>
          <Link to="/ferramentas/precificacao" className="rounded-2xl border border-border bg-card p-3 font-semibold">
            Precificação
          </Link>
        </div>
      </Section>
    </div>
  );
}

function MensagemFormatada({ texto }: { texto: string }) {
  const blocos = texto.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocos.map((b, i) => {
        const linhas = b.split("\n");
        const lista = linhas.every((l) => /^\s*(- |\d+\. )/.test(l) || l.trim() === "");
        if (lista) {
          return (
            <ul key={i} className="space-y-1">
              {linhas
                .filter((l) => l.trim())
                .map((l) => (
                  <li key={l} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{comNegrito(l.replace(/^\s*(- |\d+\. )/, ""))}</span>
                  </li>
                ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {comNegrito(b)}
          </p>
        );
      })}
    </div>
  );
}

function comNegrito(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
