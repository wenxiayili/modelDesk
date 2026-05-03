const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const target = process.argv[2] === "dist" ? "dist" : "";
const baseDir = path.join(root, target);
const appDir = path.join(baseDir, "app");

const files = [
  path.join(baseDir, "app.js"),
  ...fs.readdirSync(appDir)
    .filter((name) => name.endsWith(".mjs"))
    .sort()
    .map((name) => path.join(appDir, name))
];

if (!target) {
  files.push(
    path.join(root, "scripts", "serve-static.js"),
    path.join(root, "scripts", "prepare-tauri-dist.js"),
    path.join(root, "scripts", "check-frontend.js")
  );
}

for (const file of files) {
  const relative = path.relative(root, file);
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit"
  });
  if (result.status !== 0) {
    console.error(`Syntax check failed: ${relative}`);
    process.exit(result.status || 1);
  }
}

console.log(`Checked ${files.length} frontend file(s)${target ? ` in ${target}` : ""}.`);
