import { ImageSource } from "expo-image";
import { getVersionedImageSync } from "./versionedImage";

// placeholders locales
export const PLACEHOLDERS: ImageSource[] = [
  require("../assets/404/placeholder1.webp"),
  require("../assets/404/placeholder2.webp"),
  require("../assets/404/placeholder3.webp"),
  require("../assets/404/placeholder4.webp"),
  require("../assets/404/placeholder5.webp"),
  require("../assets/404/placeholder6.webp"),
  require("../assets/404/placeholder7.webp"),
  require("../assets/404/placeholder8.webp"),
  require("../assets/404/placeholder9.webp"),
  require("../assets/404/placeholder10.webp"),
  require("../assets/404/placeholder11.webp"),
  require("../assets/404/placeholder12.webp"),
  require("../assets/404/placeholder13.webp"),
  require("../assets/404/placeholder14.webp"),
  require("../assets/404/placeholder15.webp"),
  require("../assets/404/placeholder16.webp"),
];

// ✅ FUNCIÓN FINAL
export function getSafeVersionedImage(
  mainUrl?: string,
  imagesArray?: string[]
): ImageSource[] {
  const sources: ImageSource[] = [];

  // prioridad 1: imagen principal
  if (mainUrl) {
    sources.push(getVersionedImageSync(mainUrl));
  }

  // prioridad 2: primera del array
  if (imagesArray?.length) {
    sources.push(getVersionedImageSync(imagesArray[0]));
  }

  // fallback local
  sources.push(...PLACEHOLDERS);

  return sources;
}
