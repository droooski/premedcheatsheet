// src/components/auth/PlanBasedRoute.js - FIXED VERSION

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
        console.log("❌ No user found");
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("🔍 Full user data:", userData);
          console.log("🔍 User subscriptions:", userData.subscriptions);
          
          // Get ALL active subscriptions (not just the first one)
          let userPlans = [];
          if (userData.subscriptions && userData.subscriptions.length > 0) {
            const activeSubscriptions = userData.subscriptions.filter(sub => sub.active);
            console.log("✅ Active subscriptions:", activeSubscriptions);
            userPlans = activeSubscriptions.map(sub => sub.plan);
          } else {
            // Fallback: if no subscriptions but paymentVerified, give basic access
            if (userData.paymentVerified) {
              userPlans = ['cheatsheet']; // Default basic access
            }
          }
          
          console.log("📋 User plans:", userPlans);
          console.log("🎯 Required access:", requiredAccess);
          
          // Check access based on required access type
          let hasRequiredAccess = false;
          
          if (requiredAccess === 'profiles') {
            // Plans that include profile access
            const profilePlans = ['cheatsheet', 'cheatsheet-plus', 'application-plus'];
            hasRequiredAccess = userPlans.some(plan => profilePlans.includes(plan));
            console.log("🔒 Profile access check:", hasRequiredAccess, "User plans:", userPlans, "Required plans:", profilePlans);
          } else if (requiredAccess === 'application') {
            // Plans that include application guides access
            const applicationPlans = ['application', 'application-plus'];
            hasRequiredAccess = userPlans.some(plan => applicationPlans.includes(plan));
            console.log("🔒 Application access check:", hasRequiredAccess, "User plans:", userPlans, "Required plans:", applicationPlans);
          } else {
            // Default: if no specific requirement, just check if user has any active subscription
            hasRequiredAccess = userPlans.length > 0 || userData.paymentVerified;
            console.log("🔒 Default access check:", hasRequiredAccess);
          }
          
          console.log("✅ Final access result:", hasRequiredAccess);
          setHasAccess(hasRequiredAccess);
        } else {
          console.log("❌ User document not found");
          setHasAccess(false);
        }
      } catch (error) {
        console.error("❌ Error checking plan access:", error);
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
  
  console.log("🚪 Route decision:", hasAccess ? "ALLOW" : "REDIRECT", "to", hasAccess ? "content" : fallbackPath);
  
  return hasAccess ? children : <Navigate to={fallbackPath} />;
};

export default PlanBasedRoute;