import AsyncStorage from "@react-native-async-storage/async-storage";

// ===============================================================
// 🔧 Helpers
// ===============================================================
const CACHE_PREFIX = "CACHE_JSON_";
const META_PREFIX = "META_";
const MANIFEST_KEY = "CS_MANIFEST";

const cacheKey = (name: string) => `${CACHE_PREFIX}${name}`;
const metaKey = (name: string) => `${META_PREFIX}${name}`;

// ===============================================================
// 🧠 Tipos
// ===============================================================
type ManifestFile = {
  file: string;
  etag: string;
  version: number;
};

type Manifest = {
  files: ManifestFile[];
};

// ===============================================================
// 🧹 1) LIMPIAR ARCHIVOS HUÉRFANOS
// ===============================================================
export async function cleanOrphanFiles(manifest: Manifest) {
  try {
    const validFiles = manifest.files.map(f => f.file);

    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));

    for (const key of cacheKeys) {
      const fileName = key.replace(CACHE_PREFIX, "");

      if (!validFiles.includes(fileName)) {
        console.log(`🧹 Huérfano detectado → ${fileName}`);

        await AsyncStorage.multiRemove([
          cacheKey(fileName),
          metaKey(fileName),
        ]);
      }
    }
  } catch (e) {
    console.log("❌ Error limpiando archivos huérfanos:", e);
  }
}

// ===============================================================
// 🔄 2) LIMPIAR CACHE INVÁLIDO (etag / versión)
// ===============================================================
export async function cleanInvalidCache(manifest: Manifest) {
  try {
    for (const file of manifest.files) {
      const metaRaw = await AsyncStorage.getItem(metaKey(file.file));

      if (!metaRaw) continue;

      let meta;
      try {
        meta = JSON.parse(metaRaw);
      } catch {
        console.log(`🧨 Metadata corrupta → ${file.file}`);
        await AsyncStorage.multiRemove([
          cacheKey(file.file),
          metaKey(file.file),
        ]);
        continue;
      }

      const etagMismatch = meta.etag !== file.etag;
      const versionMismatch = meta.version !== file.version;

      if (etagMismatch || versionMismatch) {
        console.log(`🔄 Cache inválido → ${file.file}`);

        await AsyncStorage.multiRemove([
          cacheKey(file.file),
          metaKey(file.file),
        ]);
      }
    }
  } catch (e) {
    console.log("❌ Error limpiando cache inválido:", e);
  }
}

// ===============================================================
// 🧠 3) ORQUESTADOR PRINCIPAL
// ===============================================================
export async function runContentCleanup() {
  try {
    const manifestRaw = await AsyncStorage.getItem(MANIFEST_KEY);

    if (!manifestRaw) {
      console.log("ℹ️ No hay manifest local, limpieza omitida.");
      return;
    }

    const manifest: Manifest = JSON.parse(manifestRaw);

    console.log("🧹 Iniciando limpieza de contenido...");

    await cleanOrphanFiles(manifest);
    await cleanInvalidCache(manifest);

    console.log("✅ Limpieza de contenido completada.");
  } catch (e) {
    console.log("❌ Error en runContentCleanup:", e);
  }
}
