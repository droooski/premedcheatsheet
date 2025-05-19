// src/components/payment/SavedPaymentMethods.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './SavedPaymentMethods.scss';

const SavedPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Call useAuth at the top level - this is crucial for hooks rules
  const auth = useAuth();
  const currentUser = auth?.currentUser || null;
  const userProfile = auth?.userProfile || null;
  const authLoading = auth?.loading || false;
  
  const navigate = useNavigate();
  const db = getFirestore();

  // Load payment methods from user profile
  useEffect(() => {
    // Check if auth is available
    if (authLoading) {
      return; // Wait for auth to initialize
    }
    
    if (userProfile) {
      setPaymentMethods(userProfile.paymentMethods || []);
      setLoading(false);
    } else if (currentUser) {
      // If we have a user but no profile, try to fetch it
      const fetchUserProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPaymentMethods(userData.paymentMethods || []);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError("Failed to load payment methods. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserProfile();
    } else {
      // No user, no loading needed
      setLoading(false);
    }
  }, [authLoading, userProfile, currentUser, db]);

  // Show login message if not authenticated
  if (!currentUser && !loading) {
    return (
      <div className="saved-payment-methods">
        <div className="no-payment-methods">
          <p>You need to be logged in to view payment methods.</p>
          <button 
            className="login-button"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Handle making a payment method the default
  const handleSetDefault = async (paymentId) => {
    if (!currentUser) {
      setError("You must be logged in to perform this action.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Update all payment methods, setting only the selected one as default
      const updatedPaymentMethods = paymentMethods.map(payment => ({
        ...payment,
        isDefault: payment.id === paymentId
      }));
      
      // Update in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        paymentMethods: updatedPaymentMethods
      });
      
      setPaymentMethods(updatedPaymentMethods);
      setLoading(false);
    } catch (error) {
      console.error("Error setting default payment method:", error);
      setError("Failed to update default payment method. Please try again.");
      setLoading(false);
    }
  };

  // Handle deleting a payment method
  const handleDeletePayment = async (paymentId) => {
    if (!currentUser) {
      setError("You must be logged in to perform this action.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Filter out the payment method to delete
      const updatedPaymentMethods = paymentMethods.filter(payment => payment.id !== paymentId);
      
      // Update in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        paymentMethods: updatedPaymentMethods
      });
      
      setPaymentMethods(updatedPaymentMethods);
      setShowDeleteConfirm(null);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting payment method:", error);
      setError("Failed to delete payment method. Please try again.");
      setLoading(false);
    }
  };

  // Navigate to edit payment method page
  const handleEditPayment = (paymentId) => {
    navigate(`/account/payment-methods/edit/${paymentId}`);
  };

  // Get card logo based on card type
  const getCardLogo = (cardType) => {
    if (!cardType) return '💳 Card';
    
    const type = cardType.toLowerCase();
    if (type.includes('visa')) {
      return '💳 Visa';
    } else if (type.includes('mastercard')) {
      return '💳 Mastercard';
    } else if (type.includes('amex')) {
      return '💳 Amex';
    } else {
      return '💳 Card';
    }
  };

  if (loading) {
    return <div className="loading">Loading payment methods...</div>;
  }

  return (
    <div className="saved-payment-methods">
      <div className="payment-methods-header">
        <h2>Payment Methods</h2>
        <button 
          className="add-payment-button"
          onClick={() => navigate('/account/payment-methods/add')}
        >
          Add New Payment Method
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {paymentMethods.length === 0 ? (
        <div className="no-payment-methods">
          <p>You don't have any saved payment methods yet.</p>
          <button 
            className="add-first-payment"
            onClick={() => navigate('/account/payment-methods/add')}
          >
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className="payment-methods-list">
          {paymentMethods.map(payment => (
            <div key={payment.id} className={`payment-card ${payment.isDefault ? 'default' : ''}`}>
              {payment.isDefault && <div className="default-badge">Default</div>}
              
              <div className="payment-details">
                <div className="card-logo">
                  {getCardLogo(payment.cardType)}
                </div>
                <p className="card-info">
                  <span className="card-number">•••• •••• •••• {payment.lastFourDigits || '****'}</span>
                  <span className="card-expiry">Expires: {payment.expiryDate || 'N/A'}</span>
                </p>
                <p className="cardholder-name">{payment.cardholderName || 'Cardholder'}</p>
              </div>
              
              <div className="payment-actions">
                {!payment.isDefault && (
                  <button 
                    className="set-default-button"
                    onClick={() => handleSetDefault(payment.id)}
                    disabled={loading}
                  >
                    Set as Default
                  </button>
                )}
                
                <button 
                  className="edit-button"
                  onClick={() => handleEditPayment(payment.id)}
                  disabled={loading}
                >
                  Edit
                </button>
                
                <button 
                  className="delete-button"
                  onClick={() => setShowDeleteConfirm(payment.id)}
                  disabled={loading}
                >
                  Delete
                </button>
                
                {showDeleteConfirm === payment.id && (
                  <div className="delete-confirm">
                    <p>Are you sure you want to delete this payment method?</p>
                    <div className="confirm-actions">
                      <button 
                        className="confirm-yes"
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={loading}
                      >
                        Yes, Delete
                      </button>
                      <button 
                        className="confirm-no"
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPaymentMethods;