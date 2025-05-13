// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import Checkout from './pages/Checkout/Checkout';
import ProfilePage from './pages/Profile/ProfilePage';
import SchoolProfilePage from './pages/SchoolProfile/SchoolProfile';
import AccountPage from './pages/Account/AccountPage';
import AdminPanel from './pages/Admin/AdminPanel';
import GuestPage from './pages/Guest/GuestPage'; 
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { onAuthChange } from './firebase/authService';
import './styles/main.scss';

// Function to check if user has guest access
const hasGuestAccess = () => {
  const guestAccess = localStorage.getItem('guestAccess');
  const guestExpiry = localStorage.getItem('guestAccessExpiry');
  
  return guestAccess === 'true' && guestExpiry && parseInt(guestExpiry) > Date.now();
};

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
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/profile" /> : <HomePage />} />
        
        {/* Authentication and purchase routes */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/signup" element={<Checkout />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" /> : <Checkout mode="login" />} />
        <Route path="/pricing" element={<Checkout />} />
        
        {/* Guest preview route - explicit route for guest viewers */}
        <Route path="/guest-preview" element={<GuestPage />} />
        
        {/* Protected routes with different handling for guests */}
        <Route path="/profile" element={
          isAuthenticated ? (
            <ProfilePage />
          ) : isGuest ? (
            <GuestPage />
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/school/:schoolId" element={
          isAuthenticated ? (
            <SchoolProfilePage />
          ) : isGuest ? (
            <GuestPage />
          ) : (
            <Navigate to="/" />
          )
        } />
        
        <Route path="/account" element={
          user ? <AccountPage /> : <Navigate to="/" />
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        
        {/* Common routes - redirect based on auth status */}
        <Route path="/about" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />
        <Route path="/privacy" element={<HomePage />} />
        <Route path="/terms" element={<HomePage />} />
        
        {/* Application cheatsheet route */}
        <Route path="/application-cheatsheet" element={
          isAuthenticated ? (
            <ProfilePage />
          ) : isGuest ? (
            <GuestPage />
          ) : (
            <Navigate to="/" />
          )
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;