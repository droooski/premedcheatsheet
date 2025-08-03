// backend/server.js - Complete Fixed Version
const express = require('express');
const cors = require('cors');

// Load environment variables first
require('dotenv').config();

// Initialize Stripe with error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY_NEW) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_NEW);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Stripe initialization error:', error.message);
}

// Initialize Firebase Admin with error handling
let admin, db;
try {
  admin = require('firebase-admin');
  
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
  
  db = admin.firestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - MUST be first middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://www.premedcheatsheet.com',
      'https://premedcheatsheet.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Webhook endpoint needs raw body - BEFORE express.json()
app.use('/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other endpoints
app.use(express.json({ limit: '10mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PremedCheatsheet Payment API', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  const status = {
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      stripe: !!stripe,
      firebase: !!db
    },
    environment: {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY_NEW,
      hasFirebaseProject: !!process.env.FIREBASE_PROJECT_ID,
      hasFirebaseEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasFirebaseKey: !!process.env.FIREBASE_PRIVATE_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  };
  
  res.json(status);
});

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    console.log('📝 Creating payment intent request received');
    console.log('🔧 Request body:', req.body);
    
    if (!stripe) {
      console.error('❌ Stripe not initialized');
      return res.status(500).json({ error: 'Stripe service unavailable' });
    }
    
    if (!db) {
      console.error('❌ Firebase not initialized');
      return res.status(500).json({ error: 'Database service unavailable' });
    }

    const { amount, currency = 'usd', plan, userId, discount = 0, couponCode = '' } = req.body;

    console.log('💰 Payment details:', { amount, plan, userId, discount });

    // Validate required fields
    if (!amount || !plan) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'Amount and plan are required' });
    }

    // Calculate final amount after discount
    const baseAmount = Math.round(amount * 100); // Convert to cents
    const discountAmount = Math.round((baseAmount * discount) / 100);
    const finalAmount = Math.max(baseAmount - discountAmount, 50); // Minimum 50 cents

    console.log('🧮 Amount calculation:', { baseAmount, discountAmount, finalAmount });

    // Create order record in Firestore first
    const orderData = {
      userId: userId || 'guest',
      amount: finalAmount / 100, // Store in dollars
      baseAmount: baseAmount / 100,
      discount: discount,
      couponCode: couponCode,
      plan: plan,
      planName: getPlanDisplayName(plan),
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = await db.collection('orders').add(orderData);
    console.log('📄 Order created:', orderRef.id);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: currency,
      metadata: {
        orderId: orderRef.id,
        plan: plan,
        userId: userId || 'guest',
        couponCode: couponCode,
        discount: discount.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('💳 Payment intent created:', paymentIntent.id);

    // Update order with payment intent ID
    await orderRef.update({
      stripePaymentIntentId: paymentIntent.id,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderRef.id,
      amount: finalAmount
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    });
  }
});

// Webhook endpoint to handle successful payments
app.post('/webhook', async (req, res) => {
  if (!stripe) {
    console.error('❌ Stripe not available for webhook');
    return res.status(500).json({ error: 'Stripe service unavailable' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('🔔 Webhook received:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
  try {
    if (!db) {
      console.error('❌ Database not available for payment processing');
      return;
    }

    const orderId = paymentIntent.metadata.orderId;
    const userId = paymentIntent.metadata.userId;
    
    console.log('✅ Processing successful payment for order:', orderId);

    if (!orderId) {
      console.error('❌ No order ID in payment intent metadata');
      return;
    }

    // Update order status
    await db.collection('orders').doc(orderId).update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      stripePaymentIntentId: paymentIntent.id,
    });

    console.log('✅ Order updated to completed:', orderId);

    // Update user subscription if userId exists and is not 'guest'
    if (userId && userId !== 'guest') {
      await updateUserSubscription(userId, paymentIntent.metadata, orderId);
    }

    console.log('✅ Payment processed successfully for order:', orderId);
  } catch (error) {
    console.error('❌ Error handling successful payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    if (!db) return;

    const orderId = paymentIntent.metadata.orderId;
    
    console.log('❌ Processing failed payment for order:', orderId);
    
    if (orderId) {
      await db.collection('orders').doc(orderId).update({
        status: 'failed',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        stripePaymentIntentId: paymentIntent.id,
      });
    }

    console.log('❌ Payment failed for order:', orderId);
  } catch (error) {
    console.error('❌ Error handling failed payment:', error);
  }
}

// Update user subscription
async function updateUserSubscription(userId, metadata, orderId) {
  try {
    if (!db) return;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error('❌ User document not found:', userId);
      return;
    }

    const userData = userDoc.data();
    const plan = metadata.plan;

    // Create subscription data
    const subscriptionData = {
      plan: plan,
      planName: getPlanDisplayName(plan),
      startDate: new Date().toISOString(),
      endDate: getSubscriptionEndDate(plan),
      orderId: orderId,
      active: true,
    };

    // Create order data for user record
    const userOrderData = {
      orderId: orderId,
      plan: plan,
      planName: getPlanDisplayName(plan),
      amount: parseFloat(metadata.amount) || 0,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    // Update user document
    await userRef.update({
      orders: admin.firestore.FieldValue.arrayUnion(userOrderData),
      subscriptions: admin.firestore.FieldValue.arrayUnion(subscriptionData),
      paymentVerified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ User subscription updated for:', userId);
  } catch (error) {
    console.error('❌ Error updating user subscription:', error);
  }
}

// Helper functions
function getPlanDisplayName(planCode) {
  switch(planCode) {
    case 'cheatsheet':
      return 'The Cheatsheet';
    case 'cheatsheet-plus':
      return 'The Cheatsheet+';
    case 'application':
      return 'Application Cheatsheet';
    case 'application-plus':
      return 'Application Cheatsheet+';
    default:
      return planCode;
  }
}

function getSubscriptionEndDate(plan) {
  const now = new Date();
  // For one-time purchases, set to 1 year by default
  return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
}

// Only start server in development (not for Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`💳 Payment API: http://localhost:${PORT}/api/create-payment-intent`);
    console.log(`🔗 Webhook: http://localhost:${PORT}/webhook`);
  });
}

// Export for Vercel serverless functions
module.exports = app;