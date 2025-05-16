// src/components/auth/ForgotPassword.js
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../firebase/authService';
import './ForgotPassword.scss';

const ForgotPassword = ({ onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Call Firebase reset password function
      const result = await resetPassword(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.error?.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Reset Password</h2>
      <p className="modal-subtitle">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {error && <div className="auth-error">{error}</div>}

      {success ? (
        <div className="success-message">
          <p>Password reset email sent!</p>
          <p>Please check your inbox and follow the instructions to reset your password.</p>
          <button className="auth-button" onClick={onBackToLogin}>
            Back to Login
          </button>
        </div>
      ) : (
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
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="form-footer">
            <button 
              type="button" 
              className="back-to-login" 
              onClick={onBackToLogin}
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;