import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyALKdCCSGqImTSpkLJ6YttdSE18EImbEik",
    authDomain: "lumina-bible-b88a4.firebaseapp.com",
    projectId: "lumina-bible-b88a4",
    storageBucket: "lumina-bible-b88a4.firebasestorage.app",
    messagingSenderId: "762989264692",
    appId: "1:762989264692:web:282422acd3045aca10ef61",
    measurementId: "G-TZ8LZXK1SR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper to check if configured
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
}
