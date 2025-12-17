/**
 * CHEFSKILLS IMAGE AUDITOR 🔥 with SUPER PROGRESS BAR
 */

console.time("⏱️ Auditoría completa");

const fs = require("fs");
const path = require("path");
const https = require("https");
const cliProgress = require("cli-progress");

// -----------------------------
// CONFIG
// -----------------------------
const PROJECT = path.resolve(__dirname, "..");
const EXT_CODE = [".tsx", ".ts"];
const EXT_JSON = [".json"];

let report = {
  missingVersionFunction: [],
  rawImageUriUsage: [],
  jsonProblems: [],
  brokenImageUrls: [],
  urlsToCheck: []
};

// -----------------------------
// HELPERS
// -----------------------------

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (!full.includes("node_modules")) walk(full, filelist);
    } else {
      filelist.push(full);
    }
  }
  return filelist;
}

function checkURLExists(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300))
      .on("error", () => resolve(false));
  });
}

// -----------------------------
// ANALIZAR CÓDIGO
// -----------------------------

function analyzeCodeFile(file) {
  const content = fs.readFileSync(file, "utf8");

  if (content.includes("<Image") && !content.includes("getVersionedImageSync")) {
    report.missingVersionFunction.push(file);
  }

  const rawMatches = content.match(/source\s*=\s*{{\s*uri:/g);
  if (rawMatches) report.rawImageUriUsage.push(file);
}

// -----------------------------
// ANALIZAR JSON
// -----------------------------

function analyzeJsonFile(file) {
  try {
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    const text = JSON.stringify(json);
    const urlRegex = /https?:\/\/[^\s"]+/g;
    const urls = text.match(urlRegex) || [];

    urls.forEach((u) => {
      report.urlsToCheck.push(u); // almacenar para chequeo real

      if (!u.includes("cloudfront.net")) {
        report.jsonProblems.push({ file, problem: "URL sospechosa", url: u });
      }
      if (!u.startsWith("http")) {
        report.jsonProblems.push({ file, problem: "URL mal formada", url: u });
      }
    });
  } catch {
    report.jsonProblems.push({
      file,
      problem: "JSON corrupto",
      url: ""
    });
  }
}

// -----------------------------
// CHECK URLs WITH PROGRESS BAR
// -----------------------------

async function checkBrokenUrls() {
  const urls = [...new Set(report.urlsToCheck)];

  console.log("🔎 Verificando URLs reales, por favor espera...\n");

  const bar = new cliProgress.SingleBar(
    {
      format:
        "[{bar}] {percentage}% ({value}/{total}) | ETA: {eta_formatted} | OK: {ok} | FAIL: {fail}\nURL actual → {url}",
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true
    },
    cliProgress.Presets.shades_classic
  );

  let okCount = 0;
  let failCount = 0;

  bar.start(urls.length, 0, {
    ok: okCount,
    fail: failCount,
    url: ""
  });

  for (const url of urls) {
    bar.update(null, { url });

    const ok = await checkURLExists(url);
    if (ok) okCount++;
    else {
      failCount++;
      report.brokenImageUrls.push(url);
    }

    bar.update(bar.value + 1, { ok: okCount, fail: failCount });
  }

  bar.stop();
}

// -----------------------------
// GENERAR REPORTE HTML
// -----------------------------

function generateHTML() {
  const html = `
<html>
<head>
<meta charset="UTF-8">
<title>ChefSkills Image Audit Report</title>
<style>
  body { font-family: Arial; background: #111; color: #eee; padding: 20px; }
  h1 { color: #00e5ff; }
  h2 { color: #ffea00; margin-top: 40px; }
  .ok { color: #4caf50; }
  .bad { color: #ff5252; }
  .warn { color: #ffb300; }
  pre { background: #222; padding: 15px; border-radius: 8px; }
</style>
</head>
<body>
<h1>ChefSkills – Auditoría de Imágenes</h1>

<h2>Componentes sin versión</h2>
${
  report.missingVersionFunction.length
    ? report.missingVersionFunction.map(f => `<pre class='bad'>${f}</pre>`).join("")
    : "<p class='ok'>✔ Todo perfecto.</p>"
}

<h2>Uso directo de source={{ uri }}</h2>
${
  report.rawImageUriUsage.length
    ? report.rawImageUriUsage.map(f => `<pre class='warn'>${f}</pre>`).join("")
    : "<p class='ok'>✔ No hay problemas.</p>"
}

<h2>Problemas encontrados en JSON</h2>
${
  report.jsonProblems.length
    ? report.jsonProblems.map(o => `<pre class='bad'>${o.file} → ${o.problem} → ${o.url}</pre>`).join("")
    : "<p class='ok'>✔ JSON limpio.</p>"
}

<h2>URLs rotas (404)</h2>
${
  report.brokenImageUrls.length
    ? report.brokenImageUrls.map(u => `<pre class='bad'>${u}</pre>`).join("")
    : "<p class='ok'>✔ Todas las imágenes existen.</p>"
}

</body>
</html>
`;

  fs.writeFileSync("Image_Audit_Report.html", html, "utf8");
  console.log("📄 Reporte generado: Image_Audit_Report.html");
}

// -----------------------------
// RUN
// -----------------------------

(async () => {
  const files = walk(PROJECT);
  console.log("🚀 Analizando proyecto...");

  files.forEach(file => {
    const ext = path.extname(file);
    if (EXT_CODE.includes(ext)) analyzeCodeFile(file);
    if (EXT_JSON.includes(ext)) analyzeJsonFile(file);
  });

  await checkBrokenUrls();
  generateHTML();

  console.timeEnd("⏱️ Auditoría completa");
})();
