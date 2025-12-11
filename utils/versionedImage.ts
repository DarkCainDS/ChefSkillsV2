// utils/versionedImage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

let cachedVersion: string | null = null;

/**
 * Carga la versión desde AsyncStorage solo una vez.
 */
async function loadVersion() {
  if (cachedVersion !== null) return cachedVersion;
  const v = await AsyncStorage.getItem("CS_VERSION");
  cachedVersion = v || "0";
  return cachedVersion;
}

/**
 * Retorna una URL con versión para romper la caché.
 */
export async function getVersionedImage(url?: string | null) {
  const version = await loadVersion();

  if (!url) {
    return { uri: `https://d3rbsa8yi0571o.cloudfront.net/placeholder.webp?v=${version}` };
  }

  return { uri: `${url}?v=${version}` };
}

/**
 * Versión síncrona (para listas rápidas)
 */
export function getVersionedImageSync(url?: string | null) {
  const version = cachedVersion || "0";

  if (!url) {
    return { uri: `https://d3rbsa8yi0571o.cloudfront.net/placeholder.webp?v=${version}` };
  }

  return { uri: `${url}?v=${version}` };
}
