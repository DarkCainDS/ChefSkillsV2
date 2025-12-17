// scripts/applyVersionedImage.js
// 🔥 Automatiza reemplazo de imágenes para usar getVersionedImageSync()
console.time("⏱️ Auditoría completa");

const fs = require("fs");
const path = require("path");

// raíz del proyecto
const projectDir = path.resolve(__dirname, "..");

// Extensiones a procesar
const EXT = [".tsx", ".ts"];

// Expresión que detecta imageUrl clásicos
const REGEX_IMAGE = /source\s*=\s*{{?\s*uri:\s*([A-Za-z0-9_."'/\-]+)/g;

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullname = path.join(dir, file);
    const stat = fs.statSync(fullname);

    if (stat.isDirectory()) {
      if (!fullname.includes("node_modules")) walk(fullname, filelist);
    } else {
      if (EXT.includes(path.extname(fullname))) filelist.push(fullname);
    }
  });

  return filelist;
}

function relativeImport(fullPath) {
  const depth =
    fullPath.split(path.sep).length - projectDir.split(path.sep).length - 1;

  const prefix = "../".repeat(depth);

  return `import { getVersionedImageSync } from "${prefix}utils/versionedImage";`;
}

function processFile(file) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  if (!content.includes("<Image")) return null;

  // Insertar import si falta
  if (!content.includes("getVersionedImageSync")) {
    const imp = relativeImport(file);
    content = imp + "\n" + content;
  }

  // Reemplazar source={{ uri: ... }}
  content = content.replace(REGEX_IMAGE, (match, p1) => {
    return `source={getVersionedImageSync(${p1})}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    return file;
  }

  return null;
}

// ------------------------------------------------------------
// RUN
// ------------------------------------------------------------
console.log("🚀 Analizando y reemplazando imágenes...");
const files = walk(projectDir);

let changed = [];

files.forEach((file) => {
  const result = processFile(file);
  if (result) changed.push(result);
});

console.log("✨ Reemplazo completado.");
console.log("📂 Archivos modificados:");
changed.forEach((file) => console.log("🔧", file));

if (changed.length === 0) {
  console.log("✔ No se encontraron imágenes para convertir.");
}

console.timeEnd("⏱️ Auditoría completa");
