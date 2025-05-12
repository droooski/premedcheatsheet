// src/services/paymentService.js
import { db } from '../firebase/config';
import { doc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';

// Note: In a real implementation, payment processing would be handled by a back-end server
// The front-end should only collect payment information and send it to the server
// This service simulates client-side payment processing for demonstration purposes

// Get Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Function to load Stripe.js asynchronously
const loadStripe = async () => {
  if (!window.Stripe) {
    // Load Stripe.js dynamically
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.body.appendChild(script);
    
    // Wait for Stripe to load
    return new Promise((resolve) => {
      script.onload = () => {
        resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY));
      };
    });
  } else {
    return window.Stripe(STRIPE_PUBLISHABLE_KEY);
  }
};

// Process payment with Stripe
export const processPayment = async (paymentDetails, userId, orderDetails) => {
  try {
    // In a real implementation, you would:
    // 1. Send payment details to your server
    // 2. Server would create a payment intent with Stripe
    // 3. Server would return client secret
    // 4. Client would confirm payment with Stripe using client secret
    
    // This is a simulated payment process for demonstration
    console.log('Processing payment:', paymentDetails);
    
    // Create an order in Firestore
    const orderData = {
      userId: userId || 'guest',
      amount: orderDetails.amount,
      plan: orderDetails.plan,
      status: 'processing',
      createdAt: serverTimestamp(),
    };
    
    // Add order to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update order status to completed
    await updateDoc(doc(db, 'orders', orderRef.id), {
      status: 'completed',
      paymentId: `sim_${Math.random().toString(36).substring(2, 15)}`,
      completedAt: serverTimestamp(),
    });
    
    // If user is authenticated, add subscription to user document
    if (userId) {
      // Get user document reference
      const userRef = doc(db, 'users', userId);
      
      // Add subscription to user document
      await updateDoc(userRef, {
        subscriptions: [
          // Add new subscription
          {
            plan: orderDetails.plan,
            startDate: new Date().toISOString(),
            endDate: orderDetails.plan === 'monthly' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            orderId: orderRef.id,
            active: true,
          }
        ]
      });
    }
    
    return {
      success: true,
      orderId: orderRef.id,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error.message || 'Payment processing failed',
    };
  }
};

// For Stripe integration in a real-world scenario
export const processStripePayment = async (paymentDetails, userId, orderDetails) => {
  try {
    // Initialize Stripe
    const stripe = await loadStripe();
    
    // In a real implementation, you would:
    // 1. Call your backend API to create a payment intent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: orderDetails.amount * 100, // Convert to cents
        currency: 'usd',
        plan: orderDetails.plan,
        userId: userId || 'guest',
      }),
    });
    
    const { clientSecret } = await response.json();
    
    // 2. Confirm the payment with Stripe.js
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          number: paymentDetails.cardNumber,
          exp_month: parseInt(paymentDetails.expiry.split('/')[0], 10),
          exp_year: parseInt(paymentDetails.expiry.split('/')[1], 10),
          cvc: paymentDetails.cvc,
        },
        billing_details: {
          name: paymentDetails.cardholderName,
          email: paymentDetails.email,
        },
      },
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    if (result.paymentIntent.status === 'succeeded') {
      // Payment succeeded, create order in database
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: userId || 'guest',
        amount: orderDetails.amount,
        plan: orderDetails.plan,
        status: 'completed',
        stripePaymentIntentId: result.paymentIntent.id,
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
      });
      
      // If user is authenticated, add subscription to user document
      if (userId) {
        // Get user document reference
        const userRef = doc(db, 'users', userId);
        
        // Add subscription to user document
        await updateDoc(userRef, {
          subscriptions: [
            // Add new subscription
            {
              plan: orderDetails.plan,
              startDate: new Date().toISOString(),
              endDate: orderDetails.plan === 'monthly' 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              orderId: orderRef.id,
              active: true,
            }
          ]
        });
      }
      
      return {
        success: true,
        orderId: orderRef.id,
      };
    } else {
      throw new Error('Payment processing failed');
    }
  } catch (error) {
    console.error('Stripe payment processing error:', error);
    return {
      success: false,
      error: error.message || 'Payment processing failed',
    };
  }
};