import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Breadcrumbs, InfoCard, PageHeader, Section } from "@/components/app/ui";
import { EVENTO_CONFIG, PageTransition } from "@/components/app/PageTransition";
import {
  CONFIG_PADRAO,
  EASINGS,
  EFEITOS,
  DIRECOES,
  STORAGE_KEY,
  normalizarConfig,
  type Direcao,
  type Efeito,
  type TransitionConfig,
} from "@/lib/page-transitions";

export const Route = createFileRoute("/transicoes")({
  head: () => ({
    meta: [
      { title: "Transições de página — Guia do Higienizador" },
      {
        name: "description",
        content: "Escolha o efeito, a duração e a curva de animação usados na navegação entre as páginas do guia.",
      },
      { property: "og:title", content: "Ajustes de transição de página" },
      {
        property: "og:description",
        content: "Fade, slide, zoom, flip, parallax e desfoque — com controle de duração, easing e acessibilidade.",
      },
      { property: "og:url", content: "/transicoes" },
    ],
    links: [{ rel: "canonical", href: "/transicoes" }],
  }),
  component: Transicoes,
});

const ROTULO_EFEITO: Record<Efeito, string> = {
  none: "Nenhuma",
  fade: "Fade",
  slide: "Slide",
  "zoom-in": "Zoom in",
  "zoom-out": "Zoom out",
  "flip-x": "Flip horizontal",
  "flip-y": "Flip vertical",
  parallax: "Parallax",
  "blur-rise": "Desfoque + subida",
};

const ROTULO_DIRECAO: Record<Direcao, string> = {
  auto: "Automática",
  left: "Esquerda",
  right: "Direita",
  up: "Cima",
  down: "Baixo",
};

function salvar(config: TransitionConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event(EVENTO_CONFIG));
  } catch {
    /* storage indisponível */
  }
}

function Transicoes() {
  const [config, setConfig] = useState<TransitionConfig>(CONFIG_PADRAO);
  const [previewKey, setPreviewKey] = useState(0);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setConfig(normalizarConfig(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    setHidratado(true);
  }, []);

  // O cálculo fica fora do updater: efeitos colaterais (localStorage e o
  // evento de sincronização) nunca podem rodar durante a renderização.
  const atualizar = (patch: Partial<TransitionConfig>) => {
    const próxima = normalizarConfig({ ...config, ...patch });
    setConfig(próxima);
    salvar(próxima);
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="pb-4">
      <Breadcrumbs trilha={[{ label: "Início", to: "/" }, { label: "Transições" }]} />
      <PageHeader
        titulo="Transições de página"
        eyebrow="Experiência"
        descricao="Escolha como as páginas entram na tela. As preferências ficam salvas neste aparelho."
      />

      <Section titulo="Pré-visualização">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/60 p-4">
          <PageTransition config={config} transitionKey={String(previewKey)}>
            <div className="rounded-xl border border-border/70 bg-background/70 p-5">
              <p className="text-sm font-semibold text-foreground">Exemplo de página</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Este bloco reproduz exatamente a animação aplicada na navegação real.
              </p>
            </div>
          </PageTransition>
          <button
            type="button"
            onClick={() => setPreviewKey((k) => k + 1)}
            className="btn-primary mt-4"
            aria-label="Repetir a pré-visualização da transição"
          >
            Repetir animação
          </button>
        </div>
      </Section>

      <Section titulo="Efeito">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EFEITOS.map((efeito) => {
            const ativo = config.efeito === efeito;
            return (
              <button
                key={efeito}
                type="button"
                aria-pressed={ativo}
                onClick={() => atualizar({ efeito })}
                className={`min-h-11 rounded-xl border px-3 text-sm font-medium transition-colors ${
                  ativo
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {ROTULO_EFEITO[efeito]}
              </button>
            );
          })}
        </div>
      </Section>

      <Section titulo="Parâmetros">
        <InfoCard className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Duração: <span className="text-primary">{config.duracao} ms</span>
            </span>
            <input
              type="range"
              min={80}
              max={1200}
              step={20}
              value={config.duracao}
              onChange={(e) => atualizar({ duracao: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Curva de aceleração</span>
            <select
              value={config.easing}
              onChange={(e) => atualizar({ easing: e.target.value })}
              className="mt-2 min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            >
              {Object.entries(EASINGS).map(([rotulo, valor]) => (
                <option key={rotulo} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Direção</span>
            <select
              value={config.direcao}
              onChange={(e) => atualizar({ direcao: e.target.value as Direcao })}
              className="mt-2 min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            >
              {DIRECOES.map((d) => (
                <option key={d} value={d}>
                  {ROTULO_DIRECAO[d]}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted-foreground">
              Automática: avançar entra pela direita, voltar entra pela esquerda.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Opacidade inicial: <span className="text-primary">{config.opacidadeInicial.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.opacidadeInicial}
              onChange={(e) => atualizar({ opacidadeInicial: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Deslocamento: <span className="text-primary">{config.distancia} px</span>
            </span>
            <input
              type="range"
              min={0}
              max={120}
              step={4}
              value={config.distancia}
              onChange={(e) => atualizar({ distancia: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={config.respeitarReducedMotion}
              onChange={(e) => atualizar({ respeitarReducedMotion: e.target.checked })}
              className="mt-1 size-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Respeitar “reduzir movimento”</span> — desliga as animações
              quando o sistema do usuário pede menos movimento.
            </span>
          </label>

          <button
            type="button"
            onClick={() => atualizar(CONFIG_PADRAO)}
            className="min-h-11 w-full rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Restaurar padrão
          </button>

          {!hidratado && <span className="sr-only">Carregando preferências…</span>}
        </InfoCard>
      </Section>

      <Section titulo="Como funciona">
        <InfoCard className="space-y-2 text-sm text-muted-foreground">
          <p>
            As animações são puramente CSS e usam apenas <strong className="text-foreground">transform</strong>,{" "}
            <strong className="text-foreground">opacity</strong> e <strong className="text-foreground">filter</strong>,
            propriedades compostas pela GPU — sem reflow e sem travar a rolagem.
          </p>
          <p>
            Os parâmetros viram custom properties CSS (<code>--pt-duration</code>, <code>--pt-easing</code>,{" "}
            <code>--pt-opacity</code>, <code>--pt-distance</code>) aplicadas ao contêiner da página.
          </p>
          <p>
            A preferência fica em <code>localStorage</code> e vale para todo o guia neste aparelho. Compatível com
            Chrome, Safari, Firefox e Edge atuais.
          </p>
        </InfoCard>
      </Section>
    </div>
  );
}
