import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

import {
  CONFIG_PADRAO,
  STORAGE_KEY,
  classeDaTransicao,
  direcaoAutomatica,
  normalizarConfig,
  type Direcao,
  type TransitionConfig,
} from "@/lib/page-transitions";

export type PageTransitionProps = {
  children: ReactNode;
  /** Config explícita (usada na página de ajustes para pré-visualizar). */
  config?: TransitionConfig;
  /** Chave que dispara a animação. Padrão: pathname atual. */
  transitionKey?: string;
};

/** Evento disparado quando a configuração muda em outra parte do app. */
export const EVENTO_CONFIG = "gh:transicoes:change";

function lerConfig(): TransitionConfig {
  if (typeof window === "undefined") return CONFIG_PADRAO;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizarConfig(JSON.parse(raw)) : CONFIG_PADRAO;
  } catch {
    return CONFIG_PADRAO;
  }
}

/**
 * Envolve o conteúdo da rota e anima a entrada de cada página.
 *
 * Só usa `transform`/`opacity`/`filter` (aceleração por hardware) e remove a
 * classe de animação ao terminar, evitando custo em repaints subsequentes.
 */
export function PageTransition({ children, config, transitionKey }: PageTransitionProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const chave = transitionKey ?? pathname;

  const [configLocal, setConfigLocal] = useState<TransitionConfig>(CONFIG_PADRAO);
  const [reduzirMovimento, setReduzirMovimento] = useState(false);
  const anteriorRef = useRef<string>(chave);
  const direcaoRef = useRef<Exclude<Direcao, "auto">>("right");

  // Hidratação: config e preferência de movimento só existem no cliente.
  useEffect(() => {
    setConfigLocal(lerConfig());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduzirMovimento(mq.matches);
    sync();
    mq.addEventListener("change", sync);

    const onChange = () => setConfigLocal(lerConfig());
    window.addEventListener(EVENTO_CONFIG, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener(EVENTO_CONFIG, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const ativa = config ?? configLocal;

  // Resolvido na própria renderização (sem setState em efeito): evita um
  // frame intermediário sem animação e avisos de atualização cruzada.
  if (anteriorRef.current !== chave) {
    direcaoRef.current = ativa.direcao === "auto" ? direcaoAutomatica(anteriorRef.current, chave) : direcaoRef.current;
    anteriorRef.current = chave;
  }
  const direcao = ativa.direcao === "auto" ? direcaoRef.current : ativa.direcao;

  const desligada = ativa.efeito === "none" || (ativa.respeitarReducedMotion && reduzirMovimento);
  const classe = desligada ? "" : classeDaTransicao(ativa.efeito, direcao);

  return (
    <Camada
      key={chave}
      classe={classe}
      duracao={ativa.duracao}
      easing={ativa.easing}
      opacidade={ativa.opacidadeInicial}
      distancia={ativa.distancia}
    >
      {children}
    </Camada>
  );
}

/**
 * Camada remontada a cada navegação (via `key`), o que reinicia a animação.
 * Ao terminar, a classe é removida para não manter `will-change` ativo.
 */
function Camada({
  children,
  classe,
  duracao,
  easing,
  opacidade,
  distancia,
}: {
  children: ReactNode;
  classe: string;
  duracao: number;
  easing: string;
  opacidade: number;
  distancia: number;
}) {
  const [animando, setAnimando] = useState(true);
  const aplicar = classe && animando;

  return (
    <div
      className={aplicar ? `pt-root ${classe}` : undefined}
      onAnimationEnd={() => setAnimando(false)}
      style={
        aplicar
          ? ({
              "--pt-duration": `${duracao}ms`,
              "--pt-easing": easing,
              "--pt-opacity": String(opacidade),
              "--pt-distance": `${distancia}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
