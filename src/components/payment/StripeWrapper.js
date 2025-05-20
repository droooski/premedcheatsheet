// src/components/payment/StripeWrapper.js
import React, { useEffect, useState, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardElement from './StripeCardElement';

/**
 * This component initializes Stripe and provides the Elements context
 * for the Stripe card element. It uses your Stripe publishable key from .env
 */
const StripeWrapper = ({ onSuccess, onError, processingPayment, children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stripeCardRef = useRef(null);

  // Initialize Stripe when component mounts
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Load the Stripe publishable key from environment variables
        const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
          console.warn('Stripe publishable key not found in environment variables.');
          throw new Error('Missing Stripe publishable key');
        }
        
        // Initialize Stripe with the publishable key
        console.log('Initializing Stripe with key:', stripeKey.substring(0, 8) + '...');
        const stripe = await loadStripe(stripeKey);
        setStripePromise(stripe);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing Stripe:', err);
        setError('Failed to load payment system. Please try again later.');
        setLoading(false);
        if (onError) {
          onError('Failed to load payment system. Please try again later.');
        }
      }
    };

    initializeStripe();
  }, [onError]);

  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (stripeCardRef.current && stripeCardRef.current.handleSubmit) {
      try {
        return await stripeCardRef.current.handleSubmit();
      } catch (error) {
        console.error('Error submitting payment:', error);
        return false;
      }
    }
    return false;
  };

  // Expose the payment submission method to parent components
  React.useImperativeHandle(
    React.useRef,
    () => ({
      submitPayment: handleSubmitPayment
    })
  );

  if (loading) {
    return <div className="stripe-loading">Loading payment system...</div>;
  }

  if (error) {
    return <div className="stripe-error">{error}</div>;
  }

  // Only render the Elements provider when stripePromise is available
  return stripePromise ? (
    <Elements stripe={stripePromise}>
      <StripeCardElement 
        ref={stripeCardRef}
        onSuccess={onSuccess}
        onError={onError}
        processingPayment={processingPayment}
      />
      {children}
    </Elements>
  ) : null;
};

export default StripeWrapper;