import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

const files = ["index.html", "app.js", "styles.css"];
const directories = ["assets", "lib"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of files) {
  await cp(join(root, file), join(dist, file));
}

for (const directory of directories) {
  await cp(join(root, directory), join(dist, directory), {
    recursive: true,
    filter: (source) => !source.includes("apiRuntime.js") && !source.includes("apiCore.js")
  });
}

console.log("Built static ClearGate AI assets into dist/");
