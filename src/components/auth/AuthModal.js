// src/components/auth/AuthModal.js - Redesigned UI while preserving functionality
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, getUserProfile } from '../../firebase/authService';
import ForgotPassword from './ForgotPassword';
import './AuthModal.scss';

const AuthModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialMode = 'login', 
  preventRedirect = false,
  dataCollectionOnly = false 
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Update login mode when initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      // When opening, just reset error
      setError('');
      setShowForgotPassword(false);
    } else {
      // When closing, reset all fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setError('');
      setLoading(false);
      setShowForgotPassword(false);
    }
  }, [isOpen]);

  // Toggle between login and signup modes
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowForgotPassword(false);
  };

  // Show forgot password form
  const handleShowForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
    setError('');
  };

  // Back to login from forgot password
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setError('');
  };

  // Handle form submission (login or signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!isLogin && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // If dataCollectionOnly is true, don't actually register the user
      if (dataCollectionOnly && !isLogin) {
        // Just pass the data to onSuccess without authentication
        onSuccess({
          email,
          password,
          firstName,
          lastName,
          dataCollectionOnly: true
        });
        
        setLoading(false);
        return;
      }

      // Normal authentication flow for login or full registration
      let result;
      
      if (isLogin) {
        result = await loginUser(email, password);
      } else {
        result = await registerUser(email, password, firstName, lastName);
      }

      if (result.user) {
        // Get user profile data
        let userProfile = null;
        if (result.user.uid) {
          const profileResult = await getUserProfile(result.user.uid);
          if (profileResult.profile) {
            userProfile = profileResult.profile;
          }
        }
        
        // Call onSuccess callback with user data and profile
        onSuccess({
          user: result.user,
          profile: userProfile,
          email,
          firstName,
          lastName
        });
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
      
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Continue as guest option
  const continueAsGuest = () => {
    // Set a cookie or localStorage item to track guest access
    localStorage.setItem('guestAccess', 'true');
    localStorage.setItem('guestAccessExpiry', (Date.now() + (24 * 60 * 60 * 1000)).toString()); // 24 hours
    
    // Close the modal
    onClose();
    
    // Only navigate to guest-preview if preventRedirect is false
    if (!preventRedirect) {
      setTimeout(() => {
        navigate('/guest-preview');
      }, 100);
    } else {
      // Let the parent component handle what happens after guest login
      if (onSuccess) {
        onSuccess({
          user: null, 
          isGuest: true
        });
      }
    }
  };

  // Handle modal overlay click
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="close-button" 
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            zIndex: 1002,
            color: '#666',
            lineHeight: '1'
          }}
        >
          ×
        </button>
        {/* Conditional rendering based on state */}
        {showForgotPassword ? (
          <ForgotPassword 
            onClose={onClose} 
            onBackToLogin={handleBackToLogin} 
          />
        ) : (
          <>
            <h2>
              {isLogin 
                ? "Join The Cheatsheet" 
                : "Join The Cheatsheet"}
            </h2>
            <p className="auth-subtitle">
              {isLogin 
                ? "Sign in to unlock exclusive content." 
                : (dataCollectionOnly 
                   ? "Enter your details to complete your purchase." 
                   : "Create an account to unlock exclusive content.")}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder={isLogin ? "Password" : "Create Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Re-type Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {!isLogin && (
                <p className="terms-note">
                  By joining, you may receive emails and updates related to your account. You can unsubscribe at anytime.
                </p>
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading 
                  ? "Processing..." 
                  : (isLogin 
                     ? "Sign in" 
                     : (dataCollectionOnly 
                        ? "Create account" 
                        : "Create account"))}
              </button>
            </form>

            <div className="auth-footer">
              {isLogin ? (
                <div className="auth-links">
                  <button 
                    type="button" 
                    className="forgot-password-link" 
                    onClick={handleShowForgotPassword}
                  >
                    Forgot Password?
                  </button>
                  <p className="account-toggle">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      className="toggle-mode-button" 
                      onClick={toggleAuthMode}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              ) : (
                <p className="account-toggle">
                  Already have an account?{' '}
                  <button 
                    type="button"
                    className="toggle-mode-button" 
                    onClick={toggleAuthMode}
                  >
                    Sign in
                  </button>
                </p>
              )}
              
              {!dataCollectionOnly && (
                <button className="guest-button" onClick={continueAsGuest}>
                  Continue as guest
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;