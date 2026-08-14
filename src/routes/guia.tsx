import { createFileRoute } from "@tanstack/react-router";
import { ItemLink, PageHeader, Section } from "@/components/app/ui";
import { isCommunityEnabled } from "@/lib/backend";
import { iaConfigurada } from "@/lib/ia";

export const Route = createFileRoute("/guia")({
  head: () => ({
    meta: [
      { title: "Guia completo — Guia do Higienizador" },
      { name: "description", content: "Índice do manual: tecidos, estofados, manchas, procedimentos, equipamentos, glossário e ferramentas." },
      { property: "og:title", content: "Guia completo de higienização de estofados" },
      { property: "og:description", content: "Todo o conteúdo técnico organizado em um só lugar." },
      { property: "og:url", content: "/guia" },
    ],
    links: [{ rel: "canonical", href: "/guia" }],
  }),
  component: Guia,
});

const secoes = [
  {
    titulo: "Consulta técnica",
    itens: [
      { to: "/tecidos", emoji: "🧵", titulo: "Tipos de tecidos", desc: "14 tecidos com composição, riscos e método indicado" },
      { to: "/estofados", emoji: "🛋️", titulo: "Tipos de estofados", desc: "Sofás, colchões, bancos automotivos e mais" },
      { to: "/manchas", emoji: "🟤", titulo: "Tipos de manchas", desc: "Procedimento, cuidados e limitações reais" },
      { to: "/produtos", emoji: "🧪", titulo: "Produtos e química", desc: "Função, pH, riscos e compatibilidade" },
      { to: "/produtos/comparar", emoji: "⚖️", titulo: "Comparar produtos", desc: "Até 3 categorias lado a lado, sem ranking" },
      { to: "/fichas", emoji: "📄", titulo: "Fichas de fabricantes", desc: "Produtos oficiais com diluição e FISPQ" },
      { to: "/equipamentos", emoji: "🧰", titulo: "Equipamentos", desc: "Uso correto, manutenção e erros comuns" },
    ],
  },
  {
    titulo: "Procedimentos",
    itens: [
      { to: "/fluxo", emoji: "💦", titulo: "Passo a passo da higienização", desc: "12 etapas com avisos de segurança" },
      { to: "/identificar", emoji: "🔍", titulo: "Identificar o tecido", desc: "Assistente de identificação provável" },
      { to: "/ia", emoji: "🤖", titulo: "Higienizador IA", desc: "Chat técnico com protocolo e avisos de risco" },
      { to: "/checklist", emoji: "📋", titulo: "Checklist de pré-inspeção", desc: "Salvo no seu dispositivo" },
      { to: "/ph", emoji: "⚗️", titulo: "Tabela de pH", desc: "Ácido, neutro e alcalino na prática" },
      { to: "/cuidados", emoji: "⚠️", titulo: "Riscos e cuidados", desc: "O que pode danificar um estofado" },
    ],
  },
  {
    titulo: "Mercado e carreira",
    itens: [
      { to: "/automotiva", emoji: "🚗", titulo: "Estética automotiva", desc: "Interior, bancos, couro e categorias de produto" },
      { to: "/onde-comprar", emoji: "🏪", titulo: "Onde comprar", desc: "Marcas, kits e critérios de compra" },
      { to: "/onde-comprar/comparar", emoji: "⚖️", titulo: "Comparar marcas", desc: "Até 3 marcas lado a lado, sem ranking" },
      { to: "/comecar", emoji: "🚀", titulo: "Quero começar no ramo", desc: "Kits inicial, intermediário e profissional" },
      { to: "/comunidade", emoji: "👥", titulo: "Comunidade", desc: "Feed, antes e depois e dicas de quem atende" },
      { to: "/perguntas", emoji: "❓", titulo: "Pergunte à comunidade", desc: "Dúvidas técnicas respondidas por profissionais" },
      { to: "/profissionais", emoji: "🔎", titulo: "Encontre profissionais", desc: "Diretório de membros com perfil público" },
      { to: "/codigo-da-comunidade", emoji: "📜", titulo: "Código da comunidade", desc: "Regras de respeito, segurança e privacidade" },
      { to: "/aprender", emoji: "📚", titulo: "Aprender", desc: "Experiência de campo e capacitação" },
      { to: "/transparencia", emoji: "🔎", titulo: "Transparência", desc: "Política editorial e independência" },
      { to: "/ferramentas", emoji: "🧮", titulo: "Ferramentas", desc: "Diluição pela ficha e precificação" },
      { to: "/glossario", emoji: "📖", titulo: "Glossário profissional", desc: "Termos técnicos em linguagem simples" },
    ],
  },
];

function itemVisivel(to: string) {
  if (to === "/ia") return iaConfigurada();
  if (to === "/comunidade" || to === "/perguntas" || to === "/profissionais") return isCommunityEnabled();
  return true;
}

function Guia() {
  return (
    <div className="pb-4">
      <PageHeader titulo="Guia" descricao="Todo o conteúdo técnico organizado por tema." eyebrow="Manual completo" />
      {secoes.map((s) => {
        const itens = s.itens.filter((i) => itemVisivel(i.to));
        if (itens.length === 0) return null;
        return (
          <Section key={s.titulo} titulo={s.titulo}>
            <ul className="grid gap-2">
              {itens.map((i) => (
                <li key={i.to}>
                  <ItemLink to={i.to} emoji={i.emoji} titulo={i.titulo} descricao={i.desc} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </div>
  );
}
