import { createFileRoute } from "@tanstack/react-router";

import { AbasComunidade, AutorLinha } from "@/components/app/comunidade-ui";
import { InfoCard, PageHeader, Section } from "@/components/app/ui";
import { autores, niveis } from "@/data/comunidade";

export const Route = createFileRoute("/comunidade/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking e reputação da comunidade — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Veja os higienizadores que mais ajudam a comunidade, os níveis de reputação e como ganhar pontos respondendo dúvidas.",
      },
      { property: "og:title", content: "Ranking da comunidade de higienizadores" },
      { property: "og:description", content: "Níveis de reputação e os profissionais que mais contribuem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ranking,
});

const medalhas = ["🥇", "🥈", "🥉"];

function Ranking() {
  const ordenados = [...autores].sort((a, b) => b.pontos - a.pontos);

  return (
    <div className="pb-6">
      <PageHeader
        eyebrow="Comunidade"
        titulo="Ranking e reputação"
        descricao="Pontos vêm de respostas úteis, casos documentados e dicas aprovadas por outros profissionais."
      />
      <AbasComunidade />

      <Section titulo="Top contribuidores">
        <ol className="grid gap-3">
          {ordenados.map((a, i) => (
            <li key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-7 text-center text-lg font-bold" aria-hidden>
                  {medalhas[i] ?? i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <AutorLinha autorId={a.id} extra={`${a.pontos} pts`} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.empresa} · {a.cidade}/{a.estado} · {a.respostas} respostas
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section titulo="Níveis">
        <div className="grid gap-2">
          {Object.entries(niveis).map(([chave, n]) => (
            <InfoCard key={chave} className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {n.emoji}
              </span>
              <div>
                <p className="text-sm font-bold">{n.rotulo}</p>
                <p className="text-xs text-muted-foreground">A partir de {n.minimo} pontos</p>
              </div>
            </InfoCard>
          ))}
        </div>
      </Section>

      <Section titulo="Como ganhar pontos">
        <InfoCard>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>+10 por responder uma dúvida</li>
            <li>+25 quando sua resposta é marcada como melhor</li>
            <li>+15 por caso documentado com antes e depois e protocolo completo</li>
            <li>+5 por dica aprovada pela comunidade</li>
          </ul>
        </InfoCard>
      </Section>
    </div>
  );
}
