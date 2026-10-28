import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

/**
 * Presupuesto de tamaño (KB comprimidos con gzip) por parte del sitio.
 * Si una parte crece más de lo permitido, el pipeline falla y hay que justificar
 * el aumento o subir el límite a propósito. Valores con ~20 % de margen sobre octubre 2026.
 */
const BUDGETS_KB: Record<string, number> = {
  "index.js": 20, // código de la app
  "contenido.js": 30, // temas de todas las materias
  "grafo.js": 85, // React Flow + dagre
  "react.js": 80, // React, React DOM y Zustand
  css: 14,
  total: 230,
};

const ASSETS = join("dist", "assets");

function chunkName(file: string): string {
  // "grafo-BnuhLJ6X.js" -> "grafo.js"; todos los .css cuentan juntos.
  return file.endsWith(".css") ? "css" : file.replace(/-[\w-]+\.js$/, ".js");
}

let files: string[];
try {
  files = readdirSync(ASSETS);
} catch {
  console.error(`No existe ${ASSETS}. Ejecuta "npm run build" antes.`);
  process.exit(1);
}

const sizes: Record<string, number> = {};
for (const file of files.filter((name) => /\.(js|css)$/.test(name))) {
  const kb = gzipSync(readFileSync(join(ASSETS, file))).length / 1024;
  const name = chunkName(file);
  sizes[name] = (sizes[name] ?? 0) + kb;
  sizes.total = (sizes.total ?? 0) + kb;
}

let failed = false;
console.log("\nTamaño del sitio (gzip)\n");
for (const name of Object.keys(sizes).sort((a, b) => (a === "total" ? 1 : b === "total" ? -1 : a.localeCompare(b)))) {
  const budget = BUDGETS_KB[name];
  const size = sizes[name];
  const over = budget !== undefined && size > budget;
  failed ||= over;
  const status = budget === undefined ? "sin presupuesto" : over ? "EXCEDE" : "ok";
  console.log(`  ${name.padEnd(14)} ${size.toFixed(1).padStart(7)} KB  / ${budget ?? "-"} KB  ${status}`);
}

for (const name of Object.keys(sizes)) {
  if (BUDGETS_KB[name] === undefined) {
    console.warn(`\nAviso: "${name}" es una parte nueva sin presupuesto; agrégala en scripts/check-size.ts.`);
  }
}

if (failed) {
  console.error("\nEl sitio excede su presupuesto de tamaño.\n");
  process.exitCode = 1;
} else {
  console.log("\nDentro del presupuesto.\n");
}
