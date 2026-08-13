import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight, Clock } from "lucide-react";
import { useState } from "react";
import { useRecentes } from "@/lib/local";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Guia do Higienizador — Manual digital de higienização de estofados" },
      {
        name: "description",
        content:
          "Consulta rápida sobre tecidos, manchas, produtos, equipamentos e procedimentos para higienização profissional de estofados.",
      },
      { property: "og:title", content: "Guia do Higienizador" },
      {
        property: "og:description",
        content: "Conhecimento para quem limpa. Experiência de quem faz. Manual de bolso do higienizador profissional.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Guia do Higienizador",
          description: "Manual digital de consulta para profissionais de higienização de estofados e estética automotiva.",
        }),
      },
    ],
  }),
  component: Inicio,
});

const atalhos = [
  { to: "/tecidos", emoji: "🧵", label: "Tecidos" },
  { to: "/produtos", emoji: "🧪", label: "Produtos" },
  { to: "/fichas", emoji: "📄", label: "Fichas" },
  { to: "/manchas", emoji: "🟤", label: "Manchas" },
  { to: "/estofados", emoji: "🛋️", label: "Estofados" },
  { to: "/equipamentos", emoji: "🧰", label: "Equipamentos" },
  { to: "/cuidados", emoji: "⚠️", label: "Cuidados" },
  { to: "/automotiva", emoji: "🚗", label: "Automotiva" },
  { to: "/onde-comprar", emoji: "🏪", label: "Onde comprar" },
  { to: "/aprender", emoji: "📚", label: "Aprender" },
] as const;

const ferramentas = [
  { to: "/checklist", emoji: "📋", label: "Checklist", desc: "Pré-inspeção passo a passo" },
  { to: "/ferramentas/diluicao", emoji: "🧮", label: "Diluição", desc: "Calcule produto e água" },
  { to: "/ferramentas/precificacao", emoji: "💰", label: "Precificação", desc: "Custo e preço mínimo" },
  { to: "/identificar", emoji: "🔍", label: "Identificar tecido", desc: "Assistente por perguntas" },
] as const;

function Inicio() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const recentes = useRecentes();

  return (
    <div className="pb-4">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-8 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Guia do Higienizador</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">Olá, Higienizador 👋</h1>
        <p className="mt-1 text-sm opacity-85">Do que você precisa hoje?</p>

        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/buscar", search: { q } });
          }}
        >
          <label htmlFor="busca-home" className="sr-only">
            Buscar tecido, mancha ou produto
          </label>
          <div className="flex items-center gap-2 rounded-2xl bg-card px-4 shadow-lg">
            <Search className="size-5 text-muted-foreground" aria-hidden />
            <input
              id="busca-home"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar tecido, mancha, produto…"
              className="min-h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>

        <p className="mt-4 text-xs font-medium opacity-75">
          “Conhecimento para quem limpa. Experiência de quem faz.”
        </p>
      </header>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          O que você precisa saber?
        </h2>
        <ul className="grid grid-cols-3 gap-2.5">
          {atalhos.map((a) => (
            <li key={a.to}>
              <Link
                to={a.to}
                className="card-tap flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-2 text-center shadow-sm hover:border-primary/50"
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-xs font-semibold leading-tight">{a.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Ferramentas</h2>
        <ul className="grid gap-2.5">
          {ferramentas.map((f) => (
            <li key={f.to}>
              <Link
                to={f.to}
                className="card-tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50"
              >
                <span className="text-2xl">{f.emoji}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{f.label}</span>
                  <span className="block text-xs text-muted-foreground">{f.desc}</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {recentes.length > 0 ? (
        <section className="mt-7">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Clock className="size-4" aria-hidden /> Últimas consultas
          </h2>
          <ul className="grid gap-2">
            {recentes.map((r) => (
              <li key={r.href}>
                <Link
                  to={r.href}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
                >
                  <span className="font-medium">{r.nome}</span>
                  <span className="text-xs text-muted-foreground">{r.tipo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-7 rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Um projeto parceiro da Auto Limpeza Pro
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O Guia do Higienizador nasceu para ajudar profissionais a ingressarem e evoluírem no mercado de higienização e
          estética. O projeto conta com a parceria da Auto Limpeza Pro, empresa que atua na prática com higienização de
          estofados e acredita na profissionalização do setor.
        </p>
        <Link
          to="/parceria"
          className="btn-primary mt-4"
        >
          Conheça a Auto Limpeza Pro <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2.5">
        <Link to="/favoritos" className="rounded-2xl border border-border bg-card p-4 text-sm font-semibold">
          ⭐ Meus favoritos
        </Link>
        <Link to="/sobre" className="rounded-2xl border border-border bg-card p-4 text-sm font-semibold">
          📖 Sobre o projeto
        </Link>
        <Link to="/transparencia" className="rounded-2xl border border-border bg-card p-4 text-sm font-semibold">
          🔎 Transparência
        </Link>
      </section>
    </div>
  );
}
