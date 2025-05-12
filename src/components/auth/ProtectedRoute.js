// src/components/auth/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthChange } from '../../firebase/authService';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
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