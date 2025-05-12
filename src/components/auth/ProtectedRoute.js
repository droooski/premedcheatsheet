// src/components/auth/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthChange } from '../../firebase/authService';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check for guest access
    const checkGuestAccess = () => {
      const guestAccess = localStorage.getItem('guestAccess');
      const guestExpiry = localStorage.getItem('guestAccessExpiry');
      
      // Check if guest access is valid and not expired
      if (guestAccess === 'true' && guestExpiry) {
        const expiryTime = parseInt(guestExpiry);
        if (expiryTime > Date.now()) {
          console.log("Valid guest access found", { expiryTime, now: Date.now() });
          return true;
        } else {
          console.log("Guest access expired", { expiryTime, now: Date.now() });
          // Clear expired guest access
          localStorage.removeItem('guestAccess');
          localStorage.removeItem('guestAccessExpiry');
          return false;
        }
      }
      return false;
    };
    
    // Check if user is logged in or has guest access
    const unsubscribe = onAuthChange((user) => {
      const hasGuestAccess = checkGuestAccess();
      setAuthenticated(!!user || hasGuestAccess);
      setLoading(false);
      
      console.log("Protected route auth check:", { 
        user: !!user, 
        hasGuestAccess, 
        authenticated: !!user || hasGuestAccess
      });
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.25rem',
        color: '#6b7280'
      }}>
        <p>Checking access...</p>
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/checkout" />;
};

export default ProtectedRoute;