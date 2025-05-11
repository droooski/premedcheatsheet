// src/components/sections/Cta/Cta.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cta.scss';

const Cta = () => {
  const navigate = useNavigate();

  const navigateToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <section className="cta">
      <h2>Ready to start your journey?</h2>
      <p>Join for access to exclusive content including extra-curriculars that worked, reflections, and advice.</p>
      <button className="cta-button" onClick={navigateToCheckout}>
        Access the full cheat sheet
      </button>
    </section>
  );
};

export default Cta;