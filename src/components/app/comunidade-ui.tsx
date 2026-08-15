import { Link } from "@tanstack/react-router";
import { BadgeCheck, MessageCircle, ThumbsUp } from "lucide-react";

import { autorPorId, niveis, type PostFeed, type Autor } from "@/data/comunidade";

export function AbasComunidade() {
  const abas = [
    { to: "/comunidade", label: "Feed", exact: true },
    { to: "/comunidade/perguntas", label: "Perguntas", exact: false },
    { to: "/comunidade/ranking", label: "Ranking", exact: false },
    { to: "/profissionais", label: "Profissionais", exact: false },
  ] as const;

  return (
    <nav aria-label="Seções da comunidade" className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {abas.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          activeOptions={{ exact: a.exact }}
          className="min-h-10 shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground data-[status=active]:border-primary data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
        >
          {a.label}
        </Link>
      ))}
    </nav>
  );
}

export function SeloNivel({ autor }: { autor: Autor }) {
  const n = niveis[autor.nivel];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
      <span aria-hidden>{n.emoji}</span>
      {n.rotulo}
    </span>
  );
}

export function AutorLinha({ autorId, extra }: { autorId: string; extra?: string }) {
  const autor = autorPorId(autorId);
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/profissionais/$id"
        params={{ id: autor.id }}
        className="flex items-center gap-1 text-sm font-semibold hover:text-primary"
      >
        {autor.nome}
        {autor.verificado ? <BadgeCheck className="size-4 text-primary" aria-label="Perfil verificado" /> : null}
      </Link>
      <SeloNivel autor={autor} />
      {extra ? <span className="ml-auto text-xs text-muted-foreground">{extra}</span> : null}
    </div>
  );
}

const rotuloTipo: Record<PostFeed["tipo"], string> = {
  "antes-depois": "Antes e depois",
  dica: "Dica",
  caso: "Caso real",
  duvida: "Dúvida",
};

export function CardPost({ post }: { post: PostFeed }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <AutorLinha autorId={post.autorId} extra={post.criadoEm} />
      <p className="mt-3 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        {rotuloTipo[post.tipo]}
      </p>
      <h3 className="mt-2 text-base font-bold leading-snug">{post.titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.texto}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((t) => (
          <li key={t} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            #{t}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="size-3.5" aria-hidden /> {post.curtidas}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="size-3.5" aria-hidden /> {post.comentarios}
        </span>
      </div>
    </article>
  );
}
