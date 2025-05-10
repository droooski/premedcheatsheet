// src/components/sections/Hero/Hero.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../ProfileCard/ProfileCard';
import './Hero.scss';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero" style={{
      backgroundImage: "url('/images/newhero.png')",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat"
    }}>
      <div className="container">
        {/* Content remains unchanged */}
        <h1>Premed Cheatsheet</h1>
        <p className="hero-text">
          Stop guessing what it takes to get accepted. Our database offers dozens of acceptance profiles
          from premed students who made it. See their stats, learn their strategies, and build your winning
          path to medical school.
        </p>
        <button className="get-started-btn" onClick={() => navigate('/signup')}>
          Get Started
        </button>
        
        <div className="profile-card-preview">
          <ProfileCard type="biomedical" size="large" />
        </div>
      </div>
    </section>
  );
};

export default Hero;