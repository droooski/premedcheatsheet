// src/components/payment/SavePaymentMethodForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import { v4 as uuidv4 } from 'uuid';
import './SavePaymentMethodForm.scss';

const SavePaymentMethodForm = ({ existingPaymentMethod, onSave, onCancel }) => {
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [cardType, setCardType] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  // Populate form with existing payment method data if editing
  useEffect(() => {
    if (existingPaymentMethod) {
      setCardholderName(existingPaymentMethod.cardholderName || '');
      // Only show last 4 digits of card number for security
      setCardNumber(existingPaymentMethod.lastFourDigits ? `•••• •••• •••• ${existingPaymentMethod.lastFourDigits}` : '');
      setExpiryDate(existingPaymentMethod.expiryDate || '');
      setIsDefault(existingPaymentMethod.isDefault || false);
      setCardType(existingPaymentMethod.cardType || '');
      // Don't populate CVV for security reasons
    }
  }, [existingPaymentMethod]);

  // Format card number with spaces every 4 digits and detect card type
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    
    // Format with spaces every 4 digits
    for (let i = 0; i < value.length; i += 4) {
      formattedValue += value.slice(i, i + 4) + ' ';
    }
    
    // Trim extra space at the end
    formattedValue = formattedValue.trim();
    
    // Detect card type
    const firstDigit = value.charAt(0);
    const firstTwoDigits = value.substring(0, 2);
    
    if (firstDigit === '4') {
      setCardType('Visa');
    } else if (firstTwoDigits >= '51' && firstTwoDigits <= '55') {
      setCardType('Mastercard');
    } else if (firstTwoDigits === '34' || firstTwoDigits === '37') {
      setCardType('Amex');
    } else if (value.length >= 2) {
      setCardType('Unknown');
    } else {
      setCardType('');
    }
    
    setCardNumber(formattedValue);
  };

  // Format expiry date as MM/YY
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      // Format month
      if (value.length <= 2) {
        setExpiryDate(value);
      } 
      // Format month/year
      else {
        setExpiryDate(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
      }
    } else {
      setExpiryDate('');
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!cardNumber.trim() || cardNumber.replace(/\D/g, '').length < 15) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    
    if (!expiryDate || !expiryDate.includes('/')) {
      newErrors.expiryDate = 'Valid expiry date is required (MM/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Month must be between 1 and 12';
      } else if (
        (parseInt(year) < currentYear) || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'Valid CVV is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const lastFourDigits = cardNumber.replace(/\D/g, '').slice(-4);
      
      // Create payment method object
      const paymentMethod = {
        id: existingPaymentMethod?.id || uuidv4(),
        cardholderName,
        lastFourDigits,
        expiryDate,
        cardType,
        isDefault,
        updatedAt: new Date().toISOString()
      };
      
      // If not editing, add createdAt field
      if (!existingPaymentMethod) {
        paymentMethod.createdAt = new Date().toISOString();
      }
      
      // Determine if this is an update or a new payment method
      if (existingPaymentMethod) {
        // For updating an existing payment method
        // Get current payment methods
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('User document not found');
        }
        
        const userData = userDoc.data();
        const existingMethods = userData.paymentMethods || [];
        
        // Replace the existing payment method with the updated one
        const updatedMethods = existingMethods.map(pm => 
          pm.id === paymentMethod.id ? paymentMethod : pm
        );
        
        // Update in Firestore
        await updateDoc(userRef, {
          paymentMethods: updatedMethods
        });
      } else {
        // For adding a new payment method
        const result = await userService.savePaymentMethod(currentUser.uid, paymentMethod);
        
        if (!result.success) {
          throw new Error(result.error || "Failed to save payment method");
        }
      }
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(paymentMethod);
      } else {
        // Navigate back to payment methods page
        navigate('/account/payment-methods');
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
      setErrors({ general: "Failed to save payment method. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="save-payment-method-form">
      <h2>{existingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}</h2>
      
      {errors.general && <div className="error-message">{errors.general}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cardholderName">Cardholder Name</label>
          <input
            type="text"
            id="cardholderName"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Name on card"
            disabled={loading}
          />
          {errors.cardholderName && <span className="error">{errors.cardholderName}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <div className="card-input-container">
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              disabled={loading || existingPaymentMethod}
            />
            {cardType && <span className={`card-type ${cardType}`}>{cardType}</span>}
          </div>
          {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              placeholder="MM/YY"
              maxLength="5"
              disabled={loading}
            />
            {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
          </div>
          
          <div className="form-group cvv-group">
            <label htmlFor="cvv">CVV</label>
            <input
              type="password"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
              placeholder="123"
              maxLength="4"
              disabled={loading}
            />
            <div className="cvv-icon"></div>
            <div className="cvv-tooltip">
              <p>The 3-digit security code on the back of your card. For American Express, it's the 4-digit code on the front.</p>
            </div>
            {errors.cvv && <span className="error">{errors.cvv}</span>}
          </div>
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="isDefault">Set as default payment method</label>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={onCancel || (() => navigate('/account/payment-methods'))}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="save-button"
            disabled={loading}
          >
            Save Payment Method
          </button>
        </div>
      </form>
    </div>
  );
};

export default SavePaymentMethodForm;