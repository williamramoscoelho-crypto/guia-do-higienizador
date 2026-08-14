import { tecidos } from "./tecidos";
import { manchas } from "./manchas";
import { produtos } from "./produtos";
import { indicacoesDaMancha, nomeMarcaFicha } from "./manchas-produtos";
import { kitsHigienizacao } from "./conteudo";

export const MODOS_IA = [
  { id: "chat", label: "Chat", dica: "Pergunta técnica livre" },
  { id: "tecido", label: "Identificar tecido", dica: "Hipótese + cuidados" },
  { id: "mancha", label: "Resolver mancha", dica: "Protocolo passo a passo" },
  { id: "protocolo", label: "Protocolo / checklist", dica: "Atendimento completo" },
  { id: "diluicao", label: "Diluição", dica: "Orienta a calculadora" },
  { id: "precificacao", label: "Precificação", dica: "Orienta a calculadora" },
  { id: "comecar", label: "Quero começar", dica: "Kit e primeiros passos" },
] as const;

export type ModoIA = (typeof MODOS_IA)[number]["id"];

export const SUGESTOES_IA: { modo: ModoIA; texto: string }[] = [
  { modo: "mancha", texto: "Mancha de urina em sofá de suede" },
  { modo: "tecido", texto: "Sofá de suede: como higienizar com segurança" },
  { modo: "precificacao", texto: "Como precificar um sofá de 3 lugares" },
  { modo: "comecar", texto: "Kit inicial para começar no ramo" },
  { modo: "mancha", texto: "Mancha de café em tecido sintético" },
  { modo: "protocolo", texto: "Checklist para banco automotivo de couro" },
];

const EXTRA_MODO: Record<ModoIA, string> = {
  chat: "Responda a pergunta com protocolo seguro. Se faltar tecido, mancha ou etiqueta, pergunte antes de indicar química.",
  tecido:
    "Modo identificador: peça aparência, toque, absorção e etiqueta. Devolva 2–3 hipóteses com probabilidade relativa (não certeza), cuidados, o que evitar e categorias de produto. Sempre diga para confirmar na etiqueta. Foto é só indício.",
  mancha:
    "Modo mancha: peça tecido + origem da mancha + se é recente. Devolva: 1) o que não fazer 2) protocolo numerado 3) categorias de produto (sem ranking de marca) 4) riscos 5) tempo estimado 6) limitação (pode não sair 100%). Se o catálogo do Guia citar uma ficha, mencione como citação do fabricante, não como 'o melhor'.",
  protocolo:
    "Modo protocolo: monte checklist de atendimento (inspeção, fotos, etiqueta, teste, método, extração, secagem, alinhamento com o cliente) para a peça descrita. Inclua o que registrar e o que falar ao cliente.",
  diluicao:
    "Modo diluição: NÃO invente proporção. Oriente a usar a ficha/rótulo e a calculadora em /ferramentas/diluicao (produto da ficha + intensidade citada + volume). Explique 1:10 nesta conta como 1 de concentrado + 10 de água. Se a ficha não tiver 1:N, diga para não aplicar até ler o rótulo.",
  precificacao:
    "Modo precificação: não dê tabela de mercado. Oriente a calculadora em /ferramentas/precificacao (produto, deslocamento, horas, mão de obra, despesas, margem). Lembre que preço abaixo do custo é prejuízo.",
  comecar:
    "Modo iniciante: kit por categoria (não marca), erros graves, ordem de aprendizado (identificar tecido → checklist → fluxo → fichas). Aponte /comecar.",
};

export function extraDoModo(modo: ModoIA) {
  return EXTRA_MODO[modo] ?? EXTRA_MODO.chat;
}

/** Catálogo compacto injetado no pedido. A regra de segurança vive na Edge Function. */
export function catalogoParaIA(): string {
  const tec = tecidos
    .map((t) => `- ${t.nome} (/${t.slug}): ${t.resumo} Método: ${t.metodo} Evitar: ${t.evitar.slice(0, 3).join("; ")}`)
    .join("\n");

  const man = manchas
    .map((m) => {
      const inds = indicacoesDaMancha(m.slug)
        .slice(0, 2)
        .map((i) => `${nomeMarcaFicha(i.ficha.marca)} ${i.ficha.nome} [${i.papel}]`)
        .join("; ");
      return `- ${m.nome} (/${m.slug}): ${m.dificuldade}. ${m.limitacoes}${inds ? ` Fichas citadas (não é ranking): ${inds}` : ""}`;
    })
    .join("\n");

  const prod = produtos
    .map((p) => `- ${p.nome} [${p.categoria}]: ${p.funcao} Evitar: ${p.ondeEvitar.slice(0, 2).join("; ")}`)
    .join("\n");

  const kits = kitsHigienizacao.map((k) => `- ${k.nivel}: ${k.itens.join(", ")}`).join("\n");

  return [
    "CATÁLOGO INTERNO DO GUIA DO HIGIENIZADOR (use como referência; não invente química fora disto e das fichas):",
    "TECIDOS:",
    tec,
    "MANCHAS:",
    man,
    "CATEGORIAS DE PRODUTO (genéricas, sem preferir marca):",
    prod,
    "KITS POR CATEGORIA:",
    kits,
    "FERRAMENTAS DO SITE: /identificar /checklist /ferramentas/diluicao /ferramentas/precificacao /comecar /fichas /manchas /tecidos /fluxo /cuidados",
    "PARCERIA EDITORIAL: Auto Limpeza Pro pode ser mencionada como empresa parceira. Não misture sistemas nem faça ranking comercial.",
  ].join("\n");
}
