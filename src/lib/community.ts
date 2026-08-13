/**
 * Constantes e regras de domínio da comunidade.
 *
 * Mantidas fora dos componentes para que rotas, formulários e filtros
 * compartilhem exatamente a mesma lista — evitando divergência entre o que o
 * usuário publica e o que os filtros conseguem exibir.
 */

export type PostKind =
  | "discussao"
  | "duvida"
  | "antes_depois"
  | "produto"
  | "tecido"
  | "automotivo"
  | "dica"
  | "atencao";

export interface TipoPost {
  slug: PostKind;
  emoji: string;
  label: string;
  /** Classe de destaque usando apenas tokens semânticos. */
  tone: string;
}

export const TIPOS_POST: readonly TipoPost[] = [
  { slug: "discussao", emoji: "💬", label: "Discussão", tone: "bg-muted text-muted-foreground" },
  { slug: "duvida", emoji: "❓", label: "Dúvida", tone: "bg-primary/15 text-primary" },
  { slug: "antes_depois", emoji: "📸", label: "Antes e Depois", tone: "bg-success/15 text-success" },
  { slug: "produto", emoji: "🧪", label: "Produto", tone: "bg-primary/10 text-primary" },
  { slug: "tecido", emoji: "🧵", label: "Tecido", tone: "bg-accent text-accent-foreground" },
  { slug: "automotivo", emoji: "🚗", label: "Automotivo", tone: "bg-accent text-accent-foreground" },
  { slug: "dica", emoji: "💡", label: "Dica", tone: "bg-warning/15 text-warning-foreground" },
  { slug: "atencao", emoji: "⚠️", label: "Caso de Atenção", tone: "bg-destructive/15 text-destructive" },
] as const;

export function tipoPost(slug: string): TipoPost {
  return TIPOS_POST.find((t) => t.slug === slug) ?? TIPOS_POST[0]!;
}

export const CATEGORIAS_PERGUNTA = [
  { slug: "tecidos", label: "Tecidos", emoji: "🧵" },
  { slug: "manchas", label: "Manchas", emoji: "🟤" },
  { slug: "produtos", label: "Produtos", emoji: "🧪" },
  { slug: "quimica", label: "Química", emoji: "⚗️" },
  { slug: "estofados", label: "Estofados", emoji: "🛋️" },
  { slug: "automotivo", label: "Automotivo", emoji: "🚗" },
  { slug: "equipamentos", label: "Equipamentos", emoji: "🧰" },
  { slug: "impermeabilizacao", label: "Impermeabilização", emoji: "💦" },
  { slug: "precificacao", label: "Precificação", emoji: "💰" },
  { slug: "marketing", label: "Marketing", emoji: "📈" },
  { slug: "atendimento", label: "Atendimento", emoji: "🤝" },
] as const;

export function categoriaPergunta(slug: string) {
  return CATEGORIAS_PERGUNTA.find((c) => c.slug === slug) ?? CATEGORIAS_PERGUNTA[0];
}

/**
 * Níveis de participação. IMPORTANTE: representam contribuição na comunidade,
 * nunca certificação técnica — a UI precisa deixar isso explícito.
 */
export interface Nivel {
  min: number;
  nome: string;
  emoji: string;
}

export const NIVEIS: readonly Nivel[] = [
  { min: 0, nome: "Iniciante", emoji: "🌱" },
  { min: 50, nome: "Aprendiz", emoji: "🔧" },
  { min: 150, nome: "Profissional", emoji: "🧰" },
  { min: 400, nome: "Especialista", emoji: "🧠" },
  { min: 900, nome: "Mentor", emoji: "🤝" },
];

export function nivelPorPontos(pontos: number) {
  let atual: Nivel = NIVEIS[0]!;
  for (const n of NIVEIS) if (pontos >= n.min) atual = n;
  const proximo = NIVEIS.find((n) => n.min > pontos);
  const progresso = proximo ? Math.round(((pontos - atual.min) / (proximo.min - atual.min)) * 100) : 100;
  return { atual, proximo, progresso: Math.min(Math.max(progresso, 0), 100) };
}

export const MOTIVOS_DENUNCIA = [
  "Spam",
  "Golpe ou fraude",
  "Conteúdo ofensivo",
  "Informação perigosa",
  "Publicidade abusiva",
  "Produto falsificado",
  "Assédio",
] as const;

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export const ESPECIALIDADES = [
  "Higienização de estofados",
  "Higienização residencial",
  "Higienização automotiva",
  "Estética automotiva",
  "Detailing",
  "Impermeabilização",
  "Limpeza de carpetes",
  "Limpeza pós-obra",
  "Colchões",
  "Couro e courino",
] as const;

/** Formata data em pt-BR de forma estável entre servidor e cliente. */
export function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `há ${dias} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Sanitiza uma URL informada pelo usuário antes de virar link externo. */
export function urlSegura(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const bruto = valor.trim();
  if (!bruto) return null;
  const comEsquema = /^https?:\/\//i.test(bruto) ? bruto : `https://${bruto}`;
  try {
    const url = new URL(comEsquema);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Mantém apenas dígitos — usado para montar o link do WhatsApp com segurança. */
export function somenteDigitos(valor: string | null | undefined): string | null {
  const digitos = (valor ?? "").replace(/\D/g, "");
  return digitos.length >= 10 && digitos.length <= 15 ? digitos : null;
}

/** Categorias usadas na seção de perguntas e respostas. */
export const CATEGORIAS_DUVIDA = [
  "Manchas",
  "Tecidos",
  "Produtos",
  "Equipamentos",
  "Processos",
  "Automotiva",
  "Precificação",
  "Atendimento",
] as const;
