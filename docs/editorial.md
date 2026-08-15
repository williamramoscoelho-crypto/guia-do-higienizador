# Fluxo editorial mínimo — Guia do Higienizador

Estados sugeridos para conteúdo técnico (ainda sem CMS completo):

1. **Rascunho** — texto interno; não publicado nas rotas.
2. **Revisão** — checar fonte (ficha/rótulo/FISPQ/experiência rotulada).
3. **Publicado** — entra em `src/data/*`, sitemap e busca.
4. **Corrigir** — sinalizado via “Encontrou um erro?” (localStorage `gh:erros-reportados`) ou denúncia da comunidade.

## Regras

- Não inventar diluição, pH ou composição.
- Experiência de campo ≠ ficha oficial: use `AlertaPadrao` tipo `fonte` e/ou badge adequado.
- Buscas sem resultado (`gh:busca-sem-resultado`) alimentam a fila editorial.

## Canais no produto

| Canal | Onde |
|-------|------|
| Foi útil? | `FeedbackUtil` |
| Erro técnico | `EncontrouErro` |
| Denúncia comunidade | `DenunciarBotao` |
| Caso estruturado | `/casos-reais` |
| Perfil / reputação | `/painel` (auth) |
