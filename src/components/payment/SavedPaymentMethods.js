// src/components/payment/SavedPaymentMethods.js
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './SavedPaymentMethods.scss';

const SavedPaymentMethods = ({ 
  showAddNew = true, 
  paymentMethods: propPaymentMethods,
  setPaymentMethods: propSetPaymentMethods,
  loading: propLoading,
  forceDataFromProps = false
}) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const { currentUser, userProfile } = useAuth();
  const db = getFirestore();

  // Use either provided payment methods or load from userProfile
  useEffect(() => {
    if (propPaymentMethods && (forceDataFromProps || !userProfile)) {
      // Use payment methods provided by parent
      setPaymentMethods(propPaymentMethods);
      setLoading(false);
    } else if (userProfile) {
      // Load from profile if no payment methods provided
      setPaymentMethods(userProfile.paymentMethods || []);
      setLoading(false);
    } else if (propLoading !== undefined) {
      // Use loading state from props if provided
      setLoading(propLoading);
    } else {
      setLoading(false);
    }
  }, [userProfile, propPaymentMethods, propLoading, forceDataFromProps]);

  // Handle setting a payment method as default
  const handleSetDefault = async (methodId) => {
    try {
      setLoading(true);
      
      // Get the latest user data first
      const userRef = doc(db, "users", currentUser.uid);
      await getDoc(userRef); // Just to verify the doc exists
      
      // Update all payment methods, setting only the selected one as default
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }));
      
      // Update in Firestore
      await updateDoc(userRef, {
        paymentMethods: updatedMethods
      });
      
      // Update local state without reloading
      setPaymentMethods(updatedMethods);
      
      // Also update parent state if a setter was provided
      if (propSetPaymentMethods) {
        propSetPaymentMethods(updatedMethods);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error setting default payment method:", error);
      setError("Failed to update default payment method. Please try again.");
      setLoading(false);
    }
  };

  // Handle deleting a payment method
  const handleDeleteMethod = async (methodId) => {
    try {
      setLoading(true);
      
      // Get the latest user data first
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
      
      const userData = userDoc.data();
      const currentMethods = userData.paymentMethods || [];
      
      // Filter out the method to delete
      const updatedMethods = currentMethods.filter(method => method.id !== methodId);
      
      // If deleting the default method, make the first remaining method the default
      if (updatedMethods.length > 0 && currentMethods.find(m => m.id === methodId && m.isDefault)) {
        updatedMethods[0].isDefault = true;
      }
      
      // Update in Firestore
      await updateDoc(userRef, {
        paymentMethods: updatedMethods
      });
      
      // Update local state
      setPaymentMethods(updatedMethods);
      
      // Also update parent state if a setter was provided
      if (propSetPaymentMethods) {
        propSetPaymentMethods(updatedMethods);
      }
      
      setShowDeleteConfirm(null);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting payment method:", error);
      setError("Failed to delete payment method. Please try again.");
      setLoading(false);
    }
  };

  // Render the payment methods
  return (
    <div className="saved-payment-methods">
      <h2 className="section-title">Saved Payment Methods</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-message">Loading payment methods...</div>
      ) : paymentMethods.length === 0 ? (
        <div className="no-payment-methods">No saved payment methods yet.</div>
      ) : (
        <div className="payment-methods-list">
          {paymentMethods.map(method => (
            <div 
              key={method.id} 
              className={`payment-method-card ${method.isDefault ? 'default' : ''}`}
            >
              <div className="payment-icon">
                {method.cardType === 'Coupon' ? '🎫' : '💳'}
              </div>
              
              <div className="payment-details">
                <p className="payment-type">
                  {method.cardType || 'Card'} ending in <span className="card-last4">{method.lastFourDigits || '****'}</span>
                </p>
                
                {method.expiryDate && method.expiryDate !== 'N/A' && (
                  <p className="payment-expiry">Expires: {method.expiryDate}</p>
                )}
                
                <p className="payment-name">{method.cardholderName || 'Free Purchase'}</p>
                
                <div className="payment-actions">
                  {!method.isDefault && (
                    <button 
                      className="set-default-button"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </button>
                  )}
                  
                  <button 
                    className="delete-button"
                    onClick={() => setShowDeleteConfirm(method.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              {method.isDefault && <span className="default-tag">Default</span>}
              
              {showDeleteConfirm === method.id && (
                <div className="delete-confirm-overlay">
                  <div className="delete-confirm-dialog">
                    <h4>Delete Payment Method</h4>
                    <p>Are you sure you want to delete this payment method?</p>
                    <div className="confirm-actions">
                      <button 
                        className="confirm-no"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="confirm-yes"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showAddNew && (
        <div className="add-payment-section">
          <button 
            className="add-payment-button"
            onClick={() => window.location.href = '/account/payment-methods'}
          >
            Add Payment Method
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedPaymentMethods;