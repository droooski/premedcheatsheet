// src/components/auth/PlanBasedRoute.js

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getCurrentUser } from '../../firebase/authService';

const PlanBasedRoute = ({ children, requiredAccess, fallbackPath = '/account' }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkPlanAccess = async () => {
      const user = getCurrentUser();
      
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Get user's current plan
          let userPlan = 'cheatsheet'; // default
          if (userData.subscriptions && userData.subscriptions.length > 0) {
            const activeSubscription = userData.subscriptions.find(sub => sub.active);
            userPlan = activeSubscription?.plan || 'cheatsheet';
          }
          
          // Check access based on required access type
          let hasRequiredAccess = false;
          
          if (requiredAccess === 'profiles') {
            hasRequiredAccess = ['cheatsheet', 'cheatsheet-plus', 'application-plus'].includes(userPlan);
          } else if (requiredAccess === 'application') {
            hasRequiredAccess = ['application', 'application-plus'].includes(userPlan);
          }
          
          setHasAccess(hasRequiredAccess);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking plan access:", error);
        setHasAccess(false);
      }
      
      setLoading(false);
    };
    
    checkPlanAccess();
  }, [requiredAccess]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Checking your plan access...</div>
      </div>
    );
  }
  
  return hasAccess ? children : <Navigate to={fallbackPath} />;
};

export default PlanBasedRoute;