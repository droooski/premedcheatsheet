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

// Register a new user
export const registerUser = async (email, password, firstName, lastName) => {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email,
      createdAt: new Date().toISOString(),
      subscriptions: []
    });
    
    return { user: userCredential.user, success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { 
      error: error.message,
      success: false
    };
  }
};

// Sign in an existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { 
      user: userCredential.user,
      success: true
    };
  } catch (error) {
    console.error("Error signing in:", error);
    return { 
      error: error.message,
      success: false
    };
  }
};

// Sign out the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { 
      error: error.message,
      success: false
    };
  }
};

// Reset password for a user
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
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