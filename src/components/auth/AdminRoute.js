// src/components/auth/AdminRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthChange } from '../../firebase/authService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // Check if user is admin
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div className="loading-container">Checking permissions...</div>;
  }

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;