// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthChange, 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword,
  getUserProfile
} from '../services/firebaseAuth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile when authenticated
        const { profile, error } = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        } else if (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setError(null);
    const { user, error } = await loginUser(email, password);
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    return { user };
  };

  const register = async (email, password, firstName, lastName) => {
    setError(null);
    const { user, error } = await registerUser(email, password, firstName, lastName);
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    return { user };
  };

  const logout = async () => {
    setError(null);
    const { error } = await logoutUser();
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    return { success: true };
  };

  const forgotPassword = async (email) => {
    setError(null);
    const { success, error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    return { success };
  };

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    forgotPassword,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;