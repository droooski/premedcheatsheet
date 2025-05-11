// src/components/auth/AuthModal.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.scss';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Mock auth for now - would integrate with Firebase
    if (isLogin) {
      // Login logic
      console.log('Logging in with:', email, password);
      // Simulate successful login
      onSuccess?.();
      navigate('/checkout');
    } else {
      // Register logic
      console.log('Registering with:', firstName, lastName, email, password);
      // Simulate successful registration
      onSuccess?.();
      navigate('/checkout');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <h2>
          {isLogin 
            ? "Join Premed Cheatsheet" 
            : "Create your account"}
        </h2>
        <p className="auth-subtitle">
          {isLogin 
            ? "Sign in to unlock exclusive content." 
            : "Create an account to unlock exclusive content."}
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
            <p className="terms-text">
              By joining, you may receive emails and updates related to your account. You can unsubscribe at anytime.
            </p>
          )}

          <button type="submit" className="auth-button">
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); setError(''); }}>Forgot Password?</a>
              {' | '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Create account</a>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Sign in</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;