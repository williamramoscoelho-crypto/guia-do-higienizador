import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL(".", import.meta.url)));
const publicCandidates = [
  join(root, "dist", "client"),
  join(root, "dist", "public"),
  join(root, ".output", "public"),
];
const publicDir = publicCandidates.find((dir) => existsSync(dir));
const deployDir = join(root, "deploy", "cpanel");
const outDir = join(root, "cpanel");
const zipPath = join(root, "cpanel.zip");
const SITE_ORIGIN = "https://guiadohigienizador.autolimpezapro.com.br";
const SKIP_SITEMAP = new Set(["favoritos"]);

if (!publicDir) {
  console.error("Nenhuma pasta de build estático encontrada (dist/client, dist/public ou .output/public).");
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(publicDir, outDir, { recursive: true });

for (const name of [".htaccess", "index.php", "LEIA-ME.txt", "HOSTGATOR.txt"]) {
  const from = join(deployDir, name);
  if (!existsSync(from)) {
    console.error(`Arquivo de deploy ausente: ${name}`);
    process.exit(1);
  }
  copyFileSync(from, join(outDir, name));
}

if (!existsSync(join(outDir, "index.html")) && existsSync(join(outDir, "_shell.html"))) {
  copyFileSync(join(outDir, "_shell.html"), join(outDir, "index.html"));
}

writeSitemap(outDir);

const files = countFiles(outDir);
writeFileSync(
  join(outDir, "INSTALAR.txt"),
  [
    "Guia do Higienizador — pacote cPanel",
    `Gerado em ${new Date().toISOString()}`,
    `Arquivos: ${files}`,
    "",
    "Domínio: https://guiadohigienizador.autolimpezapro.com.br",
    "Pasta no servidor: public_html/guiadohigienizador",
    "(não envie para a raiz de autolimpezapro.com.br)",
    "",
    "Leia HOSTGATOR.txt neste zip.",
    "",
  ].join("\n"),
);

if (existsSync(zipPath)) rmSync(zipPath);
const zip = spawnSync(
  "powershell",
  ["-NoProfile", "-Command", `Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipPath}' -Force`],
  { stdio: "inherit" },
);
if (zip.status !== 0) {
  console.warn("Não foi possível criar cpanel.zip automaticamente. A pasta cpanel/ já está pronta.");
}

console.log(`Pacote cPanel pronto: ${outDir}`);
if (existsSync(zipPath)) console.log(`Zip: ${zipPath}`);

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    n += statSync(full).isDirectory() ? countFiles(full) : 1;
  }
  return n;
}

function htmlPaths(dir, prefix = "") {
  const urls = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "assets" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      urls.push(...htmlPaths(full, `${prefix}/${entry}`));
      continue;
    }
    if (entry !== "index.html") continue;
    const slug = prefix.replace(/^\//, "").split("/")[0];
    if (slug && SKIP_SITEMAP.has(slug)) continue;
    urls.push(prefix === "" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${prefix}/`);
  }
  return urls;
}

function writeSitemap(dir) {
  const urls = [...new Set(htmlPaths(dir))].sort();
  const body = urls
    .map(
      (loc) =>
        `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`,
    )
    .join("\n");
  writeFileSync(
    join(dir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  );
}
