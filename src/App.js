// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import Checkout from './pages/Checkout/Checkout';
import ProfilePage from './pages/Profile/ProfilePage';
import SchoolProfilePage from './pages/SchoolProfile/SchoolProfile';
import AccountPage from './pages/Account/AccountPage';
import AdminPanel from './pages/Admin/AdminPanel';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { onAuthChange } from './firebase/authService';
import './styles/main.scss';

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

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/profile" /> : <HomePage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/signup" element={<Checkout />} />
        <Route path="/login" element={<Checkout mode="login" />} />
        <Route path="/pricing" element={<Checkout />} /> {/* Added pricing route */}
        
        {/* Protected routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/school/:schoolId" element={
          <ProtectedRoute>
            <SchoolProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
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
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;