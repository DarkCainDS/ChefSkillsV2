import AsyncStorage from "@react-native-async-storage/async-storage";

// ===============================================================
// 🔧 Helpers locales (NO importar del cleaner)
// ===============================================================
const CACHE_PREFIX = "CACHE_JSON_";
const META_PREFIX = "META_";

const cacheKey = (name: string) => `${CACHE_PREFIX}${name}`;
const metaKey = (name: string) => `${META_PREFIX}${name}`;

const BASE_URL = "https://d3rbsa8yi0571o.cloudfront.net/Json/";

// ===============================================================
// 📥 Descargar un archivo individual
// ===============================================================
async function downloadFile(fileName: string) {
  try {
    const url = `${BASE_URL}${fileName}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    // 🧠 Guardar JSON
    await AsyncStorage.setItem(
      cacheKey(fileName),
      JSON.stringify(json)
    );

    // 🧠 Guardar metadata
    await AsyncStorage.setItem(
      metaKey(fileName),
      JSON.stringify({
        etag: response.headers.get("etag") ?? "",
        version: json.version ?? 1,
        updatedAt: Date.now(),
      })
    );

    console.log(`📥 Descargado → ${fileName}`);
  } catch (error) {
    console.error(`❌ Error downloading file → ${fileName}`, error);
  }
}

// ===============================================================
// ⚡ Descarga por prioridad
// ===============================================================
export async function downloadByPriority(
  plan: {
    priority1?: string[];
    priority2?: string[];
    priority3?: string[];
  },
  { blocking = true }: { blocking: boolean }
) {
  for (const level of [1, 2, 3] as const) {
    const files = plan[`priority${level}`];
    if (!files || files.length === 0) continue;

    for (const file of files) {
      if (blocking) {
        await downloadFile(file);
      } else {
        downloadFile(file); // fire & forget
      }
    }
  }
}
