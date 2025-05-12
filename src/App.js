// src/App.js - Updated with ProtectedRoute
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import Checkout from './pages/Checkout/Checkout';
import ProfilePage from './pages/Profile/ProfilePage';
import SchoolProfilePage from './pages/SchoolProfile/SchoolProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './styles/main.scss';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/signup" element={<Checkout />} />
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
        <Route path="/about" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />
        <Route path="/privacy" element={<HomePage />} />
        <Route path="/terms" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;