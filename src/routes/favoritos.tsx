import { createFileRoute, Link } from "@tanstack/react-router";
import { useFavoritos } from "@/lib/local";
import { Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus favoritos — Guia do Higienizador" },
      { name: "description", content: "Acesse rapidamente os tecidos, manchas, produtos e equipamentos que você salvou para consulta durante o atendimento." },
      { property: "og:title", content: "Meus favoritos" },
      { property: "og:description", content: "Seus conteúdos salvos para consulta rápida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/favoritos" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/favoritos" }],
  }),
  component: Favoritos,
});

function Favoritos() {
  const { favoritos, hydrated } = useFavoritos();

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Favoritos" }]} />
      <PageHeader titulo="⭐ Meus favoritos" eyebrow="Seu espaço" descricao="Salvos no seu dispositivo, disponíveis mesmo sem sinal." />
      <Section>
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : favoritos.length === 0 ? (
          <InfoCard>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Você ainda não salvou nada. Toque em “Favoritar” em qualquer tecido, mancha, produto ou equipamento para
              tê-lo aqui.
            </p>
          </InfoCard>
        ) : (
          <ul className="grid gap-2">
            {favoritos.map((f) => (
              <li key={f.id}>
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={f.href as any}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-sm"
                >
                  <span className="font-semibold">{f.nome}</span>
                  <span className="text-xs text-muted-foreground">{f.tipo}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
