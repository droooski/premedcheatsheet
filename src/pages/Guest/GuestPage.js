// src/pages/Guest/GuestPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import SneakPeek from '../../components/sections/SneakPeek/SneakPeek';
import './GuestPage.scss';

const GuestPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer effect that redirects to pricing page after time expires
  useEffect(() => {
    if (timeLeft <= 0) {
      // Redirect to pricing page when timer expires
      navigate('/pricing');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, navigate]);

  // Handle the case when timer expires
  const handleTimeExpired = () => {
    navigate('/pricing');
  };

  return (
    <div className="guest-page">
      {/* Use the regular Navbar */}
      <Navbar />
      
      {/* Sneak Peek Content */}
      <div className="guest-content">
        <SneakPeek onTimeExpired={handleTimeExpired} />
      </div>
      
      {/* Use the regular Footer */}
      <Footer />
    </div>
  );
};

export default GuestPage;