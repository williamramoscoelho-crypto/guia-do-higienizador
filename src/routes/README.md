# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.

## Calculadora de diluição

Rota: `/ferramentas/diluicao`. A conta lê razões `1:N` publicadas em
`ficha.diluicao` (e, se vazio, `modoDeUsar` / `fichaTecnica`). Parser:
`src/lib/diluicao.ts`.

Para incluir uma proporção nova: grave o texto **do fabricante** no campo da
ficha — não invente `1:10` / `1:30` / `1:60`. Sem `1:N` (nem “pronto uso”), a
calculadora recusa e manda abrir o rótulo. Convenção da conta: `1:N` = 1 parte
de concentrado + N partes de água.
