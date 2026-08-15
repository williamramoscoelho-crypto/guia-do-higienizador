import { createFileRoute } from "@tanstack/react-router";

/**
 * Pathname usado só pelo casco SPA (maskPath). Não é página de produto.
 * O HTML real do casco vai para `_shell.html`.
 */
export const Route = createFileRoute("/spa-shell")({
  head: () => ({
    meta: [
      { title: "Guia do Higienizador" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SpaShellPlaceholder,
});

function SpaShellPlaceholder() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Carregando…
    </div>
  );
}
