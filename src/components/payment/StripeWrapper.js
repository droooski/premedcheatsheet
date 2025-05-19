// src/components/payment/StripeWrapper.js - Updated to handle the payment submission differently
import React, { useEffect, useState, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardElement from './StripeCardElement';

const StripeWrapper = ({ onSuccess, onError, processingPayment, children }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stripeElementRef = useRef(null);

  // Expose payment submission method to parent
  const handleSubmitPayment = () => {
    if (stripeElementRef.current) {
      return StripeCardElement.handlePaymentSubmit(stripeElementRef);
    }
    return false;
  };

  useEffect(() => {
    // Use a try-catch to handle potential errors when loading Stripe
    const initializeStripe = async () => {
      try {
        // Load the Stripe publishable key from environment variables
        const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
          console.warn('Stripe publishable key not found in environment variables. Using test key.');
          // Fallback to a test key if environment variable is missing
          setStripePromise(loadStripe('pk_test_51POBOwHQeGJfTtmjdl7zRS7BIfXaBMlhDX3w3swTGiRc8qNmm0eKZpQUypPcH0nzPtxfUsrYpUDlO4xxSGURwWjY00qM4Kjv55'));
        } else {
          setStripePromise(loadStripe(stripeKey));
        }
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

  // Expose the submit payment method to the parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.submitStripePayment = handleSubmitPayment;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.submitStripePayment;
      }
    };
  }, []);

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
        ref={stripeElementRef}
        onSuccess={onSuccess}
        onError={onError}
        processingPayment={processingPayment}
      />
      {children}
    </Elements>
  ) : null;
};

// Expose the payment submission method
StripeWrapper.submitPayment = function() {
  if (typeof window !== 'undefined' && window.submitStripePayment) {
    return window.submitStripePayment();
  }
  return false;
};

export default StripeWrapper;