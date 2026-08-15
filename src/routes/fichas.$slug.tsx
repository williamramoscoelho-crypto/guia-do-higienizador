import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { EncontrouErro } from "@/components/app/EncontrouErro";
import { FeedbackUtil } from "@/components/app/FeedbackUtil";
import { AlertaPadrao, BadgeConfiabilidade } from "@/components/app/confiabilidade";
import {
  Aviso,
  Breadcrumbs,
  DataList,
  FavoritoBotao,
  InfoCard,
  PageHeader,
  RegistrarVisita,
  Section,
} from "@/components/app/ui";

export const Route = createFileRoute("/fichas/$slug")({
  loader: async ({ params }) => {
    const { getFicha, marcasFichas } = await import("@/data/fichas-fabricantes");
    const ficha = getFicha(params.slug);
    if (!ficha) throw notFound();
    const marca = marcasFichas.find((m) => m.slug === ficha.marca) ?? null;
    return { ficha, marca };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Ficha não encontrada" }, { name: "robots", content: "noindex" }] };
    const f = loaderData.ficha;
    const titulo = `${f.nome}: ficha técnica — Guia do Higienizador`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: f.resumo || `Consulta da ficha técnica de ${f.nome}.` },
        { property: "og:title", content: titulo },
        { property: "og:url", content: `/fichas/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/fichas/${params.slug}` }],
    };
  },
  component: Detalhe,
});

function campoUtil(valor: string) {
  if (!valor) return false;
  if (valor.length < 12) return /ml|l\b|1:\d|neutro|ácido|basico|básico|alcalino/i.test(valor);
  if (valor.length < 80 && /CEATOX|rótulo do produto/i.test(valor)) return false;
  return true;
}

function Detalhe() {
  const { ficha: f, marca } = Route.useLoaderData();
  const campos = [
    { label: "pH", valor: f.ph },
    { label: "Diluição", valor: f.diluicao },
    { label: "Uso recomendado", valor: f.usoRecomendado },
    { label: "Não recomendado", valor: f.naoRecomendado },
    { label: "Composição", valor: f.composicao },
    { label: "Modo de usar", valor: f.modoDeUsar },
    { label: "Embalagens", valor: f.embalagens },
    { label: "Ficha técnica (texto da página)", valor: f.fichaTecnica ?? "" },
  ].filter((c) => campoUtil(c.valor));

  return (
    <div className="pb-4">
      <RegistrarVisita nome={f.nome} href={`/fichas/${f.slug}`} tipo="Ficha" />
      <Breadcrumbs
        trilha={[
          { label: "Início", to: "/" },
          { label: "Fichas técnicas", to: "/fichas" },
          { label: f.nome },
        ]}
      />
      <PageHeader titulo={f.nome} eyebrow={marca?.nome ?? f.marca} descricao={f.resumo} />
      <div className="mt-3">
        {campos.length > 0 ? (
          <BadgeConfiabilidade
            nivel="bem_fundamentado"
            motivo={`Extraído da página oficial (${f.coletadoEm}). Confirme no rótulo do lote antes de aplicar.`}
          />
        ) : (
          <BadgeConfiabilidade
            nivel="insuficiente"
            motivo="A página oficial não tinha diluição/pH estruturados o bastante. Não inventamos valores."
          />
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <FavoritoBotao id={`ficha-${f.slug}`} tipo="Ficha" nome={f.nome} href={`/fichas/${f.slug}`} />
        <Link
          to="/ferramentas/diluicao"
          search={{ produto: f.slug }}
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold hover:border-primary/60"
        >
          Calcular diluição
        </Link>
      </div>
      <div className="mt-4">
        <AlertaPadrao tipo="consulte_fabricante" titulo="Sempre confirme no fabricante">
          Diluição e pH mudam de lote. Use este resumo só como índice — a fonte válida é o site/rótulo/FISPQ.
        </AlertaPadrao>
      </div>
      {campos.length > 0 ? (
        <Section titulo="O que o fabricante publica">
          <DataList itens={campos} />
        </Section>
      ) : (
        <Section>
          <InfoCard>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A página oficial não tinha ficha estruturada o bastante para extrair pH ou diluição. Abra a fonte.
            </p>
          </InfoCard>
        </Section>
      )}
      {f.linha ? (
        <Section titulo="Linha">
          <InfoCard>
            <p className="text-sm leading-relaxed">{f.linha}</p>
          </InfoCard>
        </Section>
      ) : null}
      {f.faq && f.faq.length > 0 ? (
        <Section titulo="Perguntas na página oficial">
          <dl className="space-y-3">
            {f.faq.map((q) => (
              <div key={q.p} className="rounded-2xl border border-border bg-card p-4">
                <dt className="text-sm font-semibold">{q.p}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.r}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}
      <Section titulo="Documentos e fonte">
        <ul className="grid gap-2 text-sm">
          <li>
            <a href={f.url} target="_blank" rel="noreferrer" className="text-primary underline">
              Página oficial do produto
            </a>
          </li>
          {f.fdsPdf ? (
            <li>
              <a href={f.fdsPdf} target="_blank" rel="noreferrer" className="text-primary underline">
                FISPQ / FDS (PDF do fabricante)
              </a>
            </li>
          ) : (
            <li className="text-muted-foreground">
              FISPQ não localizada na página oficial. Informação não encontrada — consulte o fabricante
              {marca ? (
                <>
                  {" "}
                  em{" "}
                  <a href={marca.site} target="_blank" rel="noreferrer" className="text-primary underline">
                    {marca.nome}
                  </a>
                </>
              ) : null}
              .
            </li>
          )}
          {f.sdsPdf ? (
            <li>
              <a href={f.sdsPdf} target="_blank" rel="noreferrer" className="text-primary underline">
                SDS (PDF internacional do fabricante)
              </a>
            </li>
          ) : null}
          {f.fichaPdf ? (
            <li>
              <a href={f.fichaPdf} target="_blank" rel="noreferrer" className="text-primary underline">
                Boletim / ficha técnica (PDF)
              </a>
            </li>
          ) : null}
          {f.documentos?.map((d) => (
            <li key={d.url}>
              <a href={d.url} target="_blank" rel="noreferrer" className="text-primary underline">
                {d.label}
              </a>
            </li>
          ))}
          {marca ? (
            <li>
              <a href={marca.site} target="_blank" rel="noreferrer" className="text-primary underline">
                Catálogo da marca
              </a>
            </li>
          ) : null}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Coletado em {f.coletadoEm}.</p>
      </Section>
      <Aviso titulo="Não invente diluição">
        Este resumo pode estar incompleto. Siga o rótulo do lote, a ficha atual e a FISPQ. Faça teste de compatibilidade
        em área pouco visível.
      </Aviso>
      <FeedbackUtil idPagina={`ficha-${f.slug}`} />
      <EncontrouErro path={`/fichas/${f.slug}`} />
    </div>
  );
}
