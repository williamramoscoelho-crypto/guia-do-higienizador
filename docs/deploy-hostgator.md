# Deploy HostGator — Guia do Higienizador

Site: https://guiadohigienizador.autolimpezapro.com.br

O servidor **não precisa de Node**. O build roda no computador (ou no GitHub Actions). No HostGator entram:

- o SPA (HTML/CSS/JS) — fichas, manchas, diluição, guia técnico
- a API PHP em `/api` — login, comunidade, Higienizador IA
- MySQL (banco da comunidade)

Não envie para `public_html` da Auto Limpeza Pro. Pasta do subdomínio: `public_html/guiadohigienizador`.

No subdomínio o Apache já trata essa pasta como raiz do vhost. O `.htaccess` usa `RewriteBase /`. `RewriteBase /guiadohigienizador/` quebraria o subdomínio.

## Instalação

### 1. Criar o banco MySQL no cPanel

1. Entre no cPanel → **Bancos de Dados MySQL**.
2. Crie um banco (anote o nome completo, em geral `usuario_nomedobanco`).
3. Crie um usuário com senha forte e **adicione o usuário ao banco** com todos os privilégios.

### 2. Importar o schema no phpMyAdmin

1. Abra **phpMyAdmin** e selecione o banco recém-criado.
2. Aba **Importar** → envie `api/schema.sql` (está no zip / na pasta `cpanel/api/` depois do build, ou no repositório em `api/schema.sql`).
3. Confirme que existem tabelas `users`, `profiles`, `posts`, `groups`, etc.

Para tornar alguém moderador depois do cadastro (phpMyAdmin):

```sql
UPDATE user_roles SET role = 'admin' WHERE user_id = 'UUID-DO-USUARIO';
```

(O cadastro já cria o papel `member`.)

### 3. Configurar a API PHP

No servidor, em `public_html/guiadohigienizador/api/`:

1. Copie `config.example.php` para `config.php`.
2. Preencha `db_host` (quase sempre `localhost`), `db_name`, `db_user`, `db_pass`.
3. `app_origin`: `https://guiadohigienizador.autolimpezapro.com.br`
4. **Opcional** — Higienizador IA (chave **só** em `config.php`, nunca em `VITE_`):
   - `gemini_api_key` — [Google AI Studio](https://aistudio.google.com/apikey) (preferido se `ia_provider` = `auto`)
   - `openai_api_key` — alternativa OpenAI
   - `ia_provider`: `auto` | `gemini` | `openai`
   - Modelos: `gemini_model` (padrão `gemini-2.0-flash`) / `openai_model`
5. Permissões: `config.php` só o dono lê (ex.: `chmod 600`). Pastas `api/` e o restante: 755 arquivos 644.

Sem chave de IA, login e comunidade funcionam; `/ia` avisa que ainda não está configurada.

### 4. Gerar o pacote no computador

```bash
npm install
npm run build:cpanel
```

Não precisa de `.env`. O SPA já aponta para `/api` no mesmo origin.

Confirme `cpanel/` e `cpanel.zip` (ignorados pelo git). Dentro deve existir `cpanel/api/index.php` e `cpanel/api/schema.sql`. **Não** deve existir `cpanel/api/config.php`.

### 5. Extrair em `public_html/guiadohigienizador`

1. No cPanel, crie o subdomínio `guiadohigienizador` em `autolimpezapro.com.br` com document root `public_html/guiadohigienizador`.
2. Ative SSL (Let’s Encrypt / AutoSSL).
3. Gerenciador de Arquivos → **mostrar arquivos ocultos** (senão o `.htaccess` some).
4. Extraia `cpanel.zip` **dentro** de `public_html/guiadohigienizador` (não deixe uma subpasta `cpanel/`).
5. Confira no mesmo nível: `index.html`, `.htaccess`, `assets/`, `api/`.
6. Se já existia um `api/config.php` de instalação anterior, **não apague** ao atualizar o site — o zip não traz esse arquivo.

FTP: mesmo destino. Envie o **conteúdo** de `cpanel/`, incluindo `.htaccess` e a pasta `api/`.

### 6. Permissões

| Item | Sugestão |
| --- | --- |
| Pastas | `755` |
| Arquivos | `644` |
| `api/config.php` | `600` |
| PHP | 8.0 ou superior (seletor de versão no cPanel) |

A API precisa de `pdo_mysql`, `json`, `curl` (curl só para a IA) e `openssl`.

### 7. Testar

1. `https://guiadohigienizador.autolimpezapro.com.br/api/health`  
   Deve devolver JSON `{"ok":true,"db":true,...}`. `ia: false` até preencher a chave OpenAI.
2. Home, uma ficha (`/fichas/...`) e F5 nessa URL — o fallback SPA tem que manter a rota.
3. `/auth` → criar conta e entrar.
4. `/comunidade` → publicar um post.
5. `/ia` → só responde de verdade com `openai_api_key` em `config.php`. Sem a chave, o chat avisa que a IA não está configurada.

## O que funciona só com MySQL vs o que precisa da OpenAI

| Recurso | MySQL + `config.php` | + `openai_api_key` |
| --- | --- | --- |
| Guia, fichas, manchas, diluição, checklist, favoritos locais | Sim (SPA) | — |
| Cadastro / login / perfil / papéis | Sim | — |
| Comunidade (posts, curtidas, salvos, comentários, perguntas, grupos, seguir, denúncias, notificações, pontos) | Sim | — |
| Higienizador IA | Endpoint existe; responde 503 até ter chave | Sim (proxy Gemini e/ou OpenAI no PHP) |

Favoritos do guia técnico, checklist e histórico da IA no navegador continuam no `localStorage`.

## O que o build faz

- `CPANEL_BUILD=1` → TanStack Start em modo **SPA** + pré-render das rotas conhecidas.
- Copia `api/` (exceto `config.php`) para `cpanel/api/`.
- `.htaccess` envia `/api/*` ao PHP e o resto ao SPA.
- Sem Node, Laravel ou Supabase no servidor quando a API PHP está configurada.

## GitHub Actions (opcional)

O workflow `.github/workflows/cpanel.yml` gera `cpanel.zip` como artefato. **Não envia FTP**. Depois do unzip, ainda é preciso criar o MySQL e o `api/config.php` na HostGator (o zip não contém senhas).

## Não envie

`node_modules`, `src`, `package.json`, `.env`, `.output`, `dist`, `api/config.php`.

Não coloque este site na raiz de `autolimpezapro.com.br`.
