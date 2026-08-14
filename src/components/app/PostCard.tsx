import { Link } from "@tanstack/react-router";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { apiCurtir, apiSalvarPost } from "@/lib/api";
import { usesPhpApi } from "@/lib/backend";
import { useAuth } from "@/lib/auth";
import { tempoRelativo } from "@/lib/community";
import { cn } from "@/lib/utils";
import { AutorLinha, TipoBadge, type AutorResumo } from "@/components/app/community";
import { DenunciarBotao } from "@/components/app/DenunciarBotao";

export interface PostFeed {
  id: string;
  kind: string;
  titulo: string | null;
  corpo: string;
  imagens: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  author: AutorResumo | null;
}

export function PostCard({
  post,
  curtido,
  salvo,
  onMudou,
  compacto = false,
}: {
  post: PostFeed;
  curtido: boolean;
  salvo: boolean;
  onMudou?: () => void;
  compacto?: boolean;
}) {
  const { user } = useAuth();
  const [otimistaCurtido, setOtimistaCurtido] = useState<boolean | null>(null);
  const [otimistaSalvo, setOtimistaSalvo] = useState<boolean | null>(null);
  const [copiado, setCopiado] = useState(false);

  const estaCurtido = otimistaCurtido ?? curtido;
  const estaSalvo = otimistaSalvo ?? salvo;
  const totalCurtidas = post.likes_count + (otimistaCurtido === null ? 0 : otimistaCurtido === curtido ? 0 : otimistaCurtido ? 1 : -1);

  async function alternarCurtida() {
    if (!user) return;
    const proximo = !estaCurtido;
    setOtimistaCurtido(proximo);
    try {
      if (usesPhpApi()) await apiCurtir(post.id, proximo);
      else {
        const acao = proximo
          ? supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id })
          : supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
        const { error } = await acao;
        if (error) throw error;
      }
    } catch {
      setOtimistaCurtido(!proximo);
      return;
    }
    onMudou?.();
  }

  async function alternarSalvo() {
    if (!user) return;
    const proximo = !estaSalvo;
    setOtimistaSalvo(proximo);
    try {
      if (usesPhpApi()) await apiSalvarPost(post.id, proximo);
      else {
        const { error } = await (proximo
          ? supabase.from("post_saves").insert({ post_id: post.id, user_id: user.id })
          : supabase.from("post_saves").delete().eq("post_id", post.id).eq("user_id", user.id));
        if (error) throw error;
      }
    } catch {
      setOtimistaSalvo(!proximo);
      return;
    }
    onMudou?.();
  }

  async function compartilhar() {
    const url = `${window.location.origin}/comunidade/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: post.titulo ?? "Publicação", url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      /* usuário cancelou o compartilhamento */
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      {post.author ? <AutorLinha autor={post.author} data={tempoRelativo(post.created_at)} /> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TipoBadge kind={post.kind} />
      </div>

      {post.titulo ? (
        <h3 className="mt-2 text-base font-bold leading-snug">
          <Link to="/comunidade/post/$id" params={{ id: post.id }}>
            {post.titulo}
          </Link>
        </h3>
      ) : null}

      <p className={cn("mt-2 whitespace-pre-wrap text-sm leading-relaxed", compacto && "line-clamp-4")}>{post.corpo}</p>

      {post.imagens.length > 0 ? (
        <ul className={cn("mt-3 grid gap-2", post.imagens.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {post.imagens.slice(0, 4).map((src) => (
            <li key={src}>
              <img
                src={src}
                alt="Imagem enviada pelo profissional"
                loading="lazy"
                className="h-40 w-full rounded-xl border border-border object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-4 flex items-center gap-1">
        <BotaoAcao
          rotulo={estaCurtido ? "Remover curtida" : "Curtir"}
          ativo={estaCurtido}
          desabilitado={!user}
          onClick={alternarCurtida}
        >
          <Heart className={cn("size-4", estaCurtido && "fill-current")} aria-hidden />
          {totalCurtidas}
        </BotaoAcao>

        <Link
          to="/comunidade/post/$id"
          params={{ id: post.id }}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground"
        >
          <MessageCircle className="size-4" aria-hidden />
          {post.comments_count}
        </Link>

        <BotaoAcao rotulo={estaSalvo ? "Remover dos salvos" : "Salvar"} ativo={estaSalvo} desabilitado={!user} onClick={alternarSalvo}>
          <Bookmark className={cn("size-4", estaSalvo && "fill-current")} aria-hidden />
        </BotaoAcao>

        <BotaoAcao rotulo="Compartilhar" ativo={false} onClick={compartilhar}>
          <Share2 className="size-4" aria-hidden />
          {copiado ? <span className="text-[11px]">copiado</span> : null}
        </BotaoAcao>

        <span className="ml-auto">
          <DenunciarBotao alvoTipo="post" alvoId={post.id} />
        </span>
      </footer>
    </article>
  );
}

function BotaoAcao({
  children,
  rotulo,
  ativo,
  onClick,
  desabilitado,
}: {
  children: React.ReactNode;
  rotulo: string;
  ativo: boolean;
  onClick: () => void;
  desabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-label={rotulo}
      aria-pressed={ativo}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors disabled:opacity-40",
        ativo ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
