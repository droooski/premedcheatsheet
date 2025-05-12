// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS5M5O5HM6zJZODdttPe3umQhQEfnCe1I",
  authDomain: "premedcheatsheet.firebaseapp.com",
  projectId: "premedcheatsheet",
  storageBucket: "premedcheatsheet.firebasestorage.app",
  messagingSenderId: "768032639612",
  appId: "1:768032639612:web:7812363853c725717b57f9"
};


// Check if Firebase config is properly set
const validateFirebaseConfig = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`
      ⚠️ Missing Firebase configuration variables:
      ${missingVars.join(', ')}
      Please check your .env file.
    `);
    
    // In development, we can use a placeholder for convenience
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using placeholder Firebase config for development...');
      return {
        apiKey: "development-placeholder-key",
        authDomain: "development-placeholder.firebaseapp.com",
        projectId: "development-placeholder",
        storageBucket: "development-placeholder.appspot.com",
        messagingSenderId: "000000000000",
        appId: "1:000000000000:web:0000000000000000000000"
      };
    }
  }
  
  return firebaseConfig;
};

// Initialize Firebase with validated config
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized successfully');

export { auth, db };
export default app;