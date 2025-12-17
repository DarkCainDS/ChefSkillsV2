import AsyncStorage from "@react-native-async-storage/async-storage";

const MANIFEST_KEY = "CS_MANIFEST";
const BASE_URL = "https://d3rbsa8yi0571o.cloudfront.net/Json/";

// Función para obtener el manifest remoto desde AWS
export async function getRemoteManifest() {
  try {
    const response = await fetch(`${BASE_URL}manifest.json`);
    if (!response.ok) throw new Error('Failed to fetch manifest');
    return await response.json();
  } catch (error) {
    console.error("Error fetching remote manifest:", error);
    return null; // Si falla, devolvemos null
  }
}

// Función para obtener el manifest local desde AsyncStorage
export async function getLocalManifest() {
  const localManifest = await AsyncStorage.getItem(MANIFEST_KEY);
  return localManifest ? JSON.parse(localManifest) : null;
}

// Guardamos el manifest descargado en AsyncStorage
export async function saveLocalManifest(manifest: any) {
  await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
}

// Compara el manifest remoto con el local
export function diffManifest(remoteManifest: any, localManifest: any | null) {
  const plan: any = {
    priority1: [],
    priority2: [],
    priority3: [],
    unchanged: []
  };

  // Si no hay manifest local, descargamos todos los archivos
  if (!localManifest) {
    remoteManifest.files.forEach((file: any) => {
      plan[`priority${file.priority}`].push(file.file);
    });
    return plan;
  }

  // Comparamos el remote con el local
  remoteManifest.files.forEach((file: any) => {
    const localMeta = localManifest.files.find((meta: any) => meta.file === file.file);

    // Si el archivo no existe en local, lo marcamos para descargar
    if (!localMeta) {
      plan[`priority${file.priority}`].push(file.file);
    } else {
      // Si el ETag o la versión no coinciden, es un archivo actualizado
      if (localMeta.etag !== file.etag || localMeta.version !== file.version) {
        plan[`priority${file.priority}`].push(file.file);
      } else {
        plan.unchanged.push(file.file);
      }
    }
  });

  return plan;
}
