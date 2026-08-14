/**
 * Conteúdo de demonstração da comunidade.
 *
 * Serve para o frontend nascer completo e navegável antes das tabelas de
 * posts/perguntas/reputação existirem no backend. Quando o banco entrar,
 * troque estas listas por consultas — os componentes já leem exatamente
 * estes formatos.
 */

export type Nivel = "iniciante" | "praticante" | "especialista" | "mestre";

export type Autor = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  empresa: string;
  nivel: Nivel;
  pontos: number;
  especialidades: string[];
  bio: string;
  respostas: number;
  verificado: boolean;
};

export type PostFeed = {
  id: string;
  autorId: string;
  tipo: "antes-depois" | "dica" | "caso" | "duvida";
  titulo: string;
  texto: string;
  tags: string[];
  curtidas: number;
  comentarios: number;
  criadoEm: string;
};

export type Pergunta = {
  id: string;
  autorId: string;
  titulo: string;
  detalhe: string;
  tags: string[];
  respostas: Resposta[];
  resolvida: boolean;
  criadoEm: string;
};

export type Resposta = {
  id: string;
  autorId: string;
  texto: string;
  votos: number;
  melhor: boolean;
};

export const niveis: Record<Nivel, { rotulo: string; emoji: string; minimo: number }> = {
  iniciante: { rotulo: "Iniciante", emoji: "🌱", minimo: 0 },
  praticante: { rotulo: "Praticante", emoji: "🧽", minimo: 250 },
  especialista: { rotulo: "Especialista", emoji: "🎖️", minimo: 800 },
  mestre: { rotulo: "Mestre higienizador", emoji: "🏆", minimo: 2000 },
};

export function nivelPorPontos(pontos: number): Nivel {
  if (pontos >= niveis.mestre.minimo) return "mestre";
  if (pontos >= niveis.especialista.minimo) return "especialista";
  if (pontos >= niveis.praticante.minimo) return "praticante";
  return "iniciante";
}

export const autores: Autor[] = [
  {
    id: "u1",
    nome: "Marcos Vinícius",
    cidade: "Campinas",
    estado: "SP",
    empresa: "MV Higienização",
    nivel: "mestre",
    pontos: 3120,
    especialidades: ["Sofás", "Colchões", "Automotivo"],
    bio: "12 anos de estrada. Foco em extração quente e controle de odor em pets.",
    respostas: 214,
    verificado: true,
  },
  {
    id: "u2",
    nome: "Aline Prado",
    cidade: "Curitiba",
    estado: "PR",
    empresa: "Prado Clean",
    nivel: "especialista",
    pontos: 1480,
    especialidades: ["Tecidos delicados", "Suede", "Linho"],
    bio: "Especialista em fibras naturais e peças de designer. pH neutro sempre.",
    respostas: 137,
    verificado: true,
  },
  {
    id: "u3",
    nome: "Rafael Souza",
    cidade: "Belo Horizonte",
    estado: "MG",
    empresa: "RS Estofados",
    nivel: "especialista",
    pontos: 940,
    especialidades: ["Automotivo", "Couro", "Impermeabilização"],
    bio: "Detalhamento interno automotivo e hidratação de couro.",
    respostas: 88,
    verificado: false,
  },
  {
    id: "u4",
    nome: "Juliana Castro",
    cidade: "Recife",
    estado: "PE",
    empresa: "Castro Clean Care",
    nivel: "praticante",
    pontos: 410,
    especialidades: ["Colchões", "Anti-ácaro"],
    bio: "Começando no ramo há 1 ano, focada em higienização residencial.",
    respostas: 31,
    verificado: false,
  },
  {
    id: "u5",
    nome: "Diego Almeida",
    cidade: "Porto Alegre",
    estado: "RS",
    empresa: "Almeida Serviços",
    nivel: "praticante",
    pontos: 275,
    especialidades: ["Tapetes", "Carpetes"],
    bio: "Tapetes e carpetes comerciais, atendimento noturno.",
    respostas: 19,
    verificado: false,
  },
  {
    id: "u6",
    nome: "Patrícia Lima",
    cidade: "Goiânia",
    estado: "GO",
    empresa: "PL Higiene",
    nivel: "iniciante",
    pontos: 90,
    especialidades: ["Sofás"],
    bio: "Primeiros meses no ramo, aprendendo protocolos e precificação.",
    respostas: 6,
    verificado: false,
  },
];

export const postsDemo: PostFeed[] = [
  {
    id: "p1",
    autorId: "u1",
    tipo: "antes-depois",
    titulo: "Sofá de chenille com 4 anos sem limpeza",
    texto:
      "Aspiração profunda, pré-spray alcalino diluído 1:20, dwell de 8 minutos, extração com água a 60 °C e enxágue com neutralizador ácido. Secagem forçada com turbina por 3 h. Zero retorno de mancha depois de 15 dias.",
    tags: ["chenille", "extração", "pré-spray"],
    curtidas: 128,
    comentarios: 24,
    criadoEm: "há 2 h",
  },
  {
    id: "p2",
    autorId: "u2",
    tipo: "dica",
    titulo: "Suede claro: pare de usar alcalino forte",
    texto:
      "Em suede e microfibra clara o alcalino forte abre halo e desbota. Uso detergente neutro bem diluído, escova de cerdas macias em movimento circular leve e extração com pouca água. Sempre teste em área escondida antes.",
    tags: ["suede", "pH neutro", "halo"],
    curtidas: 96,
    comentarios: 17,
    criadoEm: "há 6 h",
  },
  {
    id: "p3",
    autorId: "u3",
    tipo: "caso",
    titulo: "Banco de couro com desgaste de tingimento",
    texto:
      "Cliente queria remover mancha escura no encosto. Diagnóstico: não era sujidade, era perda de pigmento. Limpei com produto específico para couro, hidratei e encaminhei para tingimento — recusar o serviço errado também é serviço.",
    tags: ["couro", "automotivo", "diagnóstico"],
    curtidas: 74,
    comentarios: 12,
    criadoEm: "ontem",
  },
  {
    id: "p4",
    autorId: "u4",
    tipo: "duvida",
    titulo: "Colchão com mancha de urina antiga: qual sequência?",
    texto:
      "Mancha amarelada com cerca de 6 meses e odor forte. Já fiz extração com neutro e o cheiro voltou no dia seguinte. Alguém tem um protocolo com enzimático que funcione bem em espuma?",
    tags: ["colchão", "urina", "enzimático"],
    curtidas: 41,
    comentarios: 29,
    criadoEm: "ontem",
  },
];

export const perguntasDemo: Pergunta[] = [
  {
    id: "q1",
    autorId: "u4",
    titulo: "Posso usar o mesmo pré-spray em sofá de linho e de poliéster?",
    detalhe:
      "Tenho um pré-spray alcalino que uso em poliéster com ótimo resultado. Um cliente tem sofá de linho misto e fiquei na dúvida sobre risco de encolhimento e amarelamento.",
    tags: ["linho", "poliéster", "pré-spray"],
    resolvida: true,
    criadoEm: "há 3 dias",
    respostas: [
      {
        id: "r1",
        autorId: "u2",
        texto:
          "Não. Fibra natural como linho reage mal a pH alto: risco de encolhimento, perda de brilho e amarelamento das fibras de celulose. Use neutro a levemente ácido, pouca água e secagem rápida.",
        votos: 34,
        melhor: true,
      },
      {
        id: "r2",
        autorId: "u1",
        texto:
          "Complementando: confirme a etiqueta. Se vier código S (solvente), nem água você deve usar — vai para limpeza a seco.",
        votos: 21,
        melhor: false,
      },
    ],
  },
  {
    id: "q2",
    autorId: "u6",
    titulo: "Quanto cobrar por sofá de 3 lugares em cidade pequena?",
    detalhe:
      "Estou começando e não sei como formar preço sem estar de graça nem espantar cliente. Como vocês montam o custo por hora e o deslocamento?",
    tags: ["precificação", "início"],
    resolvida: false,
    criadoEm: "há 4 dias",
    respostas: [
      {
        id: "r3",
        autorId: "u5",
        texto:
          "Some custo de produto por serviço, energia, desgaste do equipamento, deslocamento e o seu valor-hora. Depois aplique a margem. A calculadora de precificação do guia faz isso direitinho.",
        votos: 18,
        melhor: false,
      },
    ],
  },
  {
    id: "q3",
    autorId: "u5",
    titulo: "Extratora entupindo com frequência: o que checo primeiro?",
    detalhe: "Perde pressão no meio do serviço e o jato fica irregular. Uso produto em pó diluído na hora.",
    tags: ["equipamento", "extratora", "manutenção"],
    resolvida: false,
    criadoEm: "há 5 dias",
    respostas: [
      {
        id: "r4",
        autorId: "u3",
        texto:
          "Produto em pó mal dissolvido é a causa número um. Dissolva em água morna, filtre antes de abastecer e faça enxágue da bomba com água limpa ao fim do dia.",
        votos: 26,
        melhor: true,
      },
    ],
  },
];

export const tagsPopulares = [
  "sofá",
  "colchão",
  "automotivo",
  "couro",
  "suede",
  "urina",
  "odor",
  "precificação",
  "equipamento",
  "impermeabilização",
];

export function autorPorId(id: string) {
  return autores.find((a) => a.id === id) ?? autores[0];
}
