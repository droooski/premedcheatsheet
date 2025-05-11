// src/components/layout/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <span className="logo-icon">✳</span>
          <span className="logo-text">PremedCheatsheet</span>
        </div>
        
        <div className="footer-links-column">
          <h4>Company</h4>
          <Link to="/about" className="footer-link">About Us</Link>
        </div>
        
        <div className="footer-links-column">
          <h4>Subscribe</h4>
          <Link to="/newsletter" className="footer-link">Newsletter</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;