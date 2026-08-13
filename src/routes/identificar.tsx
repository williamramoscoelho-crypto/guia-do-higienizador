import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { perguntasIdentificacao } from "@/data/conteudo";
import { tecidos } from "@/data/tecidos";
import { Aviso, Breadcrumbs, ItemLink, PageHeader, Section } from "@/components/app/ui";

export const Route = createFileRoute("/identificar")({
  head: () => ({
    meta: [
      { title: "Identificar o tecido do estofado — Guia do Higienizador" },
      { name: "description", content: "Assistente de identificação por perguntas: pelo, brilho, toque, trama e absorção indicam o tecido mais provável do estofado." },
      { property: "og:title", content: "Identificar o tecido do estofado" },
      { property: "og:description", content: "Responda algumas perguntas e veja o tecido provável." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/identificar" },
    ],
    links: [{ rel: "canonical", href: "/identificar" }],
  }),
  component: Identificar;
});

function Identificar() {
  return null;
}
