import { createFileRoute, notFound } from "@tanstack/react-router";
import { getFicha, marcasFichas } from "@/data/fichas-fabricantes";
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
  loader: ({ params }) => {
    const ficha = getFicha(params.slug);
    if (!ficha) throw notFound();
    return { ficha };
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
  if (valor.length < 8) return /ml|l\b|1:\d/i.test(valor);
  return !/CEATOX|rótulo do produto/i.test(valor);
}

function Detalhe() {
  const { ficha: f } = Route.useLoaderData();
  const marca = marcasFichas.find((m) => m.slug === f.marca);
  const campos = [
    { label: "pH", valor: f.ph },
    { label: "Diluição", valor: f.diluicao },
    { label: "Uso recomendado", valor: f.usoRecomendado },
    { label: "Não recomendado", valor: f.naoRecomendado },
    { label: "Composição", valor: f.composicao },
    { label: "Modo de usar", valor: f.modoDeUsar },
    { label: "Embalagens", valor: f.embalagens },
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
      <div className="mt-4">
        <FavoritoBotao id={`ficha-${f.slug}`} tipo="Ficha" nome={f.nome} href={`/fichas/${f.slug}`} />
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
          ) : null}
          {f.fichaPdf ? (
            <li>
              <a href={f.fichaPdf} target="_blank" rel="noreferrer" className="text-primary underline">
                Boletim / ficha técnica (PDF)
              </a>
            </li>
          ) : null}
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
    </div>
  );
}
