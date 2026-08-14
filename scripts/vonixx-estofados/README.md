# Scraper Vonixx — higienização de estofados (Sistema VSC)

Coleta **somente** o que a Vonixx publica nas páginas oficiais dos 7 produtos da linha de estofados / interior. Não inventa pH, diluição nem composição.

## Produtos

| Produto | Página |
|---|---|
| Extractus | https://www.vonixx.com.br/produto/extractus/ |
| Extractus Sensitive | https://www.vonixx.com.br/produto/extractus-sensitive/ |
| Bactran | https://www.vonixx.com.br/produto/bactran/ |
| Sanitizante Finalizador | https://www.vonixx.com.br/produto/sanitizante-finalizador/ |
| Sintra Pro | https://www.vonixx.com.br/produto/sintra-pro/ |
| Sintra Fast | https://www.vonixx.com.br/produto/sintra-fast/ |
| Vertex | https://www.vonixx.com.br/produto/vertex/ |

## Como rodar

Preferência do pedido original (Python):

```bash
cd scripts/vonixx-estofados
python -m pip install -r requirements.txt
python scrape_vonixx_estofados.py
```

Neste repositório o Node já está no PATH (Windows pode não ter Python). Use:

```bash
npm run scrape:vonixx
npm run merge:vonixx
```

Intervalo entre requisições: 1,6–3 s. User-Agent identifica o Guia do Higienizador. Retries em 429/5xx.

O parser lê a partir do `<h1>` (evita o menu), a seção **Ficha Técnica**, tamanhos em **VERSÕES DISPONÍVEIS** e os PDFs ligados na página. Não completa pH/diluição que o fabricante não publicou.

## Saída

Tudo em `scripts/vonixx-estofados/`:

- `out/vonixx_estofados.json` — estruturado (fonte para atualizar as fichas do site)
- `out/vonixx_estofados.csv` — tabular (UTF-8 BOM, `;`)
- `out/vonixx_estofados.xlsx` — mesma tabela para Excel
- `fispqs/` — PDFs de FISPQ/FDS, SDS, checklist e certificados ligados na página (ex.: `BACTRAN_FISPQ.pdf`)

PDFs e planilhas **não** entram no git. O site usa a **URL oficial** do fabricante.

## Alimentar o Guia

Depois da coleta:

```bash
node scripts/merge-vonixx-fichas.mjs
```

Isso atualiza só os 7 slugs em `src/data/fichas-fabricantes.ts`, sem misturar campos e sem truncar diluição/pH.

Confirme sempre no rótulo do lote: fichas mudam.
