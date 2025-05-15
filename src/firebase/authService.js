// src/firebase/authService.js - Updated with email verification functions
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification, // Added for email verification
  applyActionCode       // Added for handling verification link clicks
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import app from './config';

const auth = getAuth(app);
const db = getFirestore(app);

// Register a new user
export const registerUser = async (email, password, firstName, lastName) => {
  try {
    console.log(`Registering user: ${email}, firstName: ${firstName}, lastName: ${lastName}`);
    
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(userCredential.user, {
      url: `${window.location.origin}/account`,
      handleCodeInApp: false
    });
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email,
      createdAt: new Date().toISOString(),
      subscriptions: [],
      paymentVerified: false,
      emailVerified: false // Track email verification status in Firestore
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

// Function to send verification email
export const sendVerificationEmail = async (user) => {
  try {
    if (!user) {
      throw new Error("No user is currently signed in");
    }
    
    await sendEmailVerification(user, {
      url: `${window.location.origin}/account`,
      handleCodeInApp: false
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { 
      error: { 
        code: error.code, 
        message: error.message || "Failed to send verification email" 
      }, 
      success: false 
    };
  }
};

// Function to verify email with code from URL
export const verifyEmail = async (actionCode) => {
  try {
    await applyActionCode(auth, actionCode);
    
    // Update Firestore if user is logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), {
        emailVerified: true
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { 
      error: { 
        code: error.code, 
        message: error.message || "Failed to verify email" 
      }, 
      success: false 
    };
  }
};

// Update Firestore emailVerified status when Firebase auth state changes
export const updateEmailVerificationStatus = async (userId, isVerified) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      emailVerified: isVerified
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating email verification status:", error);
    return { 
      error: error.message, 
      success: false 
    };
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