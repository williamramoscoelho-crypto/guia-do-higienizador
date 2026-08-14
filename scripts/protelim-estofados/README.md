# Scraper Protelim — estofados, carpetes e interior

Coleta **somente** o que a Protelim publica nas páginas oficiais da linha de
higienização de estofados / carpetes / interior (SHP, couro, bactericidas e
Prot Dry). Não inventa pH, diluição, composição, ANVISA nem reivindicação de
remoção.

## Produtos (lista no topo do script)

A lista `PRODUTOS` é o ponto de inclusão. O scraper também varre categorias
oficiais (SHP, tecidos, couro, lavagem a seco, bactericidas) e acrescenta SKUs
encontrados — sem inventar nomes.

| Produto | Página |
|---|---|
| CARP 20 | https://protelim.com.br/produto/prot-carp-20-limpa-tapetes-e-carpetes/ |
| Multi Ecco APC | https://protelim.com.br/produto/multi-ecco-apc-limpador-apc-multiuso/ |
| Bac Peroxy | https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/ |
| APC (pronto uso / interiores) | https://protelim.com.br/produto/apc-limpador-de-alta-performance/ |
| Prot Water | https://protelim.com.br/produto/prot-water-protetor-de-tecido/ |
| Water Guard | https://protelim.com.br/produto/water-guard/ |
| Prot Dry | https://protelim.com.br/produto/lava-a-seco-automotivo-prot-dry/ |
| Prot Dry Pronto Uso | https://protelim.com.br/produto/prot-dry-pronto-uso-lavagem-a-seco-automotiva/ |
| Leather Cleaner | https://protelim.com.br/produto/leather-cleaner-limpa-couro/ |
| Leather | https://protelim.com.br/produto/prot-couro-revitalizador-de-couro/ |

## Como rodar

Preferência do pedido original (Python):

```bash
cd scripts/protelim-estofados
python -m pip install -r requirements.txt
python scrape_protelim_estofados.py
```

Neste repositório o Node já está no PATH (Windows pode não ter Python). Use:

```bash
npm run scrape:protelim
npm run merge:protelim
```

Intervalo entre requisições: 1,5–3 s. User-Agent identifica o Guia do
Higienizador. Retries em 429/5xx. Se o HTML do produto vier vazio, tenta
Playwright (opcional; não é dependência).

O parser lê a partir do `<h1>` (evita o menu), o bloco WooCommerce, **Modo de
Usar**, **Indicação**, **EMBALAGENS**, o botão **Baixar FDS** e os PDFs da
página. Se houver várias FDS, a mais nova vence (ano na URL, v2>v1, rev1>rev0).
Campo ausente no fabricante permanece vazio.

## Saída

Tudo em `scripts/protelim-estofados/`:

- `out/protelim_estofados.json` — estruturado (fonte para atualizar as fichas)
- `out/protelim_estofados.csv` — tabular (UTF-8 BOM, `;`)
- `out/protelim_estofados.xlsx` — mesma tabela para Excel
- `fispqs/` — PDFs de FDS/FISPQ ligados na página (ex.: `Prot_Carp_20_FDS.pdf`)

PDFs e planilhas **não** entram no git. O site usa a **URL oficial** do fabricante.

## Alimentar o Guia

Depois da coleta:

```bash
node scripts/merge-protelim-fichas.mjs
```

Atualiza slugs Protelim já existentes em `src/data/fichas-fabricantes.ts` e
inclui SKUs novos com a forma `FichaFabricante` (`marca: "protelim"`).

Confirme sempre no rótulo do lote: fichas mudam.
