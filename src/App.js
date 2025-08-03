// src/App.js - Updated with Premed Cheatsheet+ route
import React, { useState, useEffect, use } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import Checkout from './pages/Checkout/Checkout';
import ProfilePage from './pages/Profile/ProfilePage';
import SchoolProfilePage from './pages/SchoolProfile/SchoolProfile';
import AccountPage from './pages/Account/AccountPage';
import AdminPanel from './pages/Admin/AdminPanel';
import GuestPage from './pages/Guest/GuestPage';
import AboutPage from './pages/About/AboutPage';
import PaymentMethodsPage from './pages/Account/PaymentMethodsPage';
import AddressesPage from './pages/Account/AddressesPage';
import PremedCheatsheetPlusPage from './pages/PremedCheatsheetPlus/PremedCheatsheetPlusPage';
import AdminRoute from './components/auth/AdminRoute';
import PaymentVerifiedRoute from './components/auth/PaymentVerifiedRoute';
import ApplicationCheatsheetPage from './pages/ApplicationCheatsheet/ApplicationCheatsheetPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import EmailVerificationPage from './components/auth/EmailVerificationPage';
import { onAuthChange } from './firebase/authService';
import { AuthProvider } from './contexts/AuthContext';
import PlanBasedRoute from './components/auth/PlanBasedRoute';
import { trackPageView } from './utils/analytics';
import './styles/main.scss';

// Function to check if user has guest access
const hasGuestAccess = () => {
  const guestAccess = localStorage.getItem('guestAccess');
  const guestExpiry = localStorage.getItem('guestAccessExpiry');
  
  return guestAccess === 'true' && guestExpiry && parseInt(guestExpiry) > Date.now();
};

//handle route tracking
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for authenticated user on component mount
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // If loading, show a simple loading state
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Check if user is guest (separate from authenticated)
  const isGuest = hasGuestAccess() && !user;

  return (
    <AuthProvider>
    <Router>
      <RouteTracker />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Authentication and purchase routes */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/signup" element={<Checkout />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" /> : <Checkout mode="login" />} />
        <Route path="/pricing" element={<Checkout />} />
        
        {/* Reset Password route */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Email Verification Handler route */}
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        
        {/* About page route */}
        <Route path="/about" element={<AboutPage />} />
        
        {/* Guest preview route - explicit route for guest viewers */}
        <Route path="/guest-preview" element={<GuestPage />} />
        
        {/* Protected routes with payment verification */}
        <Route path="/profile" element={
          isAuthenticated ? (
            <PaymentVerifiedRoute fallbackPath="/checkout">
              <PlanBasedRoute requiredAccess="profiles" fallbackPath="/account">
                <ProfilePage />
              </PlanBasedRoute>
            </PaymentVerifiedRoute>
          ) : isGuest ? (
            <GuestPage />
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path="/premed-cheatsheet-plus" element={
          isAuthenticated ? (
            <PaymentVerifiedRoute fallbackPath="/checkout">
              <PlanBasedRoute requiredAccess="cheatsheet-plus" fallbackPath="/account">
                <PremedCheatsheetPlusPage />
              </PlanBasedRoute>
            </PaymentVerifiedRoute>
          ) : isGuest ? (
            <GuestPage />
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path="/application-cheatsheet" element={
          isAuthenticated ? (
            <PaymentVerifiedRoute fallbackPath="/checkout">
              <PlanBasedRoute requiredAccess="application" fallbackPath="/account">
                <ApplicationCheatsheetPage />
              </PlanBasedRoute>
            </PaymentVerifiedRoute>
          ) : isGuest ? (
            <GuestPage />
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/school/:schoolId" element={
          isAuthenticated ? (
            <PaymentVerifiedRoute fallbackPath="/checkout">
              <SchoolProfilePage />
            </PaymentVerifiedRoute>
          ) : isGuest ? (
            <GuestPage />
          ) : (
            <Navigate to="/" />
          )
        } />
        
        {/* Account page - handles email verification */}
        <Route path="/account" element={
          user ? <AccountPage /> : <Navigate to="/" />
        } />
    <Route path="/admin" element={
          user ? <AdminPanel /> : <Navigate to="/" />
        } />
        {/* Add these new routes */}
        <Route path="/account/payment-methods" element={
          user ? <PaymentMethodsPage /> : <Navigate to="/" />
        } />
        <Route path="/account/addresses" element={
          user ? <AddressesPage /> : <Navigate to="/" />
        } />

        <Route path="/admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        
        {/* Common routes - redirect based on auth status */}
        <Route path="/contact" element={<AboutPage />} />
        <Route path="/privacy" element={<HomePage />} />
        <Route path="/terms" element={<HomePage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </AuthProvider>
  );
}

export default App;