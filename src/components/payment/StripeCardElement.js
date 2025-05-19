// Modified StripeCardElement.js to position the Pay Now button after billing address
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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

const StripeCardElement = ({ onSuccess, onError, processingPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (!cardholderName) {
      setCardError("Please enter the cardholder's name");
      onError("Please enter the cardholder's name");
      return;
    }

    if (!cardComplete) {
      setCardError("Please complete your card information");
      onError("Please complete your card information");
      return;
    }

    // Get a reference to a mounted CardElement
    const cardElement = elements.getElement(CardElement);

    // For demo/test purposes - simulate success
    // In production, this would call your backend API to create a payment intent
    // and then confirm the payment with Stripe
    
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        onSuccess({
          paymentMethod: {
            id: `pm_${Math.random().toString(36).substr(2, 9)}`,
            card: {
              brand: 'visa',
              last4: '4242'
            }
          }
        });
      }, 2000);
      return;
    }

    // For production use:
    try {
      // Create a payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        setCardError(error.message);
        onError(error.message);
        return;
      }

      // Pass the payment method to parent component
      onSuccess(paymentMethod);
    } catch (err) {
      setCardError(err.message);
      onError(err.message);
    }
  };

  return (
    <div className="stripe-card-element">
      <form onSubmit={handleSubmit} className="stripe-form">
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
                    onError(e.error.message);
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
        
        {/* This button will be rendered after the billing address via CSS */}
        <button 
          type="submit" 
          className="payment-button"
          disabled={!stripe || processingPayment}
        >
          {processingPayment ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default StripeCardElement;