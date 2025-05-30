// src/components/payment/StripeCardElement.js
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import './StripeCardElement.scss';

const StripeCardElement = forwardRef((props, ref) => {
  const { onSuccess, onError, processingPayment } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [focused, setFocused] = useState(false);

  // Enhanced Stripe Card Element styling with better visual appearance
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#9ca3af',
        },
        fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSmoothing: 'antialiased',
        lineHeight: '24px',
        letterSpacing: '0.025em',
        // Remove default padding since we're adding it via CSS
        padding: '0',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#059669',
        iconColor: '#059669',
      },
    },
    hidePostalCode: false, // Show postal code field
  };

  // Handle card input changes
  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : '');
    if (onError && event.error) {
      onError(event.error.message);
    }
  };

  // Handle focus events for better visual feedback
  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  // Submit payment method creation
  const handleSubmit = async () => {
    if (!stripe || !elements) {
      console.error('Stripe not loaded');
      setError('Payment system not ready. Please try again.');
      return { success: false, error: 'Payment system not ready' };
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        console.error('Payment method creation failed:', paymentMethodError);
        setError(paymentMethodError.message);
        if (onError) onError(paymentMethodError.message);
        return { success: false, error: paymentMethodError.message };
      }

      console.log('Payment method created successfully:', paymentMethod);
      
      if (onSuccess) {
        onSuccess(paymentMethod);
      }

      return { success: true, paymentMethod };

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message);
      if (onError) onError(error.message);
      return { success: false, error: error.message };
    } finally {
      setProcessing(false);
    }
  };

  // Expose handleSubmit method to parent
  useImperativeHandle(ref, () => ({
    handleSubmit
  }), [stripe, elements]);

  return (
    <div className="stripe-card-element-container">
      <div className={`card-element-wrapper ${focused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        <div className="card-element-label">
          Card information
        </div>
        <div className="card-element-input">
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div className="card-element-icons">
          {/* Simple text-based card indicators */}
          <div className="card-brand visa">VISA</div>
          <div className="card-brand mastercard">MC</div>
          <div className="card-brand amex">AMEX</div>
        </div>
      </div>
      
      {error && (
        <div className="card-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM8.75 11.75H7.25V10.25H8.75V11.75ZM8.75 8.75H7.25V4.25H8.75V8.75Z" fill="#ef4444"/>
          </svg>
          {error}
        </div>
      )}
      
      {(processing || processingPayment) && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          Processing payment...
        </div>
      )}
    </div>
  );
});

export default StripeCardElement;