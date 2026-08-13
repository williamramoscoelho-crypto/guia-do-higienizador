import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const env = { ...process.env, CPANEL_BUILD: "1" };

const build = spawnSync("npx", ["vite", "build"], {
  cwd: join(root, ".."),
  env,
  stdio: "inherit",
  shell: true,
});

if (build.status !== 0) process.exit(build.status ?? 1);

const pack = spawnSync("node", [join(root, "pack-cpanel.mjs")], {
  cwd: join(root, ".."),
  env,
  stdio: "inherit",
  shell: true,
});

process.exit(pack.status ?? 1);
