// src/components/auth/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthChange } from '../../firebase/authService';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check for guest access
    const guestAccess = localStorage.getItem('guestAccess');
    const guestExpiry = localStorage.getItem('guestAccessExpiry');
    
    const isGuestValid = guestAccess === 'true' && guestExpiry && parseInt(guestExpiry) > Date.now();
    
    if (isGuestValid) {
      setAuthenticated(true);
            setLoading(false);
      return;
    }
    
    // Check for authenticated user
    const unsubscribe = onAuthChange((user) => {
      setAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return authenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;