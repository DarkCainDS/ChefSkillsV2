# 🍳 ChefSkills

ChefSkills es una aplicación móvil desarrollada en **React Native (Bare Workflow con Expo Dev Client)**.  
Su objetivo es ofrecer recetas, técnicas de cocina, gestión de ingredientes y funciones personalizadas para cada usuario.  

La app incluye:  
- 🔑 **Autenticación con Google** (via `expo-auth-session`)  
- 📦 **Gestión de estado con Redux Toolkit**  
- 🎨 **UI con Expo Image, LinearGradient y componentes nativos**  
- 💾 **Persistencia con AsyncStorage y SecureStore**  
- 📱 **Compatibilidad con Android e iOS**  

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/chefskills.git
cd chefskills
2. Instalar dependencias
Asegúrate de tener instalado Node.js (>=18) y npm o yarn.

bash
Copy
Edit
yarn install
# o con npm
npm install
3. Requisitos previos
Debes tener configurado el entorno de desarrollo de React Native Bare Workflow:

Android

Android Studio con SDK 34+

Variables de entorno (ANDROID_HOME, JAVA_HOME)

Emulador Android o dispositivo físico

iOS (solo en macOS)

Xcode 15+

CocoaPods (sudo gem install cocoapods)

Simulador o dispositivo físico

Expo Dev Client
Este proyecto NO usa Expo Go, sino expo-dev-client.
Compila tu propia app de desarrollo con:

bash
Copy
Edit
npx expo run:android
# o en iOS
npx expo run:ios
4. Configuración de Google Sign-In
En Firebase Console:

Crea un proyecto y descarga google-services.json (Android).

Colócalo en android/app/google-services.json.

Descarga GoogleService-Info.plist (iOS).

Colócalo en ios/.

Configura SHA-1 y Web Client ID en Firebase.

📦 Dependencias principales
Core
expo@53.0.0

react-native@0.73.6

react@18.2.0

Navegación
@react-navigation/native

@react-navigation/native-stack

@react-navigation/stack

react-native-screens

react-native-safe-area-context

react-native-gesture-handler

Estado
@reduxjs/toolkit

react-redux

redux

Expo SDK
expo-image

expo-linear-gradient

expo-secure-store

expo-file-system

expo-status-bar

expo-application

Otros
@react-native-async-storage/async-storage

react-native-bouncy-checkbox

🛠 Scripts disponibles
bash
Copy
Edit
yarn start    # Inicia Metro Bundler
yarn android  # Corre la app en Android (expo run:android)
yarn ios      # Corre la app en iOS (expo run:ios)
yarn web      # Corre versión web (experimental)
📂 Estructura recomendada de carpetas
bash
Copy
Edit
chefskills/
 ├── app/                  # Pantallas principales
 ├── components/           # Componentes reutilizables
 ├── hooks/                # Custom hooks
 ├── redux/                # Configuración de Redux
 ├── assets/               # Imágenes, íconos, fuentes
 ├── android/              # Código nativo Android
 ├── ios/                  # Código nativo iOS
 ├── package.json
 ├── app.json              # Configuración Expo
 └── README.md
▶️ Ejecución
Compilar Dev Client (solo la primera vez o si cambias nativo):

bash
Copy
Edit
npx expo run:android
Iniciar la app:

bash
Copy
Edit
yarn start
Escanea el QR o ejecuta en emulador/dispositivo.

📌 Notas finales
Usa siempre Bare Workflow (no funciona en Expo Go).

Revisa google-services.json y configuración de Firebase antes de compilar.

Si tienes problemas con Gradle:

bash
Copy
Edit
cd android
./gradlew clean