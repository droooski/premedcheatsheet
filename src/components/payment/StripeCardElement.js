// src/components/payment/StripeCardElement.js - ESLint Fix
import React, { useState, useCallback } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './StripeCardElement.scss';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      },
    },
    invalid: {
      color: '#e53e3e',
      iconColor: '#e53e3e'
    }
  },
  hidePostalCode: true,
};

// Using a named function component with forwardRef for better debugging
const StripeCardElement = React.forwardRef(function StripeCardElement(props, ref) {
  const { onSuccess, onError } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardError, setCardError] = useState(null);

  // Wrap handleSubmit in useCallback to avoid linting warnings
  // and ensure stable reference for useImperativeHandle
  const handleSubmit = useCallback(async () => {
    console.log('StripeCardElement.handleSubmit called');
    console.log('- stripe:', !!stripe);
    console.log('- elements:', !!elements);
    console.log('- cardComplete:', cardComplete);
    console.log('- cardholderName:', cardholderName);

    if (!stripe || !elements) {
      const errorMsg = "Payment system is not ready. Please try again.";
      console.error(errorMsg);
      setCardError(errorMsg);
      onError && onError(errorMsg);
      return null;
    }

    if (!cardholderName) {
      const errorMsg = "Please enter the cardholder's name";
      console.error(errorMsg);
      setCardError(errorMsg);
      onError && onError(errorMsg);
      return null;
    }

    if (!cardComplete) {
      const errorMsg = "Please complete your card information";
      console.error(errorMsg);
      setCardError(errorMsg);
      onError && onError(errorMsg);
      return null;
    }

    try {
      // Get a reference to a mounted CardElement
      const cardElement = elements.getElement(CardElement);
      console.log('- CardElement obtained:', !!cardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create a payment method with the card element
      console.log('Creating payment method...');
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        console.error('Error creating payment method:', error);
        setCardError(error.message);
        onError && onError(error.message);
        return null;
      }

      console.log('Payment method created successfully:', paymentMethod);
      
      // Pass the payment method to parent component
      onSuccess && onSuccess(paymentMethod);
      return { success: true, paymentMethod };
    } catch (err) {
      console.error('Stripe payment error:', err);
      setCardError(err.message);
      onError && onError(err.message);
      return null;
    }
  }, [stripe, elements, cardComplete, cardholderName, onSuccess, onError]);

  // Expose the handleSubmit method to parent components
  // Now we include handleSubmit in the dependencies array
  React.useImperativeHandle(ref, () => ({
    handleSubmit
  }), [handleSubmit]);

  return (
    <div className="stripe-card-element">
      <div className="card-input-section">
        <div className="form-group">
          <label htmlFor="cardholderName">NAME ON CARD</label>
          <input
            id="cardholderName"
            type="text"
            placeholder="Jane Smith"
            required
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="name-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cardElement">CARD DETAILS</label>
          <div className="card-element-container">
            <CardElement 
              id="cardElement"
              options={CARD_ELEMENT_OPTIONS} 
              onChange={(e) => {
                console.log('Card element change:', e.complete ? 'complete' : 'incomplete');
                setCardComplete(e.complete);
                if (e.error) {
                  console.error('Card element error:', e.error.message);
                  setCardError(e.error.message);
                  onError && onError(e.error.message);
                } else {
                  setCardError(null);
                }
              }}
            />
          </div>
        </div>
        
        {cardError && (
          <div className="card-error">
            {cardError}
          </div>
        )}
      </div>
    </div>
  );
});

export default StripeCardElement;