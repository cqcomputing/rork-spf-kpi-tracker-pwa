import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve("dist/index.html");
let html = readFileSync(file, "utf8");

// 1) Ensure ES module (required for import.meta)
html = html.replace(
  /<script\s+src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"\s+defer><\/script>/,
  '<script type="module" src="$1"></script>'
);
html = html.replace(
  /<script\s+src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"><\/script>/,
  '<script type="module" src="$1"></script>'
);

// 2) Fix manifest link (manifest.json -> manifest.webmanifest)
html = html.replace(
  /<link\s+rel="manifest"\s+href="\/manifest\.json"\s*\/?>/,
  '<link rel="manifest" href="/manifest.webmanifest" />'
);

writeFileSync(file, html, "utf8");
console.log('✅ Patched dist/index.html: module script + manifest link');
