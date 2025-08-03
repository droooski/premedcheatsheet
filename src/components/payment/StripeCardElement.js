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
  const [complete, setComplete] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#9ca3af',
        },
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        lineHeight: '24px',
        letterSpacing: '0.01em',
        padding: '12px 0',
        iconColor: '#6b7280',
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
    hidePostalCode: false,
  };

  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : '');
    setComplete(event.complete);
    if (onError && event.error) {
      onError(event.error.message);
    }
  };

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

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

  useImperativeHandle(ref, () => ({
    handleSubmit
  }), [stripe, elements]);

  return (
    <div className="stripe-card-element-container">
      <div className="card-input-section">
        <label className="card-input-label">Card Information</label>

        <div className="card-element-icons" style={{ marginBottom: '8px' }}>
          <div className="card-brand-group" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: 0.8,
            flexWrap: 'wrap'
          }}>
            <img src="https://js.stripe.com/v3/fingerprinted/img/visa-365725566f9578a9589553aa9296d178.svg" alt="Visa" className="card-icon" style={{ height: '24px' }} />
            <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" className="card-icon" style={{ height: '24px' }} />
            <img src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg" alt="American Express" className="card-icon" style={{ height: '24px' }} />
            <img src="https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg" alt="Discover" className="card-icon" style={{ height: '24px' }} />
          </div>
        </div>

        <div className={`card-element-wrapper ${focused ? 'focused' : ''} ${error ? 'error' : ''} ${complete ? 'complete' : ''}`}>
          <div className="card-element-input">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <div className="card-input-help">
          Enter your card number, expiry date, CVC, and postal code
        </div>
      </div>

      {error && (
        <div className="card-error">
          <div className="error-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM8.75 11.75H7.25V10.25H8.75V11.75ZM8.75 8.75H7.25V4.25H8.75V8.75Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="error-text">{error}</span>
        </div>
      )}

      {(processing || processingPayment) && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>Processing payment...</span>
        </div>
      )}
    </div>
  );
});

export default StripeCardElement;
