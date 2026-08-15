import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertaPadrao } from "@/components/app/confiabilidade";
import { Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";
import { isCommunityEnabled } from "@/lib/flags";

export const Route = createFileRoute("/casos-reais")({
  head: () => ({
    meta: [
      { title: "Casos profissionais — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Estrutura de caso profissional: material, problema, avaliação, procedimento, produtos, resultado e limitações.",
      },
      { property: "og:title", content: "Casos profissionais" },
      { property: "og:url", content: "/casos-reais" },
    ],
    links: [{ rel: "canonical", href: "/casos-reais" }],
  }),
  component: CasosReais,
});

const CAMPOS = [
  "Material",
  "Problema",
  "Avaliação",
  "Procedimento",
  "Produtos (com fonte / ficha)",
  "Resultado",
  "Limitações",
  "Observações",
] as const;

function CasosReais() {
  const comunidade = isCommunityEnabled();

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Aprender", to: "/aprender" }, { label: "Casos reais" }]} />
      <PageHeader
        titulo="Caso profissional"
        eyebrow="Experiência de campo"
        descricao="Modelo para registrar atendimento sem inventar química. Diferencie sempre informação técnica de experiência da comunidade."
      />

      <AlertaPadrao tipo="fonte">
        Relatos de campo não substituem ficha técnica, FISPQ ou rótulo do lote. Não invente diluição ou resultado
        garantido.
      </AlertaPadrao>

      <Section titulo="Estrutura recomendada">
        <ul className="grid gap-2">
          {CAMPOS.map((c) => (
            <li key={c}>
              <InfoCard>
                <p className="text-sm font-semibold">{c}</p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>

      <Section titulo="Onde publicar">
        {comunidade ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Link to="/comunidade/novo" className="btn-primary min-h-12">
              Publicar na comunidade
            </Link>
            <Link
              to="/aprender"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold"
            >
              Ver experiências no guia
            </Link>
          </div>
        ) : (
          <InfoCard>
            <p className="text-sm text-muted-foreground">
              A comunidade online depende do backend neste hospedagem. Enquanto isso, use o modelo acima nos seus
              registros internos e consulte{" "}
              <Link to="/aprender" className="text-primary underline">
                /aprender
              </Link>
              .
            </p>
          </InfoCard>
        )}
      </Section>
    </div>
  );
}
