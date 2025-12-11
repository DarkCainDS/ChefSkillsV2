import os
from PIL import Image

# Ruta raíz donde están las carpetas 1,2,3,...
RUTA = r"C:\Users\DarkCainDS\Imágenes\ChefSkills\Comida\Cocina"

# Extensiones válidas a convertir
EXT_VALIDAS = (".jpg", ".jpeg", ".png", ".bmp", ".tiff")

for carpeta in os.listdir(RUTA):
    ruta_carpeta = os.path.join(RUTA, carpeta)

    # Saltar lo que NO sea carpeta o lo que no sea número
    if not os.path.isdir(ruta_carpeta):
        continue
    if not carpeta.isdigit():
        continue

    print(f"Procesando carpeta {carpeta}...")

    # Revisar archivos dentro de cada carpeta
    for archivo in os.listdir(ruta_carpeta):
        nombre, extension = os.path.splitext(archivo)

        if extension.lower() not in EXT_VALIDAS:
            continue

        ruta_original = os.path.join(ruta_carpeta, archivo)
        ruta_salida = os.path.join(ruta_carpeta, f"{nombre}.webp")

        try:
            img = Image.open(ruta_original).convert("RGB")
            img.save(ruta_salida, "webp", quality=80)
            print(f" → Convertido: {archivo} → {nombre}.webp")

        except Exception as e:
            print(f"Error con {archivo}: {e}")

print("\n✔ Conversión completa! Todas las imágenes están en WEBP.")
