// src/components/layout/GuestNavbar/GuestNavbar.js
import React, { useState } from 'react';
import './GuestNavbar.scss';

const GuestNavbar = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle navigation
  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
    setMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="guest-navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo and Brand */}
          <div className="logo">
            <span className="logo-icon">✳</span>
            <span className="logo-text" onClick={() => handleNavigate('/')}>PremedCheatsheet</span>
          </div>

          {/* Desktop Menu */}
          <div className="primary-menu">
            <li>
              <a 
                href="#" 
                className="active" 
                onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigate('/about'); }}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigate('/pricing'); }}
              >
                Pricing
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigate('/login'); }}
              >
                Log in
              </a>
            </li>
            <button 
              className="try-free-button" 
              onClick={() => handleNavigate('/signup')}
            >
              Try it Free
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-items">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}
          >
            Home
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNavigate('/about'); }}
          >
            About
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNavigate('/pricing'); }}
          >
            Pricing
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNavigate('/login'); }}
          >
            Log in
          </a>
          <button 
            className="try-free-button" 
            onClick={() => handleNavigate('/signup')}
          >
            Try it Free
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={toggleMobileMenu}
        ></div>
      )}
    </nav>
  );
};

export default GuestNavbar;