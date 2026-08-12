import { createFileRoute } from "@tanstack/react-router";
import { ItemLink, PageHeader, Section } from "@/components/app/ui";
import { useFavoritos } from "@/lib/local";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus favoritos — Guia do Higienizador" },
      { name: "description", content: "Tecidos, manchas, produtos e procedimentos salvos neste dispositivo." },
      { property: "og:title", content: "Meus favoritos" },
      { property: "og:url", content: "/favoritos" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Favoritos,
});

function Favoritos() {
  const { favoritos, hydrated } = useFavoritos();

  return (
    <div className="pb-4">
      <PageHeader
        titulo="Meus favoritos"
        eyebrow="Neste aparelho"
        descricao="Os itens ficam salvos localmente neste navegador, para consulta rápida no atendimento."
      />
      <Section>
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : favoritos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não favoritou nada. Abra um tecido, uma mancha ou um produto e toque em Favoritar.
          </p>
        ) : (
          <ul className="grid gap-2">
            {favoritos.map((f) => (
              <li key={f.id}>
                <ItemLink to={f.href} titulo={f.nome} descricao={f.tipo} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
