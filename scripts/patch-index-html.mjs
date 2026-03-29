// scripts/patch-index-html.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve("dist/index.html");
let html = readFileSync(file, "utf8");

// Find the Expo entry script and make it a module
// Looks like: <script src="/_expo/static/js/web/entry-...js" defer></script>
html = html.replace(
  /<script\s+src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"\s+defer><\/script>/,
  '<script type="module" src="$1"></script>'
);

// (Optional) also handle a case where defer may not be present
html = html.replace(
  /<script\s+src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"><\/script>/,
  '<script type="module" src="$1"></script>'
);

writeFileSync(file, html, "utf8");
console.log("✅ Patched dist/index.html to use type=\"module\" for Expo entry.");