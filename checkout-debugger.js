// src/checkout-debugger.js
// Add this file to your project to help debug Stripe issues

// Function to inspect the stripeWrapperRef in your Checkout component
export const debugStripeWrapper = (ref) => {
  console.log("=== STRIPE WRAPPER DEBUG ===");
  console.log("Ref exists:", !!ref);
  console.log("Ref.current exists:", !!(ref && ref.current));
  
  if (ref && ref.current) {
    console.log("submitPayment method exists:", typeof ref.current.submitPayment === 'function');
    console.log("Methods available on ref.current:", Object.getOwnPropertyNames(ref.current));
  }
  
  // Check if ref is properly forwarded
  if (ref && !ref.current) {
    console.error("⚠️ REF ISSUE: The ref is not properly forwarded to the StripeWrapper component");
    console.log("Try checking your component order and make sure you're using React.forwardRef correctly");
  }
  
  // Check if window global setup is correct
  console.log("window.stripeWrapperRef exists:", !!window.stripeWrapperRef);
  
  if (window.stripeWrapperRef !== ref) {
    console.error("⚠️ REF MISMATCH: window.stripeWrapperRef is not the same as the ref");
  }
};

// Function to check Stripe API key
export const debugStripeKey = () => {
  const key = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  console.log("=== STRIPE KEY DEBUG ===");
  console.log("Key exists:", !!key);
  if (key) {
    console.log("Key type:", key.startsWith('pk_live_') ? 'LIVE' : 'TEST');
    console.log("Key prefix:", key.substring(0, 10) + "...");
  }
  
  // Check if HTTP/HTTPS setup is correct
  console.log("Protocol:", window.location.protocol);
  
  if (key && key.startsWith('pk_live_') && window.location.protocol !== 'https:') {
    console.error("⚠️ HTTPS ISSUE: Using a LIVE key over HTTP");
    console.log("Solutions: 1) Use a test key for development OR 2) Set up HTTPS locally");
  }
};

// Add this to your Checkout.js, right before your handleProcessPayment function:
// 
// Add this import:
// import { debugStripeWrapper, debugStripeKey } from './checkout-debugger';
//
// Then modify handleProcessPayment start:
// const handleProcessPayment = async () => {
//   setLoading(true);
//   setError('');
//
//   // Debug the Stripe setup
//   debugStripeKey();
//   debugStripeWrapper(stripeWrapperRef);
//
//   try {
//     // Rest of your function...