import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo on the left */}
        <div className="footer-logo">
          <span className="logo-icon">✳</span>
          <span className="logo-text">PremedCheatsheet</span>
        </div>
        
        {/* Two sections right-aligned */}
        <div className="footer-links-wrapper">
          <div className="footer-links-column">
            <h4>Company</h4>
            <a href="/about" className="footer-link">About Us</a>
          </div>
          
          <div className="footer-links-column">
            <h4>Subscribe</h4>
            <a href="/newsletter" className="footer-link">Newsletter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;