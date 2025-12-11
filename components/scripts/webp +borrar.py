import os
from PIL import Image

# Ruta base donde están las carpetas numeradas
RUTA = r"C:\Users\DarkCainDS\Pictures\ChefSkills\backup imagenes\Cocina"

# Extensiones válidas a convertir
EXT_VALIDAS = (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".gif", ".webp")

def generar_uid(numero):
    return f"R-C_{numero:06d}"  # R-C_000001 → R-C_000125

for carpeta in os.listdir(RUTA):
    if not carpeta.isdigit():
        continue

    carpeta_num = int(carpeta)
    uid = generar_uid(carpeta_num)

    ruta_carpeta = os.path.join(RUTA, carpeta)

    if not os.path.isdir(ruta_carpeta):
        continue

    print(f"\n📁 Carpeta {carpeta} → UID: {uid}")

    imagenes = [
        f for f in os.listdir(ruta_carpeta)
        if os.path.splitext(f)[1].lower() in EXT_VALIDAS
    ]

    imagenes.sort()

    for i, archivo in enumerate(imagenes, start=1):
        original = os.path.join(ruta_carpeta, archivo)

        nuevo_nombre = f"{uid}_{i}.webp"
        salida = os.path.join(ruta_carpeta, nuevo_nombre)

        print(f" → {archivo}  →  {nuevo_nombre}")

        try:
            img = Image.open(original).convert("RGB")
            img.save(salida, "webp", quality=85)
        except Exception as e:
            print(f"   ⚠ Error: {e}")
            continue

        # borrar original
        try:
            os.remove(original)
        except:
            pass

print("\n✔ LISTO: todo convertido, renombrado y limpio.")
