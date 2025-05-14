// src/components/auth/PaymentVerifiedRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getCurrentUser } from '../../firebase/authService';

const PaymentVerifiedRoute = ({ children, fallbackPath = '/checkout' }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkPaymentVerification = async () => {
      // Get current user
      const user = getCurrentUser();
      
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      try {
        // Check if payment was previously verified in this session
        const sessionVerified = sessionStorage.getItem('paymentVerified') === 'true';
        
        if (sessionVerified) {
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // Otherwise check in Firestore
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check for proper payment verification
          // This checks for a subscription OR paymentVerified flag
          if (
            (userData.subscriptions && 
             userData.subscriptions.length > 0 && 
             userData.subscriptions.some(sub => sub.active)) || 
            userData.paymentVerified === true
          ) {
            // Store in session for faster access
            sessionStorage.setItem('paymentVerified', 'true');
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking payment verification:", error);
        setHasAccess(false);
      }
      
      setLoading(false);
    };
    
    checkPaymentVerification();
  }, []);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Verifying your access...</div>
      </div>
    );
  }
  
  return hasAccess ? children : <Navigate to={fallbackPath} />;
};

export default PaymentVerifiedRoute;