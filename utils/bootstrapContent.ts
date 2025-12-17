// utils/bootstrapContent.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

import { runContentCleanup } from "./contentCleaner";
import { downloadByPriority } from "./contentDownloader";
import {
  getRemoteManifest,
  diffManifest,
  saveLocalManifest,
} from "./contentManifest";

export async function bootstrapContent(onStatus?: (msg: string) => void) {
  try {
    onStatus?.("Revisando actualizaciones...");

    const remoteManifest = await getRemoteManifest();
    let plan = null;

    if (remoteManifest) {
      const localRaw = await AsyncStorage.getItem("CS_MANIFEST");
      const localManifest = localRaw ? JSON.parse(localRaw) : null;

      plan = diffManifest(remoteManifest, localManifest);

      // Guardar manifest como fuente de verdad
      await saveLocalManifest(remoteManifest);

      // 🔥 SOLO limpiar si hay cambios reales
      if (plan) {
        onStatus?.("Limpiando contenido...");
        await runContentCleanup();
      }
    }

    if (plan) {
      onStatus?.("Cargando datos principales...");
      await downloadByPriority(plan, { blocking: true });

      onStatus?.("Optimizando contenido...");
      downloadByPriority(plan, { blocking: false });
    }

    // ✅ flags finales (UNA sola vez)
    await AsyncStorage.setItem("CS_FIRST_BOOT_DONE", "1");
    await AsyncStorage.setItem("CS_LAST_REFRESH", String(Date.now()));
    await AsyncStorage.removeItem("CS_FORCE_FULL_REFRESH");

    onStatus?.("Contenido listo ✔");
    return true;
  } catch (e) {
    console.log("❌ Error en bootstrapContent:", e);
    onStatus?.("Error cargando contenido");
    return false;
  }
}
