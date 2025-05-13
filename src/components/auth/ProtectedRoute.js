// src/components/auth/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthChange } from '../../firebase/authService';
import AuthModal from './AuthModal';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

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
      
      // User is authenticated if they're logged in OR have guest access
      const isAuthenticated = !!user || hasGuestAccess;
      setAuthenticated(isAuthenticated);
      
      // If not authenticated, show the auth modal
      if (!isAuthenticated) {
        setShowAuthModal(true);
      }
      
      setLoading(false);
      
      console.log("Protected route auth check:", { 
        user: !!user, 
        hasGuestAccess,
        authenticated: isAuthenticated
      });
    });

    return () => unsubscribe();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = (userData) => {
    console.log("Auth success in protected route:", userData);
    setShowAuthModal(false);
    setAuthenticated(true);
  };

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

  // If not authenticated, show auth modal instead of redirecting immediately
  if (!authenticated) {
    return (
      <>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          initialMode="login"
        />
        <Navigate to="/" state={{ from: location }} replace />
      </>
    );
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;