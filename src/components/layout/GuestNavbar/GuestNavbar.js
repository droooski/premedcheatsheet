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
              <button 
                type="button"
                className="nav-link-button active" 
                onClick={() => handleNavigate('/')}
              >
                Home
              </button>
            </li>
            <li>
              <button 
                type="button"
                className="nav-link-button active" 
                onClick={() => handleNavigate('/about')}
              >
                About
              </button>
            </li>
            <li>
              <button 
                type="button"
                className="nav-link-button active" 
                onClick={() => handleNavigate('/pricing')}
              >
                Pricing
              </button>
            </li>
            <li>
              <button 
                type="button"
                className="nav-link-button active" 
                onClick={() => handleNavigate('/login')}
              >
                Login
              </button>
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
          <button 
            type="button"
            className="nav-link-button active" 
            onClick={() => handleNavigate('/')}
          >
            Home
          </button>
          <button 
              type="button"
              className="nav-link-button active" 
              onClick={() => handleNavigate('/about')}
            >
              About
          </button>
          <button 
              type="button"
              className="nav-link-button active" 
              onClick={() => handleNavigate('/pricing')}
            >
              Pricing
          </button>
          <button 
              type="button"
              className="nav-link-button active" 
              onClick={() => handleNavigate('/login')}
            >
              Login
          </button>
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