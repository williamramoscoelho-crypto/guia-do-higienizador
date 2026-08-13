import { createFileRoute } from "@tanstack/react-router";
import { experienciaCampo } from "@/data/conteudo";
import { Breadcrumbs, BulletList, InfoCard, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/aprender")({
  head: () => ({
    meta: [
      { title: "Aprender no campo — Guia do Higienizador" },
      {
        name: "description",
        content: "Erros comuns, conversa com o cliente, fotos e processo de atendimento na higienização de estofados.",
      },
      { property: "og:title", content: "Experiência de campo para higienizadores" },
      { property: "og:url", content: "/aprender" },
    ],
    links: [{ rel: "canonical", href: "/aprender" }],
  }),
  component: Aprender,
});

function Aprender() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Aprender" }]} />
      <PageHeader
        titulo="Aprender"
        eyebrow="Experiência de campo"
        descricao="Conteúdo prático de atendimento. Não substitui treinamento presencial nem a ficha do fabricante."
      />
      <Section>
        <ItemLink
          to="/comunidade"
          emoji="👥"
          titulo="Comunidade"
          descricao="Feed, dicas e antes e depois de quem atende"
        />
      </Section>
      <Section>
        <ItemLink
          to="/codigo-da-comunidade"
          emoji="📜"
          titulo="Código da comunidade"
          descricao="Regras de respeito, segurança e privacidade"
        />
      </Section>
      <Section>
        <ul className="grid gap-3">
          {experienciaCampo.map((e) => (
            <li key={e.slug} id={e.slug}>
              <InfoCard>
                <h2 className="text-sm font-bold">{e.titulo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{e.resumo}</p>
                <div className="mt-3">
                  <BulletList itens={e.conteudo} />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
