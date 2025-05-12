// src/components/auth/LoginModal.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../firebase/authService';
import './LoginModal.scss';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login with Firebase through our service
      const result = await loginUser(email, password);
      
      if (result.user) {
        // Call onSuccess callback with user data
        onSuccess(result.user);
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || "Login failed. Please check your credentials and try again.");
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
  
  // Go to signup
  const goToSignup = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
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
            <a href="#" onClick={(e) => { e.preventDefault(); }}>Forgot Password?</a>
          </p>
          <p>
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); goToSignup(); }}>Create account</a>
          </p>
          
          <button className="guest-button" onClick={continueAsGuest}>
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;