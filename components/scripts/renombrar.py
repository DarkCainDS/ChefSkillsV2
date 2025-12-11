import os

ruta = r"C:\Users\DarkCainDS\Pictures\ChefSkills\Comida\Cocina"

carpetas = [f for f in os.listdir(ruta) if os.path.isdir(os.path.join(ruta, f))]
carpetas.sort()

# Paso 1: renombrar temporalmente
for nombre in carpetas:
    os.rename(os.path.join(ruta, nombre), os.path.join(ruta, nombre + "_temp"))

# Listar nuevamente con el "_temp"
carpetas_temp = [f for f in os.listdir(ruta) if f.endswith("_temp")]
carpetas_temp.sort()

# Paso 2: renombrar con números
for i, nombre in enumerate(carpetas_temp, start=1):
    os.rename(os.path.join(ruta, nombre), os.path.join(ruta, str(i)))

print("Renombrado sin choques completado!")
