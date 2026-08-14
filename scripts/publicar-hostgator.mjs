/**
 * Gera o pacote ÚNICO para publicar na HostGator (um zip, 3 passos).
 * Inclui api/config.php de teste (só neste zip local — nunca no git).
 *
 * Uso: npm run publicar
 */
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cpanelDir = join(root, "cpanel");
const configLocal = join(root, "api", "config.php");
const zipPronto = join(root, "PUBLICAR-HOSTGATOR.zip");
const pastaPronto = join(root, "PUBLICAR-HOSTGATOR");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!existsSync(join(cpanelDir, "index.html")) || !existsSync(join(cpanelDir, "api", "index.php"))) {
  console.log("Gerando cpanel/ primeiro…");
  run("npm", ["run", "build:cpanel"]);
}

if (!existsSync(configLocal)) {
  console.error("Falta api/config.php local (credenciais de teste).");
  console.error("Crie a partir de api/config.example.php e preencha o MySQL.");
  process.exit(1);
}

rmSync(pastaPronto, { recursive: true, force: true });
mkdirSync(pastaPronto, { recursive: true });

const packCopy = spawnSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    `Copy-Item -Path '${cpanelDir}\\*' -Destination '${pastaPronto}' -Recurse -Force`,
  ],
  { stdio: "inherit" },
);
if (packCopy.status !== 0) process.exit(1);

copyFileSync(configLocal, join(pastaPronto, "api", "config.php"));

writeFileSync(
  join(pastaPronto, "INSTALAR.txt"),
  [
    "═══════════════════════════════════════════════════════════",
    "  GUIA DO HIGIENIZADOR — PRONTO PARA PUBLICAR (HostGator)",
    "═══════════════════════════════════════════════════════════",
    "",
    "Site:  https://guiadohigienizador.autolimpezapro.com.br",
    "Pasta: public_html/guiadohigienizador",
    "(NÃO misture com a raiz da Auto Limpeza Pro.)",
    "",
    "Este zip JÁ traz api/config.php de TESTE (will3269_GUIA).",
    "Troque a senha depois no cPanel e no config.php.",
    "",
    "───────────────────────────────────────────────────────────",
    "PASSO 1 — Extrair",
    "───────────────────────────────────────────────────────────",
    "1. cPanel → Gerenciador de Arquivos → mostrar arquivos ocultos",
    "2. Abra public_html/guiadohigienizador",
    "3. Envie PUBLICAR-HOSTGATOR.zip e EXTRAIA DENTRO dessa pasta",
    "4. No mesmo nível devem existir: index.html, .htaccess, assets/, api/",
    "",
    "───────────────────────────────────────────────────────────",
    "PASSO 2 — Importar o banco (uma vez)",
    "───────────────────────────────────────────────────────────",
    "phpMyAdmin → banco will3269_GUIA → Importar → api/schema.sql",
    "",
    "───────────────────────────────────────────────────────────",
    "PASSO 3 — Testar",
    "───────────────────────────────────────────────────────────",
    "  https://guiadohigienizador.autolimpezapro.com.br/api/health",
    "  https://guiadohigienizador.autolimpezapro.com.br/",
    "  /auth  /comunidade  /fichas  /ia",
    "",
    "IA: gemini_api_key (Google AI Studio) e/ou openai_api_key em api/config.php.
ia_provider=auto usa Gemini se houver chave.",
    "Sem Node no servidor. Só Apache + PHP 8 + MySQL.",
    "",
  ].join("\n"),
  "utf8",
);

if (existsSync(zipPronto)) rmSync(zipPronto);
const zip = spawnSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    "Add-Type -AssemblyName System.IO.Compression.FileSystem; " +
      `[System.IO.Compression.ZipFile]::CreateFromDirectory('${pastaPronto}', '${zipPronto}')`,
  ],
  { stdio: "inherit" },
);

if (zip.status !== 0 || !existsSync(zipPronto)) {
  console.error("Falha ao criar PUBLICAR-HOSTGATOR.zip — use a pasta PUBLICAR-HOSTGATOR/");
  process.exit(1);
}

console.log("");
console.log("PRONTO PARA PUBLICAR:");
console.log(`  ${zipPronto}`);
console.log(`  ${pastaPronto}`);
console.log("");
console.log("Na HostGator: extrair em public_html/guiadohigienizador → importar api/schema.sql → /api/health");
