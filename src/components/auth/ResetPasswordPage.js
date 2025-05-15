// src/components/auth/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import Navbar from '../layout/Navbar/Navbar';
import Footer from '../sections/Footer/Footer';
import './ResetPasswordPage.scss';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [actionCode, setActionCode] = useState('');
  const [invalidCode, setInvalidCode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  // Extract oobCode (action code) from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    
    if (!oobCode) {
      setInvalidCode(true);
      setVerifying(false);
      return;
    }
    
    setActionCode(oobCode);
    
    // Verify the password reset code
    const verifyCode = async () => {
      try {
        // Attempt to verify the code
        await verifyPasswordResetCode(auth, oobCode);
        setVerifying(false);
      } catch (error) {
        console.error('Invalid or expired reset code:', error);
        setInvalidCode(true);
        setVerifying(false);
      }
    };
    
    verifyCode();
  }, [location, auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      // Confirm the password reset
      await confirmPasswordReset(auth, actionCode, newPassword);
      setSuccess(true);
      
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
      
      // After 3 seconds, redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <Navbar />
      
      <div className="reset-password-content">
        <div className="container">
          <div className="reset-password-card">
            <h1>Reset Your Password</h1>
            
            {verifying ? (
              <div className="loading-message">
                <p>Verifying your reset link...</p>
                <div className="spinner"></div>
              </div>
            ) : invalidCode ? (
              <div className="invalid-code-message">
                <p>This password reset link is invalid or has expired.</p>
                <p>Please request a new password reset link.</p>
                <button onClick={() => navigate('/login')} className="return-button">
                  Return to Login
                </button>
              </div>
            ) : success ? (
              <div className="success-message">
                <p>Your password has been successfully reset!</p>
                <p>You will be redirected to the login page in a few seconds...</p>
                <button onClick={() => navigate('/login')} className="login-button">
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                <p className="instructions">
                  Create a new password for your account. Your password should be at least 6 characters long.
                </p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="reset-button"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;