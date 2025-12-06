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

// 🔥 FUNCIÓN MEJORADA
export function getSafeImage(
  mainUrl?: string,
  imagesArray?: string[]
) {
  const placeholders = placeholderImages;
  const randomPlaceholder =
    placeholders[Math.floor(Math.random() * placeholders.length)];

  // --- PRIORIDAD 1: imageUrl principal ---
  if (mainUrl && typeof mainUrl === "string") {
    if (mainUrl.startsWith("http://") || mainUrl.startsWith("https://")) {
      return { uri: encodeURI(mainUrl) }; // encode fix
    }
  }

  // --- PRIORIDAD 2: primera imagen del array ---
  if (imagesArray && Array.isArray(imagesArray) && imagesArray.length > 0) {
    const url = imagesArray[0];
    if (url && typeof url === "string") {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return { uri: encodeURI(url) };
      }
    }
  }

  // --- FALLBACK: placeholder aleatorio ---
  return randomPlaceholder;
}
