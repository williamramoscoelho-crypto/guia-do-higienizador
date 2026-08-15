import { Link } from "@tanstack/react-router";
import { Section } from "@/components/app/ui";

/** Ligação interna leve — só aponta rotas/dados já publicados; sem inventar química. */
export function RelacionadosConhecimento({
  tecidoNome,
  manchaNome,
}: {
  tecidoNome?: string;
  manchaNome?: string;
}) {
  return (
    <Section titulo="Continuar no guia">
      <ul className="grid gap-2 sm:grid-cols-2">
        {tecidoNome ? (
          <>
            <li>
              <Link
                to="/manchas"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Manchas comuns
              </Link>
            </li>
            <li>
              <Link
                to="/produtos"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Categorias de produto
              </Link>
            </li>
            <li>
              <Link
                to="/fluxo"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Fluxo de higienização
              </Link>
            </li>
            <li>
              <Link
                to="/fichas"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Fichas de fabricantes
              </Link>
            </li>
          </>
        ) : null}
        {manchaNome ? (
          <>
            <li>
              <Link
                to="/tecidos"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Identificar / consultar tecido
              </Link>
            </li>
            <li>
              <Link
                to="/identificar"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Assistente de identificação
              </Link>
            </li>
            <li>
              <Link
                to="/diagnostico"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Diagnóstico guiado
              </Link>
            </li>
            <li>
              <Link
                to="/fichas"
                className="card-tap flex min-h-12 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold"
              >
                Fichas oficiais
              </Link>
            </li>
          </>
        ) : null}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Sempre cruze tecido + mancha + ficha do fabricante. Se faltar dado confirmado, não invente diluição.
      </p>
    </Section>
  );
}
