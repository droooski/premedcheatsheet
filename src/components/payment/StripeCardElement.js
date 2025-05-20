// src/components/payment/StripeCardElement.js
import React, { useState, forwardRef, useImperativeHandle } from 'react';
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

/**
 * This component renders a Stripe card input and handles payment submissions.
 * It processes payments directly on your site without redirecting to third-party sites.
 */
const StripeCardElement = forwardRef(({ onSuccess, onError, processingPayment }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardError, setCardError] = useState(null);

  // The handleSubmit function that processes the payment
  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (!stripe || !elements) {
      setCardError("Payment system is not ready. Please try again.");
      onError && onError("Payment system is not ready. Please try again.");
      return false;
    }

    if (!cardholderName) {
      setCardError("Please enter the cardholder's name");
      onError && onError("Please enter the cardholder's name");
      return false;
    }

    if (!cardComplete) {
      setCardError("Please complete your card information");
      onError && onError("Please complete your card information");
      return false;
    }

    try {
      // Get a reference to a mounted CardElement
      const cardElement = elements.getElement(CardElement);

      // Create a payment method with the card element
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
        return false;
      }

      console.log('Payment method created successfully:', paymentMethod);
      
      // Pass the payment method to parent component
      onSuccess && onSuccess(paymentMethod);
      return true;
    } catch (err) {
      console.error('Stripe payment error:', err);
      setCardError(err.message);
      onError && onError(err.message);
      return false;
    }
  };

  // Expose the handleSubmit method to parent components
  useImperativeHandle(ref, () => ({
    handleSubmit
  }));

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
                setCardComplete(e.complete);
                if (e.error) {
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