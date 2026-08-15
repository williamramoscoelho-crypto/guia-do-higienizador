import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Aviso, Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";
import type { FichaFabricante } from "@/data/fichas-fabricantes";
import {
  analisarDiluicao,
  calcularSolucao,
  chaveProporcao,
  escolherProporcao,
  formatarLitros,
  formatarMl,
  intensidadesPublicadas,
  parseEmbalagensMl,
  temProporcaoCalculavel,
  type IntensidadeDiluicao,
} from "@/lib/diluicao";
import { iaConfigurada } from "@/lib/flags";
import { useLocalState } from "@/lib/local";

type SearchDiluicao = { produto?: string };

type Persistido = {
  produtoSlug: string;
  packMl: string;
  litros: string;
  intensidade: IntensidadeDiluicao | "";
  razaoEscolhida: string;
  partesProduto: string;
  partesAgua: string;
};

const MANUAL = "manual";
const STORAGE_KEY = "gh:diluicao";

const padrao: Persistido = {
  produtoSlug: "",
  packMl: "1000",
  litros: "1",
  intensidade: "",
  razaoEscolhida: "",
  partesProduto: "1",
  partesAgua: "10",
};

export const Route = createFileRoute("/ferramentas/diluicao")({
  validateSearch: (s: Record<string, unknown>): SearchDiluicao => {
    const raw = s["produto"];
    if (typeof raw === "string" && raw) return { produto: raw };
    return {};
  },
  loader: async () => {
    const { fichasFabricantes, marcasFichas } = await import("@/data/fichas-fabricantes");
    return {
      fichasFabricantes,
      marcasFichas: [...marcasFichas],
      bySlug: Object.fromEntries(fichasFabricantes.map((f) => [f.slug, f])) as Record<string, FichaFabricante>,
    };
  },
  head: () => ({
    meta: [
      { title: "Calculadora de diluição — Guia do Higienizador" },
      {
        name: "description",
        content:
          "Calcule ml de concentrado a partir da proporção publicada na ficha do fabricante. Sem inventar diluição.",
      },
      { property: "og:title", content: "Calculadora de diluição" },
      { property: "og:url", content: "/ferramentas/diluicao" },
    ],
    links: [{ rel: "canonical", href: "/ferramentas/diluicao" }],
  }),
  component: Diluicao,
});

function Diluicao() {
  const { fichasFabricantes, marcasFichas, bySlug } = Route.useLoaderData();
  const getFicha = (slug: string): FichaFabricante | undefined => bySlug[slug];
  const search = Route.useSearch();
  const [salvo, setSalvo] = useLocalState<Persistido>(STORAGE_KEY, {
    ...padrao,
    ...(search.produto ? { produtoSlug: search.produto } : {}),
  });
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const slug = search.produto;
    if (!slug) return;
    const next = getFicha(slug);
    if (!next) return;
    setSalvo((prev) => {
      if (prev.produtoSlug === slug) return prev;
      const packs = parseEmbalagensMl(next.embalagens);
      return {
        ...prev,
        produtoSlug: slug,
        razaoEscolhida: "",
        intensidade: "",
        ...(packs[0] ? { packMl: String(packs[0]) } : {}),
      };
    });
  }, [search.produto, setSalvo, bySlug]);

  const produtoSlug = salvo.produtoSlug;
  const ficha = produtoSlug && produtoSlug !== MANUAL ? (getFicha(produtoSlug) ?? null) : null;
  const analise = useMemo(() => (ficha ? analisarDiluicao(ficha) : null), [ficha]);
  const intensidades = analise ? intensidadesPublicadas(analise) : [];

  const packOpcoes = ficha ? parseEmbalagensMl(ficha.embalagens) : [];
  const packMl = Number(String(salvo.packMl).replace(",", "."));
  const litros = Number(String(salvo.litros).replace(",", "."));
  const volumeMl = litros * 1000;

  const modoManual = produtoSlug === MANUAL;
  const proporcao = analise
    ? escolherProporcao(analise, salvo.intensidade, salvo.razaoEscolhida)
    : null;

  const partesProduto = modoManual ? Number(salvo.partesProduto.replace(",", ".")) : (proporcao?.partesProduto ?? NaN);
  const partesAgua = modoManual ? Number(salvo.partesAgua.replace(",", ".")) : (proporcao?.partesAgua ?? NaN);
  const razao =
    modoManual && Number.isFinite(partesProduto) && Number.isFinite(partesAgua)
      ? `${partesProduto}:${partesAgua}`
      : (proporcao?.razao ?? "");

  const resultado = useMemo(
    () => calcularSolucao(volumeMl, partesProduto, partesAgua),
    [volumeMl, partesProduto, partesAgua],
  );

  const recusaFicha = Boolean(ficha && analise && !temProporcaoCalculavel(analise));
  const podeCalcular = Boolean(resultado) && ((modoManual && produtoSlug === MANUAL) || Boolean(proporcao));

  const marcaNome = ficha ? (marcasFichas.find((m) => m.slug === ficha.marca)?.nome ?? ficha.marca) : "";

  const textoCopia = podeCalcular && resultado
    ? [
        ficha ? `${marcaNome} ${ficha.nome}` : "Proporção informada do rótulo",
        `Razão: ${razao}${proporcao?.ate ? " (o fabricante cita “até”)" : ""}`,
        proporcao?.rotulo ? `Citação: ${proporcao.rotulo}` : "",
        `Solução: ${formatarLitros(litros)}`,
        `Concentrado: ${formatarMl(resultado.mlProduto)}`,
        `Água: ${formatarMl(resultado.mlAgua)}`,
        Number.isFinite(packMl) && packMl > 0
          ? `Embalagem: ${formatarMl(packMl)} (${((resultado.mlProduto / packMl) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% desta embalagem)`
          : "",
        "Confirme no rótulo/lote e na FISPQ. Não misture químicos. Faça spot test.",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  function patch(parcial: Partial<Persistido>) {
    setSalvo((prev) => ({ ...prev, ...parcial }));
  }

  async function copiar() {
    if (!textoCopia) return;
    try {
      await navigator.clipboard.writeText(textoCopia);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="pb-4">
      <Breadcrumbs
        trilha={[
          { label: "Início", to: "/" },
          { label: "Ferramentas", to: "/ferramentas" },
          { label: "Diluição" },
        ]}
      />
      <PageHeader
        titulo="Calculadora de diluição"
        eyebrow="Ferramenta"
        descricao="Usa só a proporção publicada na ficha (ex.: 1:20). Se a ficha não citar razão, a conta não é inventada — abra o rótulo."
      />

      <Section>
        <div className="grid gap-3">
          <label className="block" htmlFor="produto-diluicao">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Produto (ficha do fabricante)
            </span>
            <select
              id="produto-diluicao"
              value={produtoSlug}
              onChange={(e) => {
                const slug = e.target.value;
                const next = slug && slug !== MANUAL ? getFicha(slug) : null;
                const packs = next ? parseEmbalagensMl(next.embalagens) : [];
                patch({
                  produtoSlug: slug,
                  razaoEscolhida: "",
                  intensidade: "",
                  ...(packs[0] ? { packMl: String(packs[0]) } : {}),
                });
              }}
              className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">Selecione um produto</option>
              <option value={MANUAL}>Informar a proporção do rótulo</option>
              {marcasFichas.map((marca) => (
                <optgroup key={marca.slug} label={marca.nome}>
                  {fichasFabricantes
                    .filter((f) => f.marca === marca.slug)
                    .map((f) => (
                      <option key={f.slug} value={f.slug}>
                        {f.nome}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>

          {ficha && ficha.diluicao.trim() ? (
            <InfoCard>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Texto de diluição da ficha</p>
              <p className="mt-1 text-sm leading-relaxed">{ficha.diluicao}</p>
            </InfoCard>
          ) : null}

          {ficha ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Citação de {marcaNome}.{" "}
              <Link
                to="/fichas/$slug"
                params={{ slug: ficha.slug }}
                className="font-semibold text-primary underline"
              >
                Abrir ficha
              </Link>
              {ficha.url ? (
                <>
                  {" · "}
                  <a href={ficha.url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
                    Página oficial
                  </a>
                </>
              ) : null}
            </p>
          ) : null}

          {recusaFicha && ficha ? (
            <Aviso titulo="Esta ficha não publica uma razão 1:N">
              Não inventamos diluição. Abra a{" "}
              <Link to="/fichas/$slug" params={{ slug: ficha.slug }} className="font-semibold underline">
                ficha
              </Link>
              {ficha.url ? (
                <>
                  {" "}
                  ou o{" "}
                  <a href={ficha.url} target="_blank" rel="noreferrer" className="font-semibold underline">
                    rótulo/página oficial
                  </a>
                </>
              ) : (
                " ou o rótulo do lote"
              )}{" "}
              e use “Informar a proporção do rótulo” só depois de ler o número.
            </Aviso>
          ) : null}

          {analise && temProporcaoCalculavel(analise) ? (
            <>
              {intensidades.length > 0 ? (
                <fieldset>
                  <legend className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Intensidade da sujeira (só as que a ficha cita)
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {intensidades.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => patch({ intensidade: item, razaoEscolhida: "" })}
                        className={
                          salvo.intensidade === item
                            ? "min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                            : "min-h-11 rounded-full border border-border bg-card px-4 text-sm"
                        }
                      >
                        {labelIntensidade(item)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Esta ficha não descreve leve / média / pesada. Escolha uma proporção citada abaixo.
                </p>
              )}

              {analise.proporcoes.length > 0 ? (
                <fieldset>
                  <legend className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Proporção publicada
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {analise.proporcoes.map((p) => {
                      const ativo = proporcao ? chaveProporcao(proporcao) === chaveProporcao(p) : false;
                      return (
                        <button
                          key={chaveProporcao(p)}
                          type="button"
                          onClick={() =>
                            patch({
                              razaoEscolhida: chaveProporcao(p),
                              ...(p.intensidade ? { intensidade: p.intensidade } : {}),
                            })
                          }
                          className={
                            ativo
                              ? "min-h-11 max-w-full rounded-full bg-primary px-4 text-left text-sm font-semibold text-primary-foreground"
                              : "min-h-11 max-w-full rounded-full border border-border bg-card px-4 text-left text-sm"
                          }
                        >
                          {p.razao}
                          {p.ate ? " (até)" : ""}
                          {p.rotulo && p.rotulo !== p.razao ? (
                            <span className={ativo ? "block text-xs font-normal opacity-90" : "block text-xs text-muted-foreground"}>
                              {p.rotulo}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ) : analise.prontoUso ? (
                <p className="text-sm">
                  O fabricante descreve este produto como <strong>pronto uso</strong> — sem diluição nesta ficha.
                </p>
              ) : null}
            </>
          ) : null}

          {modoManual && produtoSlug === MANUAL ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo
                label="Partes de produto (rótulo)"
                value={salvo.partesProduto}
                onChange={(v) => patch({ partesProduto: v })}
              />
              <Campo
                label="Partes de água (rótulo)"
                value={salvo.partesAgua}
                onChange={(v) => patch({ partesAgua: v })}
              />
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block" htmlFor="pack-diluicao">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tamanho da embalagem (ml)
              </span>
              <input
                id="pack-diluicao"
                inputMode="decimal"
                value={salvo.packMl}
                onChange={(e) => patch({ packMl: e.target.value })}
                className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
              {packOpcoes.length > 0 ? (
                <span className="mt-2 flex flex-wrap gap-2">
                  {packOpcoes.map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => patch({ packMl: String(ml) })}
                      className={
                        Number(salvo.packMl) === ml
                          ? "min-h-11 rounded-full bg-secondary px-3 text-xs font-semibold"
                          : "min-h-11 rounded-full border border-border px-3 text-xs"
                      }
                    >
                      {ml >= 1000 ? `${ml / 1000} L` : `${ml} ml`}
                    </button>
                  ))}
                </span>
              ) : null}
            </label>
            <Campo
              label="Solução desejada (litros)"
              value={salvo.litros}
              onChange={(v) => patch({ litros: v })}
            />
          </div>
        </div>

        {podeCalcular && resultado ? (
          <InfoCard className="mt-4">
            <p className="text-sm font-bold">Resultado</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {razao === "pronto uso"
                ? "Pronto uso: o volume da solução é o volume do produto."
                : `${razao} nesta calculadora = ${partesProduto} parte(s) de concentrado + ${partesAgua} parte(s) de água.`}
            </p>
            <p className="mt-3 text-lg font-bold leading-snug" aria-live="polite" role="status">
              {formatarMl(resultado.mlProduto)} de concentrado
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              + {formatarMl(resultado.mlAgua)} de água para {formatarLitros(litros)} de solução
              {razao ? (
                <>
                  {" "}
                  · razão <strong>{razao}</strong>
                </>
              ) : null}
            </p>
            {Number.isFinite(packMl) && packMl > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {((resultado.mlProduto / packMl) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% de uma
                embalagem de {formatarMl(packMl)}. Uma embalagem rende cerca de{" "}
                {formatarLitros((packMl * (partesProduto + partesAgua)) / partesProduto / 1000)} de solução nesta razão.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void copiar()}
              className="btn-primary mt-4 min-h-12 w-full justify-center gap-2 text-sm"
              aria-live="polite"
            >
              {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copiado ? "Copiado" : "Copiar resultado"}
            </button>
          </InfoCard>
        ) : recusaFicha ? null : produtoSlug === MANUAL ? (
          <p className="mt-4 text-sm text-muted-foreground">Preencha volume e proporção com números maiores que zero.</p>
        ) : ficha && analise && analise.proporcoes.length > 1 && !proporcao ? (
          <p className="mt-4 text-sm text-muted-foreground">Escolha a intensidade ou a proporção citada na ficha.</p>
        ) : produtoSlug ? (
          <p className="mt-4 text-sm text-muted-foreground">Preencha o volume da solução com um número maior que zero.</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Selecione um produto da ficha. Sem razão publicada, use o rótulo — não inventamos diluição.
          </p>
        )}
      </Section>

      <Section>
        <Aviso titulo="Segurança no uso de químicos">
          Não misture produtos de fabricantes ou funções diferentes (alvejante clorado não é peróxido profissional).
          Faça spot test em área discreta. Siga a FISPQ, a ficha e o rótulo do lote — esta conta não substitui o
          fabricante.
        </Aviso>
      </Section>
      {iaConfigurada() ? (
        <p className="mt-4 text-sm">
          <Link to="/ia" search={{ modo: "diluicao" }} className="font-semibold text-primary underline">
            Pedir orientação à IA
          </Link>{" "}
          — ela não inventa a proporção; aponta a ficha e esta calculadora.
        </p>
      ) : null}
    </div>
  );
}

function labelIntensidade(item: IntensidadeDiluicao) {
  if (item === "leve") return "Leve";
  if (item === "media") return "Média";
  return "Pesada";
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
