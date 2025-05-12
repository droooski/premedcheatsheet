// src/firebase/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Register a new user with debugging
export const registerUser = async (email, password, firstName, lastName) => {
  try {
    console.log("Attempting to register user:", email);
    
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered successfully:", userCredential.user.uid);
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email,
      createdAt: new Date().toISOString(),
      subscriptions: []
    });
    console.log("User profile created in Firestore");
    
    return { user: userCredential.user, success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Additional debugging for network errors
    if (error.code === 'auth/network-request-failed') {
      console.error("Network request failed. Please check your internet connection and Firebase configuration.");
      
      // Log Firebase config (without sensitive data)
      console.log("Firebase initialized with:", {
        authDomain: auth.config.authDomain,
        projectId: auth.config.projectId
      });
    }
    
    return { 
      error: error.message,
      errorCode: error.code,
      success: false
    };
  }
};

// Sign in an existing user
export const loginUser = async (email, password) => {
  try {
    console.log("Attempting to log in user:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully");
    return { 
      user: userCredential.user,
      success: true
    };
  } catch (error) {
    console.error("Error signing in:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    return { 
      error: error.message,
      errorCode: error.code,
      success: false
    };
  }
};

// Sign out the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { 
      error: error.message,
      success: false
    };
  }
};

// Get current user profile
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { 
        profile: userDoc.data(),
        success: true
      };
    } else {
      return { 
        error: "User profile not found",
        success: false
      };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { 
      error: error.message,
      success: false
    };
  }
};

// Get current authenticated user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen for auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};