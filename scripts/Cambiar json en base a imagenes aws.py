import os
import json

# === CONFIGURACIÓN === #

# Carpeta donde están las subcarpetas 1,2,3...126
IMAGES_ROOT = r"C:\Users\DarkCainDS\Pictures\ChefSkills\Webp Imagenes\Cocina"

# Ruta del JSON a modificar
JSON_PATH = r"C:\Dev\chefskills\assets\Json\Main_Dish.json"

# Dominio CloudFront
BASE_URL = "https://d3rbsa8yi0571o.cloudfront.net/Cocina"

# ======================== #

def update_json():
    # Leer JSON existente
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    for recipe in data["recipes"]:
        recipe_id = recipe["id"]
        uid = recipe["uid"]  # Ej: "R-C_000001"

        # Carpeta de imágenes para este id
        folder = os.path.join(IMAGES_ROOT, str(recipe_id))

        if not os.path.isdir(folder):
            print(f"⚠️  No existe carpeta para ID {recipe_id}: {folder}")
            continue

        # Archivos webp válidos
        images = [
            f for f in os.listdir(folder)
            if f.lower().endswith(".webp")
        ]

        if not images:
            print(f"⚠️  No hay imágenes en {folder}")
            continue

        # Ordenar por nombre
        images.sort()

        # Generar URLs CloudFront
        urls = [
            f"{BASE_URL}/{recipe_id}/{uid}_{i+1}.webp"
            for i in range(len(images))
        ]

        # Insertar en el JSON
        recipe["imageUrl"] = urls[0]           # primera imagen
        recipe["images"] = urls                # todas las imágenes

        print(f"✔️  ID {recipe_id} → {len(images)} imágenes asignadas")

    # Guardar JSON modificado
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n🎉 JSON ACTUALIZADO CON ÉXITO 🎉")


if __name__ == "__main__":
    update_json()
