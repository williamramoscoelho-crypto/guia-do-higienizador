# Performance baseline — Guia do Higienizador
# Lab local + HTML de build cPanel. CWV de campo: medir no PageSpeed após publicar.

## Antes (produção / build antigo)

| URL | HTML | Notas |
|---|---|---|
| `/` | ~9 KB | Só “Carregando…” / casco SPA; matches `__root__` |
| Google Fonts | CSS externo | 4 pesos + italic bloqueantes |
| JS crítico home | ~916 KB (index+backend+fichas) | Preloads no HTML |

## Depois (build cPanel 2026-08-14, pós-correções)

| URL | HTML | Notas |
|---|---|---|
| `/` | ~20 KB | **H1 + atalhos no HTML**; sem Carregando… |
| `/tecidos/suede` | prerender OK | Conteúdo completo |
| `/buscar` | prerender OK | Debounce 250 ms |
| Fontes | WOFF2 self-host | Plus Jakarta 400–700 latin; sem fonts.googleapis |
| Preloads `/` (disco) | **~581 KB** | Sem `fichas-fabricantes` nem chunk Supabase no boot |
| `fichas-fabricantes` | ~115 KB | Só rotas /fichas, diluição, etc. (lazy) |
| Supabase `client-*.js` | ~205 KB | Fora do preload da home |

### Correções aplicadas

1. SPA `maskPath: /spa-shell` → home deixa de ser o casco `_shell.html`
2. Flags leves (`src/lib/flags.ts`) na home/nav — sem puxar IA/fichas/Supabase
3. Auth: sessão em idle + import dinâmico do Supabase
4. Busca: índice `fichas-meta-leve` + debounce
5. PageTransition padrão `none` (sem opacity 0); keyframes restaurados
6. BottomNav sem `backdrop-blur-xl`
7. PWA: `public/sw.js` cache-first só para `/assets/*` + fontes/ícones; HTML/API sempre rede

## Checklist CWV pós-deploy (não inventar scores)

Medir no [PageSpeed Insights](https://pagespeed.web.dev/) (mobile + field se disponível) **depois** de publicar HostGator:

- [ ] `/`
- [ ] `/tecidos/suede`
- [ ] `/buscar`
- [ ] `/fichas`
- [ ] `/comunidade` (se API ativa)
- [ ] `/diagnostico`

Registrar LCP / INP / CLS reais aqui. Sem lab/field = sem número inventado.

## CDN (opcional)

Cloudflare (ou equivalente) só se TTFB/origin HostGator for o gargalo medido. Não é obrigatório nesta fase; assets já têm SW cache-first no cliente.
