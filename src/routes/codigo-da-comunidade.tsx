import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/codigo-da-comunidade")({
  head: () => ({
    meta: [
      { title: "Código da Comunidade — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Regras de convivência do Guia do Higienizador: respeito profissional, conteúdo técnico honesto, sem spam, sem promessa milagrosa e sem ataque a colegas.",
      },
      { property: "og:title", content: "Código da Comunidade — Guia do Higienizador" },
      { property: "og:description", content: "As regras que mantêm a comunidade técnica, segura e respeitosa." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CodigoPage,
});

const REGRAS = [
  {
    titulo: "Respeito acima de tudo",
    texto:
      "Ninguém aqui nasceu sabendo. Crítica técnica é bem-vinda; deboche, ataque pessoal, preconceito e assédio resultam em remoção da conta.",
  },
  {
    titulo: "Conteúdo técnico honesto",
    texto:
      "Descreva o que realmente aconteceu: tecido, produto, diluição, tempo de ação e resultado. Nada de antes e depois de terceiros apresentado como seu.",
  },
  {
    titulo: "Sem promessa milagrosa",
    texto:
      "Nenhum produto tira toda mancha, de todo tecido, sempre. Recomendações devem vir com contexto e ressalvas de risco.",
  },
  {
    titulo: "Segurança em primeiro lugar",
    texto:
      "Não publique misturas químicas perigosas (por exemplo, cloro com amônia) nem orientações que coloquem em risco quem executa o serviço ou o cliente.",
  },
  {
    titulo: "Sem spam e sem venda agressiva",
    texto:
      "Indicar produto ou fornecedor é permitido dentro da discussão técnica. Publicação repetida só para vender é removida.",
  },
  {
    titulo: "Concorrência é colega",
    texto:
      "Não use a comunidade para difamar profissionais, empresas ou lojas. Problemas comerciais se resolvem fora da plataforma.",
  },
  {
    titulo: "Níveis não são certificação",
    texto:
      "Os níveis e selos medem participação e contribuição na comunidade. Não são atestado técnico, curso reconhecido nem garantia de qualidade de serviço.",
  },
  {
    titulo: "Privacidade do cliente",
    texto:
      "Ao publicar fotos, evite expor endereço, documentos, rosto de pessoas e qualquer dado que identifique o cliente sem autorização.",
  },
];

function CodigoPage() {
  return (
    <div className="pb-8">
      <header className="surface-hero -mx-4 rounded-b-[2rem] px-4 pb-8 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">Convivência</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">Código da Comunidade</h1>
        <p className="mt-2 text-sm opacity-85">
          O Guia do Higienizador existe para elevar o nível técnico do setor. Estas regras valem para todo mundo, sem exceção.
        </p>
      </header>

      <ol className="mt-6 grid gap-3">
        {REGRAS.map((r, i) => (
          <li key={r.titulo} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-1 text-base font-bold leading-snug">{r.titulo}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.texto}</p>
          </li>
        ))}
      </ol>

      <section className="mt-6 rounded-2xl border border-border bg-muted/40 p-4">
        <h2 className="text-base font-bold">Como funciona a moderação</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Qualquer pessoa logada pode denunciar uma publicação, comentário, pergunta ou resposta. A equipe de moderação analisa o
          caso e pode ocultar o conteúdo, orientar o autor ou suspender a conta em casos graves ou reincidentes. A identidade de
          quem denuncia não é exibida.
        </p>
      </section>
    </div>
  );
}
