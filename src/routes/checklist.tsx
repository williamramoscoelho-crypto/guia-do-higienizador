import { createFileRoute } from "@tanstack/react-router";
import { checklistItens } from "@/data/conteudo";
import { Aviso, Breadcrumbs, PageHeader, Section } from "@/components/app/ui";
import { useLocalState } from "@/lib/local";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist de pré-inspeção — Guia do Higienizador" },
      {
        name: "description",
        content: "Marque os itens antes de começar: tecido, fotos, danos, teste de produto e alinhamento com o cliente.",
      },
      { property: "og:title", content: "Checklist de pré-inspeção" },
      { property: "og:url", content: "/checklist" },
    ],
    links: [{ rel: "canonical", href: "/checklist" }],
  }),
  component: Checklist,
});

function Checklist() {
  const [marcados, setMarcados] = useLocalState<string[]>("gh:checklist", []);
  const toggle = (item: string) =>
    setMarcados((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  const feitos = marcados.filter((i) => checklistItens.includes(i)).length;

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Checklist" }]} />
      <PageHeader
        titulo="Antes de começar"
        eyebrow="Pré-inspeção"
        descricao="Marque no seu dispositivo. O progresso fica salvo neste aparelho, mesmo offline."
      />
      <Section>
        <p className="mb-3 text-sm text-muted-foreground">
          {feitos} de {checklistItens.length} itens concluídos
        </p>
        <ul className="grid gap-2">
          {checklistItens.map((item) => {
            const on = marcados.includes(item);
            return (
              <li key={item}>
                <label className="card-tap flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(item)}
                    className="size-5 accent-primary"
                  />
                  <span className={on ? "text-sm text-muted-foreground line-through" : "text-sm font-medium"}>{item}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => setMarcados([])}
          className="mt-4 min-h-11 rounded-full border border-border px-4 text-sm"
        >
          Limpar checklist
        </button>
      </Section>
      <Aviso titulo="Não pule o teste">
        Mesmo com o checklist completo, o teste em área discreta continua obrigatório antes de aplicar produto no painel
        inteiro.
      </Aviso>
    </div>
  );
}
