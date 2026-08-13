/**
 * Sistema de transições de página.
 *
 * Arquitetura:
 * - Este módulo concentra tipos, presets e persistência da configuração.
 * - A animação em si é 100% CSS (keyframes em `src/styles.css`), dirigida por
 *   custom properties. Isso mantém o trabalho na compositor thread
 *   (apenas `transform` e `opacity`), garantindo aceleração por hardware.
 * - O componente `PageTransition` apenas troca a `key` e as variáveis CSS.
 */

export const EFEITOS = [
  "none",
  "fade",
  "slide",
  "zoom-in",
  "zoom-out",
  "flip-x",
  "flip-y",
  "parallax",
  "blur-rise",
] as const;

export type Efeito = (typeof EFEITOS)[number];

export const DIRECOES = ["auto", "left", "right", "up", "down"] as const;
export type Direcao = (typeof DIRECOES)[number];

/** Curvas de aceleração pré-definidas (rótulo -> valor CSS). */
export const EASING_PADRAO = "cubic-bezier(0.22, 1, 0.36, 1)";

export const EASINGS: Record<string, string> = {
  "suave (padrão)": EASING_PADRAO,
  "entrada rápida": "cubic-bezier(0.16, 1, 0.3, 1)",
  linear: "linear",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  elástico: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

export type TransitionConfig = {
  efeito: Efeito;
  /** Duração em milissegundos. */
  duracao: number;
  /** Valor CSS de `animation-timing-function`. */
  easing: string;
  direcao: Direcao;
  /** Opacidade inicial da página que entra (0 a 1). */
  opacidadeInicial: number;
  /** Deslocamento inicial em pixels para slide/parallax. */
  distancia: number;
  /** Respeitar `prefers-reduced-motion` do sistema. */
  respeitarReducedMotion: boolean;
};

export const CONFIG_PADRAO: TransitionConfig = {
  efeito: "fade",
  duracao: 380,
  easing: EASING_PADRAO,
  direcao: "auto",
  opacidadeInicial: 0,
  distancia: 24,
  respeitarReducedMotion: true,
};

export const STORAGE_KEY = "gh:transicoes";

/** Normaliza dados vindos do localStorage (podem estar corrompidos/antigos). */
export function normalizarConfig(raw: unknown): TransitionConfig {
  if (!raw || typeof raw !== "object") return CONFIG_PADRAO;
  const v = raw as Partial<TransitionConfig>;
  return {
    efeito: EFEITOS.includes(v.efeito as Efeito) ? (v.efeito as Efeito) : CONFIG_PADRAO.efeito,
    duracao: clamp(Number(v.duracao) || CONFIG_PADRAO.duracao, 80, 1600),
    easing: typeof v.easing === "string" && v.easing ? v.easing : CONFIG_PADRAO.easing,
    direcao: DIRECOES.includes(v.direcao as Direcao) ? (v.direcao as Direcao) : CONFIG_PADRAO.direcao,
    opacidadeInicial: clamp(
      typeof v.opacidadeInicial === "number" ? v.opacidadeInicial : CONFIG_PADRAO.opacidadeInicial,
      0,
      1,
    ),
    distancia: clamp(Number(v.distancia) ?? CONFIG_PADRAO.distancia, 0, 200),
    respeitarReducedMotion: v.respeitarReducedMotion !== false,
  };
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/**
 * Direção automática: navegar "para dentro" (mais segmentos) entra pela
 * direita; voltar para um nível mais raso entra pela esquerda.
 */
export function direcaoAutomatica(anterior: string, atual: string): Exclude<Direcao, "auto"> {
  const profundidade = (p: string) => p.split("/").filter(Boolean).length;
  return profundidade(atual) >= profundidade(anterior) ? "right" : "left";
}

/** Classe CSS correspondente ao efeito + direção resolvida. */
export function classeDaTransicao(efeito: Efeito, direcao: Exclude<Direcao, "auto">): string {
  if (efeito === "none") return "";
  if (efeito === "slide") return `pt-slide-${direcao}`;
  if (efeito === "parallax") return `pt-parallax-${direcao === "up" || direcao === "down" ? direcao : "right"}`;
  return `pt-${efeito}`;
}
