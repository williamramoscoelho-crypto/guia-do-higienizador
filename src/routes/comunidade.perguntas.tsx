import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias Lovable → perguntas reais da API. */
export const Route = createFileRoute("/comunidade/perguntas")({
  beforeLoad: () => {
    throw redirect({ to: "/perguntas" });
  },
  head: () => ({
    meta: [{ title: "Perguntas — Guia do Higienizador" }, { name: "robots", content: "noindex" }],
  }),
  component: () => null,
});
