# Scraper Easytech — higienização de estofados / tapetes / carpetes

Coleta **somente** o que a Easytech (e revendas públicas) publicam nas páginas dos produtos de estofado, tapete e carpete. Não inventa pH, diluição, composição nem número ANVISA. Campo ausente fica vazio.

Páginas oficiais em [easytechshield.com.br](https://www.easytechshield.com.br/loja/). Revendas consultadas: Quick Clean, Loja do Profissional, CarXparts e Polibox.

## Produtos (config no topo do script)

Para incluir outro SKU, acrescente um item em `PRODUTOS` (`slug`, `busca`, `urls`). O parser é genérico.

| Produto | Página oficial |
|---|---|
| Pluri | https://www.easytechshield.com.br/loja/pluri/ |
| Pluri Sensitive | https://www.easytechshield.com.br/loja/plurisensitive/ |
| Float APC | https://www.easytechshield.com.br/loja/float/ |
| ZBAC | https://www.easytechshield.com.br/loja/zbac/ |
| Oxy-4D (busca também Oxy2) | https://www.easytechshield.com.br/loja/oxy4d/ |
| Tapetex | https://www.easytechshield.com.br/loja/tapetex/ |
| Multi Interiores | https://www.easytechshield.com.br/loja/multiinteriores/ |
| Pro Imper | https://www.easytechshield.com.br/loja/proimper/ |
| Prepara | https://www.easytechshield.com.br/loja/prepara/ |
| Pluri Fast | https://www.easytechshield.com.br/loja/plurifast/ |
| Oxy Fast | https://www.easytechshield.com.br/loja/oxyfast/ |
| Quick Interiores | https://www.easytechshield.com.br/loja/quickinteriores/ |
| Pro Imper Premium | https://www.easytechshield.com.br/loja/proimperpremium/ |
| Ecotextil | https://www.easytechshield.com.br/loja/ecotextil/ |

Não entram aqui SKUs só de couro (Limpa Couro, Couro QD, Insignia Leather, Soul).

## Como rodar

Neste repositório o Node já está no PATH (Windows pode não ter Python). Use:

```bash
npm run scrape:easytech
npm run merge:easytech
```

Se houver Python:

```bash
cd scripts/easytech-estofados
python -m pip install -r requirements.txt
python scrape_easytech_estofados.py
```

Funções principais (os dois scripts): `get_product_data()`, `download_fispq()`, `save_data()`.

Intervalo entre requisições: 1,6–3 s. User-Agent identifica o Guia do Higienizador. Retries em 429/5xx. Se várias FISPQs existirem, fica a mais nova (ano no URL/arquivo, depois `v2` > `v1`, `rev1` > `rev0`). PDFs já existentes com mais de 1 KB são pulados.

A Easytech **quase não publica FISPQ/FDS** nas páginas de produto (0 PDFs públicos encontrados nesta coleta). O scraper registra o que achar; campo vazio significa “não encontrado — consulte o fabricante”.

## Saída

Em `scripts/easytech-estofados/`:

- `out/easytech_estofados.json` — fonte para o merge nas fichas do site
- `out/easytech_estofados.csv` — tabular (UTF-8 BOM, `;`)
- `out/easytech_estofados.xlsx` — mesma tabela
- `fispqs/` — PDFs baixados (ex.: `Pluri_FISPQ.pdf`)

PDFs e planilhas **não** entram no git. O site usa a **URL** pública.

## Alimentar o Guia

```bash
node scripts/merge-easytech-fichas.mjs
```

Atualiza só slugs `easytech-*` em `src/data/fichas-fabricantes.ts`. Não mexe em outras marcas. SKUs novos com URL real são acrescentados.

Confirme sempre no rótulo do lote: fichas mudam.
