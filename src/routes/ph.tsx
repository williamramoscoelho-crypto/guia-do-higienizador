import { createFileRoute } from "@tanstack/react-router";
import { Aviso, Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/ph")({
  head: () => ({
    meta: [
      { title: "Tabela de pH — Guia do Higienizador" },
      {
        name: "description",
        content: "O que é pH, por que importa na higienização e quando ter cautela com ácidos e alcalinos.",
      },
      { property: "og:title", content: "Tabela de pH para higienização" },
      { property: "og:url", content: "/ph" },
    ],
    links: [{ rel: "canonical", href: "/ph" }],
  }),
  component: Ph,
});

const faixas = [
  { faixa: "0–6", nome: "Ácido", exemplos: "Removedores de mineral, alguns desincrustantes", cautela: "Metais, couro e algumas fibras naturais" },
  { faixa: "7", nome: "Neutro", exemplos: "Detergentes para estofados de uso geral", cautela: "Ainda exige teste e extração" },
  { faixa: "8–14", nome: "Alcalino", exemplos: "Desengraxantes, APC, alguns limpadores pesados", cautela: "Couro, viscose, residual que amarela tecido claro" },
];

function Ph() {
  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Tabela de pH" }]} />
      <PageHeader
        titulo="Tabela de pH"
        eyebrow="Química prática"
        descricao="pH indica se a solução é ácida, neutra ou alcalina. Ajuda a prever o comportamento — não escolhe o produto sozinho."
      />
      <Section titulo="Ácido → Neutro → Alcalino">
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid h-10 grid-cols-3 text-xs font-bold">
            <div className="flex items-center justify-center bg-warning/80 text-warning-foreground">Ácido</div>
            <div className="flex items-center justify-center bg-success/70 text-success-foreground">Neutro</div>
            <div className="flex items-center justify-center bg-primary text-primary-foreground">Alcalino</div>
          </div>
          <div className="grid grid-cols-7 bg-card text-center text-[10px] text-muted-foreground">
            {["0", "2", "4", "6", "7", "10", "14"].map((n) => (
              <span key={n} className="py-2">
                {n}
              </span>
            ))}
          </div>
        </div>
      </Section>
      <Section titulo="Na prática">
        <ul className="grid gap-3">
          {faixas.map((f) => (
            <li key={f.nome}>
              <InfoCard>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {f.faixa} · {f.nome}
                </p>
                <p className="mt-2 text-sm">
                  <strong>Exemplos:</strong> {f.exemplos}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <strong>Cautela:</strong> {f.cautela}
                </p>
              </InfoCard>
            </li>
          ))}
        </ul>
      </Section>
      <Aviso titulo="pH não é o único critério">
        Dois produtos com o mesmo pH podem ter tensoativos, solventes e oxidantes completamente diferentes. Leia a ficha
        técnica e a FISPQ. Confirme a diluição no rótulo do fabricante.
      </Aviso>
    </div>
  );
}
