import { createFileRoute } from "@tanstack/react-router";
import { experienciaCampo, kitsHigienizacao } from "@/data/conteudo";
import { Breadcrumbs, BulletList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/aprender")({
  head: () => ({
    meta: [
      { title: "Aprender higienização de estofados — Guia do Higienizador" },
      { name: "description", content: "Experiência de campo para quem está começando: erros comuns, conversa com o cliente, documentação por fotos, processo de atendimento e kits por nível." },
      { property: "og:title", content: "Aprender higienização de estofados" },
      { property: "og:description", content: "Conteúdo prático de quem atende todos os dias." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
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
        titulo="📚 Aprender"
        eyebrow="Experiência de campo"
        descricao="O que a prática ensina antes de qualquer manual — e como montar seu processo."
      />

      <Section titulo="Na prática">
        <ul className="grid gap-2.5">
          {experienciaCampo.map((t) => (
            <li key={t.slug}>
              <InfoCard>
                <h2 className="text-sm font-bold">{t.titulo}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t.resumo}</p>
                <div className="mt-3">
                  <BulletList itens={t.conteudo} />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>

      <Section titulo="Kits por nível">
        <ul className="grid gap-2.5">
          {kitsHigienizacao.map((k) => (
            <li key={k.nivel}>
              <InfoCard>
                <h2 className="text-sm font-bold">{k.nivel}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{k.descricao}</p>
                <div className="mt-3">
                  <BulletList itens={k.itens} tone="ok" />
                </div>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
