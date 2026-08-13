import { createFileRoute } from "@tanstack/react-router";
import { Aviso, Breadcrumbs, BulletList, InfoCard, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade e código de conduta — Guia do Higienizador" },
      {
        name: "description",
        content:
          "O Guia do Higienizador será também uma rede profissional. Por enquanto: código da comunidade, experiência de campo e consulta técnica.",
      },
      { property: "og:title", content: "Comunidade do Guia do Higienizador" },
      { property: "og:url", content: "/comunidade" },
    ],
    links: [{ rel: "canonical", href: "/comunidade" }],
  }),
  component: Comunidade,
});

const regras = [
  "Respeitar outros profissionais.",
  "Compartilhar experiências reais.",
  "Não publicar informações deliberadamente falsas.",
  "Não incentivar práticas perigosas.",
  "Não recomendar misturas químicas inseguras.",
  "Respeitar marcas e fabricantes.",
  "Não fazer spam.",
  "Não divulgar dados pessoais de clientes.",
  "Não publicar fotos de clientes sem autorização.",
  "Não utilizar a comunidade para golpes.",
];

const gruposFuturos = [
  "Higienização de estofados",
  "Estética automotiva",
  "Tecidos e fibras",
  "Produtos e química",
  "Manchas",
  "Impermeabilização",
  "Equipamentos",
  "Precificação",
  "Marketing e atendimento",
  "Grupos por estado",
];

function Comunidade() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Comunidade" }]} />
      <PageHeader
        titulo="Comunidade"
        eyebrow="Rede profissional"
        descricao="Aprenda, consulte e, em breve, converse com outros higienizadores. Cadastro, feed e mensagens ainda não estão no ar."
      />
      <Aviso titulo="O que já existe hoje">
        O Guia funciona como manual de bolso: consulta técnica, ferramentas e experiência de campo. Feed, perguntas ao
        vivo, perfis públicos e mensagens virão depois — com privacidade e moderação, sem parecer loja nem fórum solto.
      </Aviso>
      <Section titulo="Enquanto a rede não abre">
        <ul className="grid gap-2">
          <li>
            <ItemLink to="/aprender" emoji="📚" titulo="Experiência de campo" descricao="Casos, erros e atendimento" />
          </li>
          <li>
            <ItemLink to="/comecar" emoji="🚀" titulo="Quero começar no ramo" descricao="Kits inicial, intermediário e profissional" />
          </li>
          <li>
            <ItemLink to="/transparencia" emoji="🔎" titulo="Transparência" descricao="Neutralidade técnica e independência" />
          </li>
        </ul>
      </Section>
      <Section titulo="Código da comunidade">
        <InfoCard>
          <p className="mb-3 text-sm text-muted-foreground">
            Estas regras valem para qualquer contribuição futura. Níveis e selos, quando existirem, marcam participação
            — não são certificação técnica.
          </p>
          <ol className="space-y-2">
            {regras.map((r, i) => (
              <li key={r} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </InfoCard>
      </Section>
      <Section titulo="Grupos previstos">
        <InfoCard>
          <BulletList itens={gruposFuturos} />
        </InfoCard>
      </Section>
    </div>
  );
}
