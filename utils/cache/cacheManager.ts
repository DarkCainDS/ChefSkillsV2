import AsyncStorage from "@react-native-async-storage/async-storage";

// ===============================================================
// 🔥 CONFIGURACIONES BASE
// ===============================================================
const REFRESH_INTERVAL = 14 * 24 * 60 * 60 * 1000; // 14 días
const KEY_LAST = "CS_LAST_REFRESH";
const KEY_VERSION = "CS_VERSION";

// Nombre correcto de los archivos JSON en AWS
const FILES = [
  "Main_Dish.json",
  "Pastry_Recipe.json",
  "Panaderia.json",
  "Soup.json",
  "Salsa.json",
  "Salad.json",
  "Drinks.json",
  "Vegan.json",
  "Techniques.json",
];

const BASE_URL = "https://d3rbsa8yi0571o.cloudfront.net/Json/";


// ===============================================================
// 🧠 1) WATCHDOG — decide si hay que refrescar o no
// ===============================================================
export async function watchdogCheck() {
  try {
    const last = Number(await AsyncStorage.getItem(KEY_LAST) || 0);
    const now = Date.now();

    // 👉 Primer uso
    if (!last) {
      console.log("⚠️ Primer uso → refresco obligatorio.");
      const v = await bumpVersion();
      return { action: "RESET", newVersion: v };
    }

    // 👉 Pasaron 14 días
    if (now - last >= REFRESH_INTERVAL) {
      console.log("⏳ Intervalo de 14 días superado → refresco obligatorio.");
      const v = await bumpVersion();
      return { action: "RESET", newVersion: v };
    }

    // 👉 Todo OK
    return { action: "NONE" };
  } catch (e) {
    console.log("❌ Error en watchdogCheck:", e);

    // Por seguridad forzamos refresco
    const v = await bumpVersion();
    return { action: "RESET", newVersion: v };
  }
}


// ===============================================================
// 🧹 2) BORRAR JSON DEL CACHE
// ===============================================================
export async function clearAllJsonCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const targets = keys.filter(k => k.startsWith("CACHE_JSON_"));

    if (targets.length > 0) {
      await AsyncStorage.multiRemove(targets);
      console.log("🗑️ JSON eliminados:", targets);
    } else {
      console.log("ℹ️ No hay JSON para borrar.");
    }

    return true;
  } catch (e) {
    console.log("❌ Error al limpiar JSON:", e);
    return false;
  }
}


// ===============================================================
// 📥 3) DESCARGAR TODOS LOS JSON
// ===============================================================
export async function downloadAllJson() {
  console.log("📡 Descargando JSON reales desde AWS...");

  for (const file of FILES) {
    const url = BASE_URL + file;
    const key = "CACHE_JSON_" + file;

    try {
      const res = await fetch(url);
      const json = await res.json();

      await AsyncStorage.setItem(key, JSON.stringify(json));

      console.log("📥 Descargado OK →", file);
    } catch (e) {
      console.log("❌ Error descargando →", file, e);
    }
  }

  // Guardamos timestamp del refresh
  await AsyncStorage.setItem(KEY_LAST, String(Date.now()));
}


// ===============================================================
// 📦 4) OBTENER JSON SEGÚN NOMBRE
// ===============================================================
export async function getJson(name: string) {
  const key = "CACHE_JSON_" + name;
  const data = await AsyncStorage.getItem(key);

  if (data) return JSON.parse(data);

  // Si NO existe → descargamos SOLO ese archivo
  console.log(`⚠️ ${name} no existe en cache → descargando...`);

  try {
    const url = BASE_URL + name;
    const res = await fetch(url);
    const json = await res.json();

    await AsyncStorage.setItem(key, JSON.stringify(json));

    return json;
  } catch (e) {
    console.log("❌ Error obteniendo JSON puntual:", name, e);
    return null;
  }
}


// ===============================================================
// 🔍 5) ¿Están todos los JSON listos?
// ===============================================================
export async function isJsonReady() {
  const keys = await AsyncStorage.getAllKeys();
  return FILES.every(f => keys.includes("CACHE_JSON_" + f));
}


// ===============================================================
// 🧨 6) FORZAR REFRESH MANUAL
// ===============================================================
export async function forceFullRefresh() {
  console.log("🛑 Refresco manual forzado.");

  await clearAllJsonCache();

  const version = await bumpVersion();

  await AsyncStorage.setItem("CS_FORCE_FULL_REFRESH", "1");

  return version;
}


// ===============================================================
// ♻ 7) CONTROL DE VERSIONES (para invalidar imágenes)
// ===============================================================
export async function bumpVersion() {
  const v = await AsyncStorage.getItem(KEY_VERSION);
  const newV = v ? Number(v) + 1 : 1;

  await AsyncStorage.setItem(KEY_VERSION, String(newV));

  return newV;
}

export async function getVersion() {
  const v = await AsyncStorage.getItem(KEY_VERSION);
  return v ? Number(v) : 0;
}
