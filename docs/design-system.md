# Design System — Guia do Higienizador

Identidade: dark tech (azul + ciano), Plus Jakarta Sans, radius ~1rem.

## Tokens (CSS)

Definidos em `src/styles.css` (`@theme` / variáveis):

- Cores: `--background`, `--foreground`, `--primary`, `--card`, `--warning`, `--destructive`, `--success`
- Tipografia: `--font-sans`, `--font-display` (Plus Jakarta Sans self-host WOFF2)
- Radius: `--radius` e derivados

## Layout

| Token | Uso |
|-------|-----|
| `.app-shell` | Container fluido: 40rem → 48rem (md) → 64rem (lg) → 72rem (2xl) |
| `.surface-hero` | Cabeçalhos de página |
| `.btn-primary` | CTA principal (min-height 2.75rem) |
| `.card-tap` | Cards tocáveis |

## Componentes (`src/components/app/`)

- `ui.tsx` — PageHeader, Section, InfoCard, DataList, ItemLink, Aviso, Chip, Breadcrumbs
- `confiabilidade.tsx` — BadgeConfiabilidade, AlertaPadrao
- `BottomNav` — mobile (&lt; lg)
- `AppHeader` — desktop (≥ lg)
- `FeedbackUtil` — “Esta informação foi útil?”
- `EncontrouErro` — denúncia editorial leve

## Toque

Piso de área interativa: **min-height 2.75rem (44px)** em ações primárias e chips de filtro.

## Regras

- Não inventar diluição/pH/química na UI.
- Preferir AlertaPadrao `insuficiente` a inventar orientação.
- Dark mode é o padrão do produto; manter contraste AA.
