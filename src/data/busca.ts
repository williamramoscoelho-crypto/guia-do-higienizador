import { tecidos } from "./tecidos";
import { manchas } from "./manchas";
import { produtos } from "./produtos";
import { estofados } from "./estofados";
import { equipamentos } from "./equipamentos";
import { glossario } from "./glossario";
import { marcas } from "./marcas";
import { fichasFabricantes, marcasFichas } from "./fichas-fabricantes";
import { indicacoesPorMancha } from "./manchas-produtos";
import { fluxoHigienizacao, experienciaCampo, etapasAutomotivas } from "./conteudo";

export type ResultadoBusca = {
  id: string;
  grupo: string;
  titulo: string;
  descricao: string;
  href: string;
  termos: string;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const indiceBusca: ResultadoBusca[] = [
  ...tecidos.map((t) => ({
    id: `tecido-${t.slug}`,
    grupo: "Tecidos",
    titulo: t.nome,
    descricao: t.resumo,
    href: `/tecidos/${t.slug}`,
    termos: [t.nome, ...t.nomesComerciais, ...t.composicao, t.resumo].join(" "),
  })),
  ...manchas.map((m) => ({
    id: `mancha-${m.slug}`,
    grupo: "Manchas",
    titulo: m.nome,
    descricao: `${m.categoria} — ${m.caracteristica}`,
    href: `/manchas/${m.slug}`,
    termos: [
      m.nome,
      m.categoria,
      m.origem,
      m.caracteristica,
      ...m.produtos,
      ...(indicacoesPorMancha[m.slug] ?? []).flatMap((i) => {
        const f = fichasFabricantes.find((x) => x.slug === i.fichaSlug);
        return f ? [f.nome, f.marca] : [];
      }),
    ].join(" "),
  })),
  ...produtos.map((p) => ({
    id: `produto-${p.slug}`,
    grupo: "Produtos",
    titulo: p.nome,
    descricao: p.funcao,
    href: `/produtos/${p.slug}`,
    termos: [p.nome, p.categoria, p.funcao, p.ph, ...p.compatibilidade].join(" "),
  })),
  ...estofados.map((e) => ({
    id: `estofado-${e.slug}`,
    grupo: "Estofados",
    titulo: e.nome,
    descricao: e.estrutura,
    href: `/estofados/${e.slug}`,
    termos: [e.nome, ...e.materiais, ...e.tecidos, ...e.problemas].join(" "),
  })),
  ...equipamentos.map((e) => ({
    id: `equip-${e.slug}`,
    grupo: "Equipamentos",
    titulo: e.nome,
    descricao: e.funcao,
    href: `/equipamentos/${e.slug}`,
    termos: [e.nome, e.funcao, e.quandoUsar].join(" "),
  })),
  ...glossario.map((g) => ({
    id: `termo-${g.termo}`,
    grupo: "Glossário",
    titulo: g.termo,
    descricao: g.definicao,
    href: "/glossario",
    termos: `${g.termo} ${g.definicao}`,
  })),
  ...fluxoHigienizacao.map((f) => ({
    id: `passo-${f.n}`,
    grupo: "Procedimentos",
    titulo: `${f.n}. ${f.titulo}`,
    descricao: f.texto,
    href: "/fluxo",
    termos: `${f.titulo} ${f.texto} higienizacao passo a passo`,
  })),
  ...marcas.map((m) => ({
    id: `marca-${m.slug}`,
    grupo: "Marcas",
    titulo: m.nome,
    descricao: m.tipoProduto,
    href: `/onde-comprar/${m.slug}`,
    termos: [m.nome, ...m.categorias, m.tipoProduto].join(" "),
  })),
  ...fichasFabricantes.map((f) => ({
    id: `ficha-${f.slug}`,
    grupo: "Fichas técnicas",
    titulo: f.nome,
    descricao: f.resumo,
    href: `/fichas/${f.slug}`,
    termos: [f.nome, f.marca, f.resumo, f.diluicao, f.usoRecomendado, marcasFichas.find((m) => m.slug === f.marca)?.nome ?? ""].join(" "),
  })),
  ...experienciaCampo.map((e) => ({
    id: `exp-${e.slug}`,
    grupo: "Aprender",
    titulo: e.titulo,
    descricao: e.resumo,
    href: "/aprender",
    termos: `${e.titulo} ${e.resumo} experiencia atendimento`,
  })),
  ...etapasAutomotivas.map((e) => ({
    id: `auto-${e.slug}`,
    grupo: "Estética automotiva",
    titulo: e.titulo,
    descricao: e.pontos[0] ?? "",
    href: "/automotiva",
    termos: `${e.titulo} ${e.pontos.join(" ")} automotiva banco carro`,
  })),
  {
    id: "pagina-comecar",
    grupo: "Carreira",
    titulo: "Quero começar no ramo",
    descricao: "Kits inicial, intermediário e profissional para quem vai entrar na higienização.",
    href: "/comecar",
    termos: "comecar iniciar kit inicial intermediario profissional carreira",
  },
  {
    id: "pagina-comunidade",
    grupo: "Comunidade",
    titulo: "Comunidade e código de conduta",
    descricao: "Regras da rede profissional. Feed e cadastro ainda não estão no ar.",
    href: "/comunidade",
    termos: "comunidade codigo conduta regras feed perguntas grupos",
  },
  {
    id: "pagina-perguntas",
    grupo: "Comunidade",
    titulo: "Pergunte à comunidade",
    descricao: "Dúvidas técnicas de tecidos, manchas, produtos e atendimento.",
    href: "/perguntas",
    termos: "perguntas duvidas comunidade respostas",
  },
  {
    id: "pagina-profissionais",
    grupo: "Comunidade",
    titulo: "Encontre profissionais",
    descricao: "Diretório de membros com perfil público.",
    href: "/profissionais",
    termos: "profissionais diretorio membros perfil publico",
  },
  {
    id: "pagina-codigo-comunidade",
    grupo: "Comunidade",
    titulo: "Código da comunidade",
    descricao: "Regras de respeito, segurança química e privacidade.",
    href: "/codigo-da-comunidade",
    termos: "codigo comunidade regras conduta",
  },
  {
    id: "pagina-comparar-produtos",
    grupo: "Produtos",
    titulo: "Comparar produtos",
    descricao: "Compare até 3 categorias de química lado a lado, sem ranking.",
    href: "/produtos/comparar",
    termos: "comparar produtos categorias ph diluicao",
  },
  {
    id: "pagina-transparencia",
    grupo: "Sobre",
    titulo: "Transparência e política editorial",
    descricao: "Como o conteúdo é produzido, neutralidade entre marcas e privacidade.",
    href: "/transparencia",
    termos: "transparencia politica editorial independencia privacidade fispq",
  },
  {
    id: "pagina-comparar-marcas",
    grupo: "Marcas",
    titulo: "Comparar marcas",
    descricao: "Compare até 3 marcas lado a lado, sem ranking.",
    href: "/onde-comprar/comparar",
    termos: "comparar marcas lado a lado onde comprar",
  },
];

export function buscar(q: string): ResultadoBusca[] {
  const termo = norm(q.trim());
  if (termo.length < 2) return [];
  const palavras = termo.split(/\s+/);
  return indiceBusca
    .map((item) => {
      const alvo = norm(`${item.titulo} ${item.termos}`);
      const tituloNorm = norm(item.titulo);
      let score = 0;
      for (const p of palavras) {
        if (tituloNorm.startsWith(p)) score += 6;
        else if (tituloNorm.includes(p)) score += 4;
        else if (alvo.includes(p)) score += 1;
        else return null;
      }
      return { item, score };
    })
    .filter((r): r is { item: ResultadoBusca; score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map((r) => r.item);
}

export const sugestoes = [
  "Veludo",
  "Suede",
  "Urina",
  "Café",
  "Mancha de gordura",
  "Produto alcalino",
  "Impermeabilização",
  "Extratora",
  "Odor",
  "Couro",
];
