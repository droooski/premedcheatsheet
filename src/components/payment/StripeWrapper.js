import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCardElement from './StripeCardElement';

// Load the Stripe publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripeWrapper = ({ onSuccess, onError, processingPayment }) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardElement 
        onSuccess={onSuccess}
        onError={onError}
        processingPayment={processingPayment}
      />
    </Elements>
  );
};

export default StripeWrapper;