import { createFileRoute } from "@tanstack/react-router";
import { kitsHigienizacao } from "@/data/conteudo";
import { Aviso, Breadcrumbs, BulletList, InfoCard, ItemLink, PageHeader, Section } from "@/components/app/ui";
import { iaConfigurada } from "@/lib/ia";

export const Route = createFileRoute("/comecar")({
  head: () => ({
    meta: [
      { title: "Quero começar no ramo — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Kits inicial, intermediário e profissional para quem vai entrar na higienização de estofados. Sem ranking de marca.",
      },
      { property: "og:title", content: "Começar na higienização de estofados" },
      { property: "og:url", content: "/comecar" },
    ],
    links: [{ rel: "canonical", href: "/comecar" }],
  }),
  component: Comecar,
});

function Comecar() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Começar no ramo" }]} />
      <PageHeader
        titulo="Quero começar no ramo"
        eyebrow="Do primeiro atendimento"
        descricao="Monte o kit com critério técnico. Compare custo por aplicação, leia a ficha do fabricante e não compre equipamento só pelo marketing."
      />
      {kitsHigienizacao.map((k) => (
        <Section key={k.nivel} titulo={k.nivel}>
          <InfoCard>
            <p className="text-sm text-muted-foreground">{k.descricao}</p>
            <div className="mt-3">
              <BulletList itens={k.itens} />
            </div>
          </InfoCard>
        </Section>
      ))}
      <Section titulo="Primeiros passos no Guia">
        <ul className="grid gap-2">
          {iaConfigurada() ? (
            <li>
              <ItemLink to="/ia" emoji="🤖" titulo="Higienizador IA" descricao="Tire dúvidas de kit, erros comuns e primeiro atendimento" />
            </li>
          ) : null}
          <li>
            <ItemLink to="/identificar" emoji="🔍" titulo="Identificar o tecido" descricao="Assistente por perguntas — resultado é provável, não certeza" />
          </li>
          <li>
            <ItemLink to="/checklist" emoji="📋" titulo="Checklist de atendimento" descricao="Fotos, etiqueta, teste e alinhamento com o cliente" />
          </li>
          <li>
            <ItemLink to="/fluxo" emoji="💦" titulo="Passo a passo da higienização" descricao="12 etapas com avisos de segurança" />
          </li>
          <li>
            <ItemLink to="/cuidados" emoji="⚠️" titulo="Riscos e cuidados" descricao="O que danifica estofado de verdade" />
          </li>
          <li>
            <ItemLink to="/onde-comprar" emoji="🏪" titulo="Onde comprar" descricao="Critérios, marcas e fichas — sem ranking" />
          </li>
        </ul>
      </Section>
      <Aviso titulo="Não invente química">
        Diluição, pH e tempo de ação vêm do fabricante. Sem ficha ou FISPQ, não use o produto em cliente.
      </Aviso>
    </div>
  );
}
