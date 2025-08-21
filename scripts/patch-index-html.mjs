import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve("dist/index.html");
let html = readFileSync(file, "utf8");

// Convert Expo's entry script to a module (required for import.meta)
html = html.replace(
  /<script\s+src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"\s+defer><\/script>/,
  '<script type="module" src="$1"></script>'
);
// Handle case without "defer"
html = html.replace(
  /<script\s+src="(\/_expo\/static\/js\/web\/entry-[^"]+\.js)"><\/script>/,
  '<script type="module" src="$1"></script>'
);

writeFileSync(file, html, "utf8");
console.log("✅ Patched dist/index.html to use type=\"module\" for Expo entry.");
