// src/components/auth/EmailVerificationPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail, onAuthChange } from '../../firebase/authService';
import Navbar from '../layout/Navbar/Navbar';
import Footer from '../sections/Footer/Footer';
import './EmailVerificationPage.scss';

const EmailVerificationPage = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get the action code from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    const actionCode = queryParams.get('oobCode');
    
    // Check for current user
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    
    // Handle the verification
    const handleVerification = async () => {
      if (mode === 'verifyEmail' && actionCode) {
        try {
          // Attempt to verify the email
          const result = await verifyEmail(actionCode);
          
          if (result.success) {
            setSuccess(true);
          } else {
            setError(result.error.message || 'Verification failed. Please try again.');
          }
        } catch (err) {
          console.error('Error verifying email:', err);
          setError('An error occurred during verification. Please try again.');
        } finally {
          setVerifying(false);
        }
      } else {
        setError('Invalid verification link. Please check your email and try again.');
        setVerifying(false);
      }
    };
    
    if (mode === 'verifyEmail' && actionCode) {
      handleVerification();
    } else {
      setError('Invalid verification link. Missing required parameters.');
      setVerifying(false);
    }
    
    return () => unsubscribe();
  }, [location]);

  // Handle redirect after verification
  useEffect(() => {
    if (success) {
      // Redirect to account page after successful verification
      const timer = setTimeout(() => {
        navigate('/account', { state: { verificationSuccess: true } });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="email-verification-page">
      <Navbar />
      
      <div className="verification-content">
        <div className="verification-card">
          <h1>Email Verification</h1>
          
          {verifying ? (
            <div className="verifying-container">
              <div className="spinner"></div>
              <p>Verifying your email...</p>
            </div>
          ) : success ? (
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h2>Email Verified!</h2>
              <p>Your email has been successfully verified.</p>
              <p>You will be redirected to your account page shortly...</p>
              <button className="redirect-button" onClick={() => navigate('/account')}>
                Go to Account
              </button>
            </div>
          ) : (
            <div className="error-container">
              <div className="error-icon">✗</div>
              <h2>Verification Failed</h2>
              <p>{error}</p>
              <div className="action-buttons">
                <button className="back-button" onClick={() => navigate('/account')}>
                  Go to Account
                </button>
                {user && (
                  <button 
                    className="retry-button" 
                    onClick={() => navigate('/account', { state: { resendVerification: true } })}
                  >
                    Request New Verification
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EmailVerificationPage;