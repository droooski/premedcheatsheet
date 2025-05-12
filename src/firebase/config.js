// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - make sure these values are correct
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBS5M5O5HM6zJZODdttPe3umQhQEfnCe1I",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "premedcheatsheet.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "premedcheatsheet",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "premedcheatsheet.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "768032639612",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:768032639612:web:7812363853c725717b57f9"
};

// Initialize Firebase
console.log("Initializing Firebase with config:", firebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized successfully');

export { auth, db };
export default app;