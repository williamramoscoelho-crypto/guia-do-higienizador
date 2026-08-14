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
const DEPLOY_FILES = [".htaccess", "index.php", "LEIA-ME.txt", "HOSTGATOR.txt", "INSTALAR.txt"];

if (!publicDir) {
  console.error("Nenhuma pasta de build estático encontrada (dist/client, dist/public ou .output/public).");
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(publicDir, outDir, { recursive: true });

for (const name of DEPLOY_FILES) {
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

const apiSrc = join(root, "api");
if (!existsSync(join(apiSrc, "index.php")) || !existsSync(join(apiSrc, "schema.sql"))) {
  console.error("Pasta api/ incompleta (index.php / schema.sql).");
  process.exit(1);
}
cpSync(apiSrc, join(outDir, "api"), {
  recursive: true,
  filter: (src) => {
    const base = src.replace(/\\/g, "/").split("/").pop();
    return base !== "config.php";
  },
});

writeSitemap(outDir);
assertDropIn(outDir);

if (existsSync(zipPath)) rmSync(zipPath);
if (!createZip(outDir, zipPath)) {
  console.warn("Não foi possível criar cpanel.zip automaticamente. A pasta cpanel/ já está pronta.");
}

console.log(`Pacote cPanel pronto: ${outDir}`);
if (existsSync(zipPath)) console.log(`Zip: ${zipPath}`);
console.log("Envie o conteúdo de cpanel/ para public_html/guiadohigienizador — o servidor não precisa de Node.");
console.log("Depois: MySQL + api/schema.sql + api/config.php (veja HOSTGATOR.txt).");

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

function assertDropIn(dir) {
  const required = ["index.html", ".htaccess", "assets", "api/index.php", "api/schema.sql", "api/config.example.php"];
  const missing = required.filter((name) => !existsSync(join(dir, name)));
  if (missing.length) {
    console.error(`Pacote incompleto (faltando: ${missing.join(", ")}).`);
    process.exit(1);
  }
  if (existsSync(join(dir, "api", "config.php"))) {
    console.error("Não envie api/config.php no zip (segredo).");
    process.exit(1);
  }
}

function posixPath(p) {
  return p.replace(/\\/g, "/");
}

function createZip(fromDir, destZip) {
  if (process.platform === "win32") {
    const ps = [
      "Add-Type -AssemblyName System.IO.Compression.FileSystem",
      `[System.IO.Compression.ZipFile]::CreateFromDirectory('${fromDir}', '${destZip}')`,
    ].join("; ");
    const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], { stdio: "inherit" });
    return r.status === 0 && existsSync(destZip);
  }

  const base = posixPath(destZip.replace(/\.zip$/i, ""));
  const src = posixPath(fromDir);
  const py = `import shutil; shutil.make_archive(r"${base}", "zip", r"${src}")`;
  const pyRun = spawnSync("python3", ["-c", py], { stdio: "inherit" });
  if (pyRun.status === 0 && existsSync(destZip)) return true;

  const r = spawnSync("zip", ["-r", "-q", destZip, "."], { cwd: fromDir, stdio: "inherit" });
  return r.status === 0 && existsSync(destZip);
}
