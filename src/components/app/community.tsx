import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { nivelPorPontos, tipoPost } from "@/lib/community";
import { cn } from "@/lib/utils";

export interface AutorResumo {
  id: string;
  handle: string | null;
  nome: string;
  nome_profissional?: string | null;
  avatar_url?: string | null;
  cidade?: string | null;
  estado?: string | null;
  mostrar_cidade?: boolean | null;
  perfil_publico?: boolean | null;
}

export function Avatar({
  nome,
  url,
  tamanho = "md",
}: {
  nome: string;
  url?: string | null | undefined;
  tamanho?: "sm" | "md" | "lg" | undefined;
}) {
  const classes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-20 text-2xl" }[tamanho];
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  if (url) {
    return (
      <img
        src={url}
        alt={`Foto de ${nome}`}
        loading="lazy"
        className={cn("shrink-0 rounded-full border border-border object-cover", classes)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border bg-primary/15 font-bold text-primary",
        classes,
      )}
    >
      {iniciais || "?"}
    </span>
  );
}

export function AutorLinha({ autor, data, extra }: { autor: AutorResumo; data?: string; extra?: ReactNode }) {
  const local = autor.mostrar_cidade === false ? null : [autor.cidade, autor.estado].filter(Boolean).join(" – ");
  const conteudo = (
    <>
      <Avatar nome={autor.nome} url={autor.avatar_url} tamanho="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{autor.nome_profissional || autor.nome}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {[local, data].filter(Boolean).join(" · ")}
        </span>
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-2.5">
      {autor.handle && autor.perfil_publico !== false ? (
        <Link to="/p/$handle" params={{ handle: autor.handle }} className="flex min-w-0 flex-1 items-center gap-2.5">
          {conteudo}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2.5">{conteudo}</div>
      )}
      {extra}
    </div>
  );
}

export function TipoBadge({ kind }: { kind: string }) {
  const tipo = tipoPost(kind);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", tipo.tone)}>
      <span aria-hidden>{tipo.emoji}</span>
      {tipo.label}
    </span>
  );
}

export function NivelBadge({ pontos }: { pontos: number }) {
  const { atual } = nivelPorPontos(pontos);
  return (
    <span
      title="Nível de participação na comunidade (não é certificação técnica)"
      className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary"
    >
      <span aria-hidden>{atual.emoji}</span>
      {atual.nome}
    </span>
  );
}

export function Vazio({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <p className="text-sm font-semibold">{titulo}</p>
      {descricao ? <p className="mt-1 text-xs text-muted-foreground">{descricao}</p> : null}
      {acao ? <div className="mt-4 flex justify-center">{acao}</div> : null}
    </div>
  );
}

export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-card/60" />
      ))}
      <span className="sr-only">Carregando conteúdo…</span>
    </div>
  );
}

export function EntrarCTA({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-center">
      <p className="text-sm font-semibold">{mensagem}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Link to="/auth" search={{ modo: "entrar" }} className="btn-primary">
          Entrar
        </Link>
        <Link
          to="/auth"
          search={{ modo: "criar" }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export function Chips<T extends string>({
  itens,
  valor,
  onChange,
  rotulo,
}: {
  itens: readonly { slug: T; label: string; emoji?: string }[];
  valor: T | null;
  onChange: (v: T | null) => void;
  rotulo: string;
}) {
  return (
    <div role="group" aria-label={rotulo} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={valor === null}
        className={cn(
          "min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition-colors",
          valor === null ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground",
        )}
      >
        Todos
      </button>
      {itens.map((i) => (
        <button
          key={i.slug}
          type="button"
          onClick={() => onChange(valor === i.slug ? null : i.slug)}
          aria-pressed={valor === i.slug}
          className={cn(
            "min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition-colors",
            valor === i.slug ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground",
          )}
        >
          {i.emoji ? <span aria-hidden>{i.emoji} </span> : null}
          {i.label}
        </button>
      ))}
    </div>
  );
}
