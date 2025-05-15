// src/firebase/authService.js - Updated with enhanced password reset functionality
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import app from './config';

const auth = getAuth(app);
const db = getFirestore(app);

// Register a new user
export const registerUser = async (email, password, firstName, lastName) => {
  try {
    console.log(`Registering user: ${email}, firstName: ${firstName}, lastName: ${lastName}`);
    
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email,
      createdAt: new Date().toISOString(),
      subscriptions: [],
      paymentVerified: false
    });
    
    console.log("User registered successfully:", userCredential.user.uid);
    return { user: userCredential.user, success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: error.message, success: false };
  }
};

// Sign in an existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, success: true };
  } catch (error) {
    console.error("Error signing in:", error);
    return { error: error.message, success: false };
  }
};

// Sign out the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: error.message, success: false };
  }
};

// Enhanced reset password function with proper error handling
export const resetPassword = async (email) => {
  try {
    // Configuration for password reset email
    const actionCodeSettings = {
      // URL you want to redirect back to after password reset
      url: `${window.location.origin}/login`,
      // This must be true for the link to work correctly
      handleCodeInApp: false
    };
    
    // Send password reset email with specified redirect URL
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    
    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    
    // User-friendly error messages for common issues
    let errorMessage = "Error sending password reset email. Please try again.";
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = "No account exists with this email address.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Too many attempts. Please try again later.";
    }
    
    return { 
      error: { 
        code: error.code, 
        message: errorMessage 
      }, 
      success: false 
    };
  }
};

// Verify a password reset code
export const verifyResetCode = async (code) => {
  try {
    await verifyPasswordResetCode(auth, code);
    return { success: true };
  } catch (error) {
    console.error("Error verifying reset code:", error);
    return { 
      error: { 
        code: error.code, 
        message: "This password reset link is invalid or has expired. Please request a new one."
      }, 
      success: false 
    };
  }
};

// Confirm password reset with new password
export const completePasswordReset = async (code, newPassword) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error confirming password reset:", error);
    
    let errorMessage = "Error resetting password. Please try again.";
    
    if (error.code === 'auth/expired-action-code') {
      errorMessage = "This password reset link has expired. Please request a new one.";
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = "This password reset link is invalid. Please request a new one.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak. Please choose a stronger password.";
    }
    
    return { 
      error: { 
        code: error.code, 
        message: errorMessage 
      }, 
      success: false 
    };
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { profile: userDoc.data(), success: true };
    } else {
      return { error: "User profile not found", success: false };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { error: error.message, success: false };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Auth state change listener
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db };