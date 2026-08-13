import { createFileRoute, Link } from "@tanstack/react-router";
import { Aviso, Breadcrumbs, BulletList, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/transparencia")({
  head: () => ({
    meta: [
      { title: "Transparência e política editorial — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Como o conteúdo do Guia do Higienizador é produzido: critério técnico, nenhuma marca superior, sem preços ou links não verificados e dados só no seu dispositivo.",
      },
      { property: "og:title", content: "Transparência e política editorial" },
      { property: "og:description", content: "Critério técnico, neutralidade entre marcas e privacidade." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/transparencia" },
    ],
    links: [{ rel: "canonical", href: "/transparencia" }],
  }),
  component: Transparencia,
});

function Transparencia() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Transparência" }]} />
      <PageHeader
        titulo="🔎 Transparência"
        eyebrow="Política editorial"
        descricao="As regras que seguimos para que você possa confiar no que lê aqui."
      />

      <Section titulo="Como o conteúdo é produzido">
        <InfoCard>
          <BulletList
            itens={[
              "Conteúdo orientativo, baseado em prática de campo e em boas práticas do setor.",
              "Nenhuma marca, produto ou fornecedor é apresentado como superior.",
              "Não publicamos preços, links ou características que não tenham sido verificados.",
              "A etiqueta da peça e a ficha técnica/FISPQ do fabricante sempre têm prioridade sobre o guia.",
            ]}
          />
        </InfoCard>
      </Section>

      <Section titulo="Limitações">
        <Aviso titulo="O guia não substitui teste no tecido">
          Resultados variam conforme fibra, idade da mancha, tratamentos anteriores e equipamento. Faça sempre teste em
          área oculta e informe o cliente sobre limitações reais de remoção.
        </Aviso>
      </Section>

      <Section titulo="Parcerias e independência">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            O projeto é parceiro da Auto Limpeza Pro. A parceria é institucional e não altera a neutralidade técnica:
            recomendações seguem critério técnico e não contrapartida comercial.
          </p>
        </InfoCard>
      </Section>

      <Section titulo="Seus dados">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Favoritos, histórico e checklist ficam salvos apenas no seu dispositivo (armazenamento local do navegador).
            Não coletamos dados pessoais e não há cadastro.
          </p>
        </InfoCard>
      </Section>

      <Section titulo="Correções">
        <InfoCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Encontrou uma informação desatualizada ou incorreta? O conteúdo é revisado periodicamente e correções têm
            prioridade sobre novas páginas.
          </p>
        </InfoCard>
      </Section>

      <Section>
        <Link
          to="/sobre"
          className="inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Sobre o projeto
        </Link>
      </Section>
    </div>
  );
}
