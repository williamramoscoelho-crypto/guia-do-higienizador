import { createFileRoute } from "@tanstack/react-router";
import { checklistItens } from "@/data/conteudo";
import { useLocalState } from "@/lib/local";
import { Breadcrumbs, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist de pré-inspeção de estofados — Guia do Higienizador" },
      { name: "description", content: "Checklist interativo de pré-inspeção: tecido, etiqueta, fotos, rasgos, costuras, odor e teste de produto. Salvo no seu dispositivo." },
      { property: "og:title", content: "Checklist de pré-inspeção" },
      { property: "og:description", content: "Marque cada etapa antes de começar o serviço." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/checklist" },
    ],
    links: [{ rel: "canonical", href: "/checklist" }],
  }),
  component: Checklist,
});

function Checklist() {
  const [marcados, setMarcados, hydrated] = useLocalState<string[]>("gh:checklist", []);
  const total = checklistItens.length;
  const feitos = marcados.length;

  const toggle = (item: string) =>
    setMarcados((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Checklist" }]} />
      <PageHeader titulo="📋 Checklist de pré-inspeção" eyebrow="Ferramenta" descricao="Progresso salvo automaticamente no seu dispositivo." />

      <Section>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">
            {hydrated ? `${feitos} de ${total} concluídos` : "Carregando…"}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(feitos / total) * 100}%` }} />
          </div>
          <button
            type="button"
            onClick={() => setMarcados([])}
            className="mt-3 min-h-11 rounded-full border border-border px-4 text-sm font-semibold"
          >
            Limpar checklist
          </button>
        </div>
      </Section>

      <Section titulo="Itens">
        <ul className="grid gap-2">
          {checklistItens.map((item) => {
            const ativo = marcados.includes(item);
            return (
              <li key={item}>
                <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 text-sm">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={() => toggle(item)}
                    className="size-5 accent-[hsl(var(--primary))]"
                  />
                  <span className={ativo ? "text-muted-foreground line-through" : "font-medium"}>{item}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
