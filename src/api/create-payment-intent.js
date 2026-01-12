// backend/api/create-payment-intent.js (Node.js/Express example)
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_NEW);
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

const router = express.Router();

// Create payment intent endpoint
router.post("/create-payment-intent", async (req, res) => {
  try {
    const {
      amount,
      currency = "usd",
      plan,
      userId,
      discount = 0,
      couponCode = "",
    } = req.body;

    // Validate required fields
    if (!amount || !plan) {
      return res.status(400).json({ error: "Amount and plan are required" });
    }

    // Calculate final amount after discount
    const baseAmount = Math.round(amount); // Amount should already be in cents
    const discountAmount = Math.round((baseAmount * discount) / 100);
    const finalAmount = Math.max(baseAmount - discountAmount, 0);

    // Create order record in Firestore first
    const orderData = {
      userId: userId || "guest",
      amount: finalAmount / 100, // Store in dollars
      baseAmount: baseAmount / 100,
      discount: discount,
      couponCode: couponCode,
      plan: plan,
      planName: getPlanDisplayName(plan),
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = await db.collection("orders").add(orderData);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: currency,
      metadata: {
        orderId: orderRef.id,
        plan: plan,
        userId: userId || "guest",
        couponCode: couponCode,
        discount: discount.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    await orderRef.update({
      stripePaymentIntentId: paymentIntent.id,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderRef.id,
      amount: finalAmount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: error.message || "Failed to create payment intent",
    });
  }
});

// Webhook endpoint to handle successful payments
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        await handleFailedPayment(failedPayment);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    const userId = paymentIntent.metadata.userId;

    if (!orderId) {
      console.error("No order ID in payment intent metadata");
      return;
    }

    // Update order status
    await db.collection("orders").doc(orderId).update({
      status: "completed",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      stripePaymentIntentId: paymentIntent.id,
    });

    // Update user subscription if userId exists and is not 'guest'
    if (userId && userId !== "guest") {
      await updateUserSubscription(userId, paymentIntent.metadata, orderId);
    }

    console.log("Payment processed successfully for order:", orderId);
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await db.collection("orders").doc(orderId).update({
        status: "failed",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        stripePaymentIntentId: paymentIntent.id,
      });
    }

    console.log("Payment failed for order:", orderId);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

// Update user subscription
async function updateUserSubscription(userId, metadata, orderId) {
  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error("User document not found:", userId);
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
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    // Update user document
    await userRef.update({
      orders: admin.firestore.FieldValue.arrayUnion(userOrderData),
      subscriptions: admin.firestore.FieldValue.arrayUnion(subscriptionData),
      paymentVerified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("User subscription updated for:", userId);
  } catch (error) {
    console.error("Error updating user subscription:", error);
  }
}

// Helper functions
function getPlanDisplayName(planCode) {
  switch (planCode) {
    case "cheatsheet":
      return "The Profiles";
    case "cheatsheet-plus":
      return "The Profiles+";
    case "application":
      return "Application Cheatsheet";
    case "application-plus":
      return "Application Cheatsheet+";
    default:
      return planCode;
  }
}

function getSubscriptionEndDate(plan) {
  const now = new Date();
  // For one-time purchases, set to 1 year by default
  return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
}

module.exports = router;
