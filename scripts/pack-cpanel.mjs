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

const files = countFiles(outDir);
writeFileSync(
  join(outDir, "INSTALAR.txt"),
  `Pacote gerado em ${new Date().toISOString()}\nArquivos: ${files}\nEnvie o conteúdo desta pasta para public_html.\n`,
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
