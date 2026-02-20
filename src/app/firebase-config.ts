// Import Firebase Core
import { initializeApp } from "firebase/app";

// Import Firebase Services yang akan dipakai
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Konfigurasi Firebase kamu
const firebaseConfig = {
  apiKey: "AIzaSyD0SClW1ARlFRCO4oJ4fvP7m64vwiRHGqA",
  authDomain: "kurir-app-1109e.firebaseapp.com",
  projectId: "kurir-app-1109e",
  storageBucket: "kurir-app-1109e.firebasestorage.app",
  messagingSenderId: "595817180055",
  appId: "1:595817180055:web:bed373736d9465c190f2d2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ EXPORT services supaya bisa dipakai di halaman lain
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
