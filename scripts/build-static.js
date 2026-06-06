const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

const requiredFiles = ["index.html", "app.js", "styles.css"];

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(relativePath) {
  const source = path.join(root, relativePath);
  if (!fs.existsSync(source)) return;
  const target = path.join(dist, relativePath);
  fs.cpSync(source, target, { recursive: true });
}

function main() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
  requiredFiles.forEach(copyFile);
  copyDirectory("assets");

  const missing = requiredFiles
    .map((file) => path.join(dist, file))
    .filter((file) => !fs.existsSync(file));
  if (missing.length) {
    throw new Error(`Static build incomplete. Missing ${missing.map((file) => path.relative(root, file)).join(", ")}`);
  }

  console.log("Static build complete: dist/index.html, dist/app.js, dist/styles.css");
}

main();
