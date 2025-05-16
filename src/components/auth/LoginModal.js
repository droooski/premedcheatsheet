// src/components/auth/LoginModal.js - Updated with forgot password functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, resetPassword } from '../../firebase/authService';
import './LoginModal.scss';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // If in forgot password mode, send reset email
      if (forgotPasswordMode) {
        if (!email) {
          throw new Error('Please enter your email address');
        }
        
        const result = await resetPassword(email);
        if (result.success) {
          setResetEmailSent(true);
        } else {
          throw new Error(result.error.message || 'Failed to send reset email');
        }
      } else {
        // Regular login flow
        const result = await loginUser(email, password);
        
        if (result.user) {
          // Call onSuccess callback with user data
          onSuccess(result.user);
        } else {
          throw new Error(result.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || "Authentication failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Continue as guest option
  const continueAsGuest = () => {
    // Set a cookie or localStorage item to track guest access
    localStorage.setItem('guestAccess', 'true');
    localStorage.setItem('guestAccessExpiry', (Date.now() + (24 * 60 * 60 * 1000)).toString()); // 24 hours
    
    onClose();
    navigate('/profile');
  };
  
  // Switch to forgot password mode
  const switchToForgotPassword = (e) => {
    e.preventDefault();
    setForgotPasswordMode(true);
    setError('');
  };
  
  // Go back to login mode
  const backToLogin = () => {
    setForgotPasswordMode(false);
    setResetEmailSent(false);
    setError('');
  };
  
  // Go to signup
  const goToSignup = () => {
    onClose();
    navigate('/signup');
  };

  // Render forgot password form
  const renderForgotPasswordForm = () => {
    if (resetEmailSent) {
      return (
        <div className="success-message">
          <h3>Check Your Email</h3>
          <p>
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p>Don't see it? Check your spam folder or request another link.</p>
          <div className="success-actions">
            <button className="back-to-login-button" onClick={backToLogin}>
              Back to Login
            </button>
            <button 
              className="resend-button" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Sending..." : "Resend Link"}
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <>
        <h2>Reset Your Password</h2>
        <p className="modal-subtitle">Enter your email and we'll send you a link to reset your password</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            <button 
              type="button"
              className="link-button" 
              onClick={backToLogin}
            >
              Back to Sign In
            </button>
          </p>
        </div>
      </>
    );
  };

  // Render regular login form
  const renderLoginForm = () => {
    return (
      <>
        <h2>Sign In</h2>
        <p className="modal-subtitle">Sign in to your PremedCheatsheet account</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <button 
              type="button"
              className="link-button" 
              onClick={switchToForgotPassword}
            >
              Forgot Password?
            </button>
          </p>
          <p>
            Don't have an account?{' '}
            <button 
              type="button"
              className="link-button" 
              onClick={goToSignup}
            >
              Create account
            </button>
          </p>
          
          <button className="guest-button" onClick={continueAsGuest}>
            Continue as guest
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        {forgotPasswordMode ? renderForgotPasswordForm() : renderLoginForm()}
      </div>
    </div>
  );
};

export default LoginModal;