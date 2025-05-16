// src/components/auth/AuthModal.js - Updated with forgot password functionality
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

  // Handle close button click with explicit stop propagation
  const handleCloseClick = (e) => {
    e.stopPropagation(); // Stop event from bubbling up
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modified close button with explicit handler */}
        <button 
          className="close-button" 
          onClick={handleCloseClick}
          aria-label="Close modal"
        >
          &times;
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
                ? "Sign in to your account" 
                : (dataCollectionOnly 
                   ? "Create your account" 
                   : "Create an account")}
            </h2>
            <p className="auth-subtitle">
              {isLogin 
                ? "Sign in to continue to PremedCheatsheet." 
                : (dataCollectionOnly 
                   ? "Enter your details to complete your purchase." 
                   : "Create an account to continue to PremedCheatsheet.")}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="name-inputs">
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading 
                  ? "Processing..." 
                  : (isLogin 
                     ? "Sign In" 
                     : (dataCollectionOnly 
                        ? "Continue to Payment" 
                        : "Create Account"))}
              </button>
            </form>

            <div className="auth-footer">
              {isLogin ? (
                <p>
                  <button 
                    type="button" 
                    className="link-button" 
                    onClick={handleShowForgotPassword}
                  >
                    Forgot Password?
                  </button>
                  {' | '}
                  <button 
                    type="button"
                    className="link-button" 
                    onClick={toggleAuthMode}
                  >
                    Create account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    className="link-button" 
                    onClick={toggleAuthMode}
                  >
                     Sign In
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