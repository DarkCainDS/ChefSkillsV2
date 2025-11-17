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

export function getSafeImage(url?: string) {
  if (!url || typeof url !== "string") {
    return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  }

  // Si es URL remota válida
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return { uri: url };
  }

  // Si son imágenes locales incorrectas → placeholder
  return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
}
