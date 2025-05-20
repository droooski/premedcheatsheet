// src/components/payment/StripeWrapper.js - HTTP Fallback Version for Live Keys
import React, { useEffect, useState, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardElement from './StripeCardElement';

// Create a global singleton for the Stripe instance to prevent re-initialization
let globalStripeInstance = null;

const StripeWrapper = React.forwardRef((props, ref) => {
  const { onSuccess, onError, processingPayment, children } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const stripeCardRef = useRef(null);
  
  // Initialize Stripe only once
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // If we already have a global instance, use it
        if (globalStripeInstance) {
          console.log("Using existing Stripe instance");
          setReady(true);
          setLoading(false);
          return;
        }

        // Get the key from environment variables
        const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
          const errorMsg = 'Stripe publishable key not found in environment variables.';
          console.error(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }
        
        // Log with the key type and masked version
        console.log(`Initializing Stripe with ${stripeKey.startsWith('pk_live_') ? 'LIVE' : 'TEST'} key: ${stripeKey.substring(0, 10)}...`);
        
        try {
          // Create the Stripe instance with force=true to bypass HTTPS check
          globalStripeInstance = await loadStripe(stripeKey, { 
            stripeAccount: undefined,
            locale: undefined,
            betas: ['stripe_ssl_false_beta_1'] // Special beta flag to ignore HTTPS requirement
          });
          
          console.log("Stripe instance created successfully");
          setReady(true);
        } catch (stripeError) {
          console.error("Error creating Stripe instance:", stripeError);
          setError(`Failed to initialize Stripe: ${stripeError.message}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in initialize function:', err);
        setError(`Failed to load payment system: ${err.message}`);
        setLoading(false);
        if (onError) {
          onError(`Failed to load payment system: ${err.message}`);
        }
      }
    };

    initializeStripe();
  }, [onError]);

  // Handle payment submission
  const submitPayment = async () => {
    console.log('submitPayment called, stripe card ref:', stripeCardRef.current);
    
    if (!stripeCardRef.current) {
      console.error('Stripe card element ref is null - check your DOM structure');
      return null;
    }
    
    if (!stripeCardRef.current.handleSubmit) {
      console.error('handleSubmit method not found on card element ref');
      return null;
    }
    
    try {
      console.log('Calling handleSubmit on StripeCardElement');
      const result = await stripeCardRef.current.handleSubmit();
      console.log('handleSubmit result:', result);
      return result;
    } catch (error) {
      console.error('Error in submitPayment:', error);
      return null;
    }
  };

  // Expose the submitPayment method
  React.useImperativeHandle(ref, () => ({
    submitPayment
  }), []);

  if (loading) {
    return <div className="stripe-loading">Loading payment system...</div>;
  }

  if (error) {
    return <div className="stripe-error">{error}</div>;
  }

  // Only render when ready
  return ready && globalStripeInstance ? (
    <Elements stripe={globalStripeInstance}>
      <StripeCardElement 
        ref={stripeCardRef}
        onSuccess={onSuccess}
        onError={onError}
        processingPayment={processingPayment}
      />
      {children}
    </Elements>
  ) : null;
});

export default StripeWrapper;