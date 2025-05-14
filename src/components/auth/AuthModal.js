// src/components/auth/AuthModal.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, getUserProfile } from '../../firebase/authService';
import './AuthModal.scss';

const AuthModal = ({ isOpen, onClose, onSuccess, initialMode = 'login', preventRedirect = false }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
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
    } else {
      // When closing, reset all fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Toggle between login and signup modes
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  // Handle form submission (login or signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Form submission started");
      
      // Validate form data
      if (!isLogin && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      console.log("Authentication method:", isLogin ? "Login" : "Register");
      
      let result;
      
      if (isLogin) {
        // Login with Firebase through our service
        console.log("Attempting login with:", email);
        result = await loginUser(email, password);
      } else {
        // Register with Firebase through our service
        console.log("Attempting registration with:", email);
        result = await registerUser(email, password, firstName, lastName);
      }

      console.log("Auth result:", result);
      
      if (result.user) {
        console.log("Auth success, getting user profile");
        
        // Get user profile data
        let userProfile = null;
        if (result.user.uid) {
          const profileResult = await getUserProfile(result.user.uid);
          if (profileResult.profile) {
            userProfile = profileResult.profile;
          }
        }
        
        // Call onSuccess callback with user data and profile
        if (onSuccess) {
          onSuccess({
            user: result.user,
            profile: userProfile,
            email,
            firstName,
            lastName
          });
        }
        
        // Close the modal first
        onClose();
        
        // FIXED: Only navigate to profile if preventRedirect is false
        // This allows checkout flow to continue properly
        if (!preventRedirect) {
          setTimeout(() => {
            navigate('/profile');
          }, 100);
        }
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
    
    // FIXED: Only navigate to guest-preview if preventRedirect is false
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

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <h2>
          {isLogin 
            ? "Sign in to your account" 
            : "Create an account"}
        </h2>
        <p className="auth-subtitle">
          {isLogin 
            ? "Sign in to continue to PremedCheatsheet." 
            : "Create an account to continue to PremedCheatsheet."}
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
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); }}>Forgot Password?</a>
              {' | '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Create account</a>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Sign in</a>
            </p>
          )}
          
          <button className="guest-button" onClick={continueAsGuest}>
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;