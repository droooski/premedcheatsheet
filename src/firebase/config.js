// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your_api_key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your_auth_domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your_project_id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your_storage_bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "your_messaging_sender_id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your_app_id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;