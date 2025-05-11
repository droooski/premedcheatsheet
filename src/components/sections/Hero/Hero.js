// src/components/sections/Hero/Hero.js
import { useNavigate } from 'react-router-dom';
import heroImage from '../../../assets/images/heroImage.png'; // Make sure this path is correct
import './Hero.scss';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container">
        <h1>Premed Cheatsheet</h1>
        <p className="hero-text">
          Stop guessing what it takes to get accepted. Our database offers dozens of acceptance profiles
          from premed students who made it. See their stats, learn their strategies, and build your winning
          path to medical school.
        </p>
        <button className="get-started-btn" onClick={() => navigate('/signup')}>
          Get Started
        </button>
      </div>
      
      {/* The hero image container positioned below the button */}
      <div className="hero-image-container z-highest">
        <img 
          src={heroImage} 
          alt="Medical school application profile" 
          className="hero-image" 
        />
      </div>
    </section>
  );
};

export default Hero;