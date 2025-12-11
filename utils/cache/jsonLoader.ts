import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://d3rbsa8yi0571o.cloudfront.net/Json/";

const mapCategory: Record<string, string> = {
  "Cocina 🔪": "Main_Dish.json",
  "Pastelería 🍰": "Pastry_Recipe.json",
  "Panadería 🥖": "Panaderia.json",
  "Sopas 🍲": "Soup.json",
  "Salsas 🍅": "Salsa.json",
  "Ensaladas 🥗": "Salad.json",
  "Tragos 🍸": "Drinks.json",
  "Vegan 🥑": "Vegan.json",
  "Tecnicas 🍳": "Techniques.json",
};

export async function loadJsonCategory(category: string) {
  const file = mapCategory[category];
  const url = BASE_URL + file;
  const key = "CACHE_JSON_" + file;

  // 1) Intentar desde cache
  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.log("❌ JSON corrupto en cache, bajando de nuevo:", file);
    }
  }

  // 2) Descargar desde AWS
  try {
    const r = await fetch(url);
    const json = await r.json();
    await AsyncStorage.setItem(key, JSON.stringify(json));
    return json;
  } catch (e) {
    console.log("❌ Error descargando JSON", url, e);
    return null;
  }
}
