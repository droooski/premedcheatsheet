import React from 'react';

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
      
      <style jsx>{`
        .footer {
          background-color: #F2F6F5;
          border-top: 0.5px solid #000000;
          padding: 2rem 0;
        }
        
        .footer-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        @media (min-width: 1024px) {
          .footer-container {
            padding: 0 2rem;
          }
        }
        
        @media (min-width: 1280px) {
          .footer-container {
            padding: 0 3rem;
          }
        }
        
        @media (min-width: 1536px) {
          .footer-container {
            padding: 0 4rem;
          }
        }
        
        .footer-logo {
          display: flex;
          align-items: center;
        }
        
        .logo-icon {
          font-size: 1.5rem;
          margin-right: 0.5rem;
        }
        
        .logo-text {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', Times, serif;
          font-weight: 500;
          font-size: 1.3rem;
          color: #1f2937;
        }
        
        .footer-links-wrapper {
          display: flex;
          gap: 6rem;
        }
        
        .footer-links-column {
          display: flex;
          flex-direction: column;
        }
        
        .footer-links-column h4 {
          font-size: 1rem;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }
        
        .footer-link {
          color: #1f2937;
          font-size: 0.875rem;
          text-decoration: none;
          margin-bottom: 0.5rem;
        }
        
        .footer-link:hover {
          color: #065f46;
        }
        
        @media (max-width: 640px) {
          .footer-container {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            text-align: center;
          }
          
          .footer-links-wrapper {
            flex-direction: column;
            gap: 1.5rem;
            align-items: center;
          }
          
          .footer-links-column {
            align-items: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;