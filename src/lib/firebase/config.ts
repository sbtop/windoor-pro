import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
// Nota: Reemplaza estas variables con tus credenciales reales de la consola de Firebase.
// Es muy recomendable usar variables de entorno (import.meta.env.VITE_FIREBASE_API_KEY) en Vite
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_TU_LLAVE_DE_EJEMPLO",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tu-proyecto.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tu-proyecto",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tu-proyecto.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abc123def456"
};

// Inicializar la aplicación de Firebase
export const app = initializeApp(firebaseConfig);

// Inicializar servicios principales
export const auth = getAuth(app);
export const db = getFirestore(app);
