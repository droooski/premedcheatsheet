// src/services/paymentService.js - Enhanced with stronger validation
import { getFirestore, doc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import app from '../firebase/config'; // Import the Firebase app instance, not db directly

// Initialize Firestore directly in this file to ensure it's properly set up
const db = getFirestore(app);

// Get Stripe publishable key from environment variables
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Function to add subscription to user document
const addSubscriptionToUser = async (userId, plan, orderId) => {
  try {
    // Validate required parameters
    if (!userId) throw new Error('User ID is required');
    if (!plan) throw new Error('Subscription plan is required');
    if (!orderId) throw new Error('Order ID is required');
    
    // Get user document reference
    const userRef = doc(db, 'users', userId);
    
    // Calculate subscription end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year
    }
    
    // Add subscription to user document
    await updateDoc(userRef, {
      subscriptions: [{
        plan: plan,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        orderId: orderId,
        active: true,
      }]
    });
    
    console.log(`Subscription added for user: ${userId}, plan: ${plan}`);
    return true;
  } catch (error) {
    console.error("Error adding subscription to user:", error);
    return false;
  }
};

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

// Process payment
export const processPayment = async (paymentDetails, userId, orderDetails) => {
  try {
    console.log('Processing payment:', { userId, orderDetails, isFree: orderDetails.isFree });
    
    // Enforce user authentication for all transactions
    if (!userId || userId === 'guest') {
      throw new Error('You must be logged in to complete this purchase');
    }
    
    // Validate payment details for non-free purchases
    if (!orderDetails.isFree && (!paymentDetails || !paymentDetails.number)) {
      throw new Error('Complete payment information is required');
    }
    
    // Create an order in Firestore
    const orderData = {
      userId: userId, // No more 'guest' userId allowed
      amount: orderDetails.amount,
      plan: orderDetails.plan,
      status: 'processing', // Start as processing
      createdAt: new Date().toISOString(),
      couponCode: orderDetails.couponCode || null,
      discount: orderDetails.discount || 0,
      isFree: orderDetails.isFree || false
    };
    
    // Add order to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('Order created with ID:', orderRef.id);
    
    // For free purchases with 100% discount, mark as completed immediately
    if (orderDetails.isFree) {
      console.log('Processing free order with 100% discount');
      
      // Validate the discount is exactly 100%
      if (orderDetails.discount !== 100) {
        throw new Error('Invalid discount amount for free purchase');
      }
      
      // Update order status to completed
      await updateDoc(doc(db, 'orders', orderRef.id), {
        status: 'completed',
        paymentId: `free_${Math.random().toString(36).substring(2, 15)}`,
        completedAt: new Date().toISOString(),
      });
      
      // Add subscription to user document
      const subscriptionAdded = await addSubscriptionToUser(userId, orderDetails.plan, orderRef.id);
      
      if (!subscriptionAdded) {
        throw new Error('Failed to add subscription to user account');
      }
      
      return {
        success: true,
        orderId: orderRef.id,
        message: 'Free access granted!'
      };
    }
    
    // For paid purchases, process the payment
    // In production, use Stripe or other payment processor
    
    // Basic payment validation
    if (!paymentDetails.number || paymentDetails.number.replace(/\s/g, '').length < 15) {
      throw new Error('Invalid card number');
    }
    
    if (!paymentDetails.expiry || !paymentDetails.expiry.includes('/')) {
      throw new Error('Invalid expiry date (use MM/YY format)');
    }
    
    if (!paymentDetails.cvc || paymentDetails.cvc.length < 3) {
      throw new Error('Invalid CVC code');
    }
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update order status to completed
    await updateDoc(doc(db, 'orders', orderRef.id), {
      status: 'completed',
      paymentId: `sim_${Math.random().toString(36).substring(2, 15)}`,
      completedAt: new Date().toISOString(),
    });
    
    // Add subscription to user document
    const subscriptionAdded = await addSubscriptionToUser(userId, orderDetails.plan, orderRef.id);
    
    if (!subscriptionAdded) {
      throw new Error('Failed to add subscription to user account');
    }
    
    return {
      success: true,
      orderId: orderRef.id,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    
    // If we created an order but payment failed, update order status
    if (error.orderId) {
      try {
        await updateDoc(doc(db, 'orders', error.orderId), {
          status: 'failed',
          error: error.message
        });
      } catch (updateError) {
        console.error('Failed to update order status:', updateError);
      }
    }
    
    return {
      success: false,
      error: error.message || 'Payment processing failed',
    };
  }
};

// For Stripe integration in a real-world scenario
export const processStripePayment = async (paymentDetails, userId, orderDetails) => {
  try {
    // Enforce user authentication
    if (!userId || userId === 'guest') {
      throw new Error('You must be logged in to complete this purchase');
    }
    
    // Initialize Stripe
    const stripe = await loadStripe();
    
    // Handle free purchases with 100% discount
    if (orderDetails.isFree) {
      return processPayment(null, userId, orderDetails);
    }
    
    // Validate payment details
    if (!paymentDetails || !paymentDetails.number || !paymentDetails.expiry || !paymentDetails.cvc) {
      throw new Error('Complete payment information is required');
    }
    
    // Call your backend API to create a payment intent
    // Note: In production, this should point to your actual API endpoint
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: orderDetails.amount * 100, // Convert to cents
        currency: 'usd',
        plan: orderDetails.plan,
        userId: userId,
        couponCode: orderDetails.couponCode,
        discount: orderDetails.discount
      }),
    });
    
    // Handle API response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment intent');
    }
    
    const { clientSecret } = await response.json();
    
    // Create an order record first
    const orderData = {
      userId: userId,
      amount: orderDetails.amount,
      plan: orderDetails.plan,
      status: 'processing',
      createdAt: new Date().toISOString(),
      couponCode: orderDetails.couponCode || null,
      discount: orderDetails.discount || 0,
      isFree: false
    };
    
    // Add order to Firestore
    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('Order created with ID:', orderRef.id);
    
    // Confirm the payment with Stripe.js
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          number: paymentDetails.number,
          exp_month: parseInt(paymentDetails.expiry.split('/')[0], 10),
          exp_year: parseInt(paymentDetails.expiry.split('/')[1], 10),
          cvc: paymentDetails.cvc,
        },
        billing_details: {
          name: paymentDetails.name,
          email: paymentDetails.email || userId,
        },
      },
    });
    
    if (result.error) {
      // Update order status to failed
      await updateDoc(doc(db, 'orders', orderRef.id), {
        status: 'failed',
        error: result.error.message
      });
      
      throw new Error(result.error.message);
    }
    
    if (result.paymentIntent.status === 'succeeded') {
      // Payment succeeded, update order status to completed
      await updateDoc(doc(db, 'orders', orderRef.id), {
        status: 'completed',
        stripePaymentIntentId: result.paymentIntent.id,
        completedAt: new Date().toISOString(),
      });
      
      // Add subscription to user document
      const subscriptionAdded = await addSubscriptionToUser(userId, orderDetails.plan, orderRef.id);
      
      if (!subscriptionAdded) {
        throw new Error('Failed to add subscription to user account');
      }
      
      return {
        success: true,
        orderId: orderRef.id,
      };
    } else {
      // Update order status to failed
      await updateDoc(doc(db, 'orders', orderRef.id), {
        status: 'failed',
        error: 'Payment intent did not succeed'
      });
      
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