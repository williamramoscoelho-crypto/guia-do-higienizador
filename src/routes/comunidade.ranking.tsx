import { createFileRoute, Link } from "@tanstack/react-router";

import { AbasComunidade } from "@/components/app/comunidade-ui";
import { InfoCard, PageHeader, Section } from "@/components/app/ui";
import { NIVEIS } from "@/lib/community";

export const Route = createFileRoute("/comunidade/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking e reputação da comunidade — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Níveis de reputação da comunidade: pontos por respostas úteis, casos e dicas. Sem inventar ranking fictício.",
      },
      { property: "og:title", content: "Ranking da comunidade de higienizadores" },
      { property: "og:url", content: "/comunidade/ranking" },
    ],
    links: [{ rel: "canonical", href: "/comunidade/ranking" }],
  }),
  component: Ranking,
});

function Ranking() {
  return (
    <div className="pb-6">
      <PageHeader
        eyebrow="Comunidade"
        titulo="Ranking e reputação"
        descricao="Pontos vêm de participação real na comunidade (API). Esta página explica os níveis — o diretório lista profissionais cadastrados."
      />
      <AbasComunidade />

      <Section titulo="Níveis">
        <ul className="grid gap-2">
          {NIVEIS.map((n) => (
            <li key={n.nome}>
              <InfoCard>
                <p className="text-sm font-bold">
                  <span aria-hidden>{n.emoji}</span> {n.nome}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">A partir de {n.min} pontos</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>

      <Section titulo="Ver profissionais">
        <Link to="/profissionais" className="btn-primary inline-flex min-h-12 px-5">
          Abrir diretório
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">
          Seu nível aparece no{" "}
          <Link to="/painel" className="font-semibold text-primary underline">
            painel
          </Link>{" "}
          após entrar.
        </p>
      </Section>
    </div>
  );
}
