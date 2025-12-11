// utils/getImageSource.ts

export const placeholderImages = [
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

export function getSafeImage(mainUrl?: string, imagesArray?: string[]) {
  const fallbacks = placeholderImages;

  const urls: ImageSource[] = [];

  // Prioridad 1: imagen principal
  if (mainUrl && typeof mainUrl === "string") {
    urls.push({ uri: mainUrl });
  }

  // Prioridad 2: primera imagen del array (si existe)
  if (imagesArray && imagesArray.length > 0) {
    urls.push({ uri: imagesArray[0] });
  }

  // Fallbacks
  urls.push(...fallbacks);

  return urls;
}