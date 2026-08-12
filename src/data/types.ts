export type Tecido = {
  slug: string;
  nome: string;
  emoji: string;
  nomesComerciais: string[];
  resumo: string;
  aparencia: string;
  textura: string;
  brilho: string;
  toque: string;
  composicao: string[];
  caracteristicas: {
    absorcao: string;
    secagem: string;
    resistencia: string;
    sensibilidadeAgua: string;
    sensibilidadeCalor: string;
    tendenciaManchas: string;
    alteracaoCor: string;
    encolhimento: string;
    migracaoCor: string;
  };
  teste: string;
  metodo: string;
  produtosCompativeis: string[];
  produtosCautela: string[];
  evitar: string[];
  cuidadosExtracao: string;
  cuidadosSecagem: string;
  atencao: string[];
  faq: { p: string; r: string }[];
};

export type Produto = {
  slug: string;
  nome: string;
  categoria: string;
  funcao: string;
  ondeUsar: string[];
  ondeEvitar: string[];
  caracteristicas: string[];
  ph: string;
  phValor: number | null;
  diluicao: string;
  tempoAcao: string;
  enxague: string;
  riscos: string[];
  compatibilidade: string[];
  epis: string[];
};

export type Mancha = {
  slug: string;
  nome: string;
  emoji: string;
  categoria: string;
  origem: string;
  caracteristica: string;
  dificuldade: "Fácil" | "Média" | "Difícil" | "Muito difícil";
  cuidados: string[];
  produtos: string[];
  procedimento: string[];
  naoFazer: string[];
  limitacoes: string;
};

export type Estofado = {
  slug: string;
  nome: string;
  emoji: string;
  estrutura: string;
  materiais: string[];
  tecidos: string[];
  problemas: string[];
  atencao: string[];
  inspecao: string[];
  higienizacao: string[];
  secagem: string;
  posLimpeza: string[];
};

export type Equipamento = {
  slug: string;
  nome: string;
  emoji: string;
  funcao: string;
  quandoUsar: string;
  comoUsar: string[];
  cuidados: string[];
  manutencao: string[];
  errosComuns: string[];
};

export type Termo = { termo: string; definicao: string };
