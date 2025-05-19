// src/components/payment/SavePaymentMethodForm.js
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
// Import card logos
import visaLogo from '../../assets/images/card-visa.png';
import mastercardLogo from '../../assets/images/card-mastercard.png';
import amexLogo from '../../assets/images/card-amex.png';
import cvvIcon from '../../assets/images/code.png';
import './SavePaymentMethodForm.scss';

const SavePaymentMethodForm = ({ onSave, onCancel }) => {
  const [paymentData, setPaymentData] = useState({
    id: uuidv4(),
    cardNumber: '',
    cardholderName: '',
    expiry: '',
    cvc: '',
    isDefault: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveToAccount] = useState(true); // Removed unused setter
  const [cardType, setCardType] = useState(null);
  
  const { currentUser } = useAuth();
  const db = getFirestore();

  // Detect card type as user types card number
  useEffect(() => {
    // Simple card type detection based on first digits
    const number = paymentData.cardNumber.replace(/\s+/g, '');
    if (number.startsWith('4')) {
      setCardType('visa');
    } else if (/^5[1-5]/.test(number)) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(number)) {
      setCardType('amex');
    } else {
      setCardType(null);
    }
  }, [paymentData.cardNumber]);

  // Format card number as user types (add spaces)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    // Add parentheses around the && and || operators to clarify order
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'cardNumber') {
      setPaymentData(prev => ({
        ...prev,
        [name]: formatCardNumber(value)
      }));
    } else if (name === 'expiry') {
      setPaymentData(prev => ({
        ...prev,
        [name]: formatExpiry(value)
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const getCardTypeDisplay = () => {
    switch(cardType) {
      case 'visa':
        return <img src={visaLogo} alt="Visa" className="card-logo" />;
      case 'mastercard':
        return <img src={mastercardLogo} alt="Mastercard" className="card-logo" />;
      case 'amex':
        return <img src={amexLogo} alt="American Express" className="card-logo" />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!paymentData.cardNumber || !paymentData.cardholderName || !paymentData.expiry || !paymentData.cvc) {
        throw new Error("Please fill in all required fields");
      }

      // Format card data for storage
      const formattedPaymentMethod = {
        id: paymentData.id,
        cardType: cardType || 'card',
        lastFourDigits: paymentData.cardNumber.replace(/\s+/g, '').slice(-4),
        cardholderName: paymentData.cardholderName,
        expiryDate: paymentData.expiry,
        isDefault: paymentData.isDefault
      };

      // If user is saving to account
      if (currentUser && saveToAccount) {
        // Get reference to user doc
        const userRef = doc(db, "users", currentUser.uid);
        
        // Get current user data first
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found");
        }
        
        const userData = userDoc.data();
        const currentMethods = userData.paymentMethods || [];
        
        let updatedMethods;
        if (formattedPaymentMethod.isDefault) {
          // If this payment method is being set as default, make all other methods non-default
          updatedMethods = currentMethods.map(method => ({
            ...method,
            isDefault: false // Set all existing methods to non-default
          }));
          
          // Check if we're editing an existing method or adding a new one
          const existingIndex = updatedMethods.findIndex(method => method.id === formattedPaymentMethod.id);
          if (existingIndex >= 0) {
            // Replace existing method
            updatedMethods[existingIndex] = formattedPaymentMethod;
          } else {
            // Add new method
            updatedMethods.push(formattedPaymentMethod);
          }
        } else {
          // If not setting as default
          const existingIndex = currentMethods.findIndex(method => method.id === formattedPaymentMethod.id);
          if (existingIndex >= 0) {
            // Update existing method
            updatedMethods = [...currentMethods];
            updatedMethods[existingIndex] = formattedPaymentMethod;
          } else {
            // Add new method
            updatedMethods = [...currentMethods, formattedPaymentMethod];
          }
        }
        
        // If this is the first payment method, make it default
        if (updatedMethods.length === 1 && !updatedMethods[0].isDefault) {
          updatedMethods[0].isDefault = true;
        }
        
        // Update in Firestore
        await updateDoc(userRef, {
          paymentMethods: updatedMethods
        });
        
        // Call onSave with both the new method and the updated list
        if (onSave) {
          onSave(formattedPaymentMethod, updatedMethods);
        }
      } else {
        // Just handle the payment directly
        if (onSave) {
          onSave(formattedPaymentMethod);
        }
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
      setError(error.message || "Failed to save payment method");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="cardholderName">Cardholder Name</label>
          <input
            type="text"
            id="cardholderName"
            name="cardholderName"
            value={paymentData.cardholderName}
            onChange={handleChange}
            placeholder="Name on card"
            required
          />
        </div>
        
        <div className="form-group card-number-group">
          <label htmlFor="cardNumber">Card Number</label>
          <div className="card-input-container">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
            />
            <div className="card-type-icon">
              {getCardTypeDisplay()}
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiry">Expiry Date</label>
            <input
              type="text"
              id="expiry"
              name="expiry"
              value={paymentData.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              maxLength="5"
              required
            />
          </div>
          
          <div className="form-group cvv-group">
            <label htmlFor="cvc">CVV</label>
            <div className="cvv-input-container">
              <input
                type="text"
                id="cvc"
                name="cvc"
                value={paymentData.cvc}
                onChange={handleChange}
                placeholder="123"
                maxLength="4"
                required
              />
              <div className="cvv-icon">
                <img src={cvvIcon} alt="CVV" className="cvv-logo" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-checkbox">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={paymentData.isDefault}
            onChange={handleChange}
          />
          <label htmlFor="isDefault">Set as default payment method</label>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Payment Method'}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SavePaymentMethodForm;