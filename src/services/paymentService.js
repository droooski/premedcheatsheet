// src/services/paymentService.js - Correct version for production
import {
  getFirestore,
  doc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import app from "../firebase/config";

const db = getFirestore(app);

// API base URL - should point to your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

console.log("Payment service API URL:", API_BASE_URL); // Debug log

// Updated processPayment function with real backend integration
export const processPayment = async (paymentDetails, userId, orderDetails) => {
  try {
    console.log("Processing payment with backend:", paymentDetails);
    console.log("API URL being used:", API_BASE_URL);

    // For free purchases (100% discount)
    if (orderDetails.isFree || orderDetails.amount === 0) {
      return await processFreeOrder(userId, orderDetails);
    }

    // Create payment intent on backend
    console.log("Calling backend to create payment intent...");
    const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: orderDetails.amount, // Send in dollars, backend converts to cents
        currency: "usd",
        plan: orderDetails.plan,
        userId: userId || "guest",
        discount: orderDetails.discount || 0,
        couponCode: orderDetails.couponCode || "",
      }),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend response error:", errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const { clientSecret, orderId } = await response.json();
    console.log("Payment intent created:", {
      clientSecret: clientSecret?.substring(0, 20) + "...",
      orderId,
    });

    // Load Stripe and confirm payment
    const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      throw new Error("Stripe not loaded properly");
    }

    console.log("Confirming payment with Stripe...");
    // Confirm the payment with the payment method
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentDetails.paymentMethodId,
    });

    console.log("Payment confirmation result:", result);

    if (result.error) {
      console.error("Payment failed:", result.error);
      throw new Error(result.error.message);
    }

    if (result.paymentIntent.status === "succeeded") {
      console.log("Payment succeeded!");

      // The webhook will handle updating the order and user subscription
      // But we also update user subscription here for immediate UI feedback
      if (userId) {
        await updateUserWithSubscription(userId, orderDetails, orderId);
      }

      return {
        success: true,
        orderId: orderId,
        paymentIntentId: result.paymentIntent.id,
      };
    } else {
      throw new Error(`Payment status: ${result.paymentIntent.status}`);
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: error.message || "Payment processing failed",
    };
  }
};

// Process free orders (for 100% discount coupons)
const processFreeOrder = async (userId, orderDetails) => {
  try {
    console.log("Processing free order");

    // Create an order in Firestore for free purchase
    const orderData = {
      userId: userId || "guest",
      amount: 0,
      plan: orderDetails.plan,
      planName: getPlanDisplayName(orderDetails.plan),
      status: "completed",
      discount: orderDetails.discount || 100,
      couponCode: orderDetails.couponCode || "",
      isFree: true,
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(db, "orders"), orderData);

    // Update user document with subscription
    if (userId) {
      await updateUserWithSubscription(userId, orderDetails, orderRef.id);
    }

    return {
      success: true,
      orderId: orderRef.id,
    };
  } catch (error) {
    console.error("Free order processing error:", error);
    return {
      success: false,
      error: error.message || "Failed to process free order",
    };
  }
};

// Helper function to update user with subscription
const updateUserWithSubscription = async (userId, orderDetails, orderId) => {
  try {
    const userRef = doc(db, "users", userId);

    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.warn("User document not found, skipping subscription update");
      return;
    }

    const userData = userDoc.data();

    // Prepare the order data for user document
    const userOrderData = {
      orderId: orderId,
      plan: orderDetails.plan,
      planName: getPlanDisplayName(orderDetails.plan),
      amount: orderDetails.amount || 0,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    // Prepare the subscription data
    const subscriptionData = {
      plan: orderDetails.plan,
      startDate: new Date().toISOString(),
      endDate: getSubscriptionEndDate(orderDetails.plan),
      orderId: orderId,
      active: true,
    };

    // Update user document
    await updateDoc(userRef, {
      orders: [...(userData.orders || []), userOrderData],
      subscriptions: [...(userData.subscriptions || []), subscriptionData],
      paymentVerified: true,
    });

    console.log("User subscription updated successfully");
  } catch (error) {
    console.error("Error updating user subscription:", error);
    // Don't throw error here, as the payment already succeeded
  }
};

// Helper function to get subscription end date
const getSubscriptionEndDate = (plan) => {
  const now = new Date();
  // For one-time purchases, set to 1 year by default
  return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
};

// Helper function to get readable plan name
function getPlanDisplayName(planCode) {
  switch (planCode) {
    case "cheatsheet":
      return "The Premed Profiles";
    case "cheatsheet-plus":
      return "The Premed Profiles+";
    case "application":
      return "Application Cheatsheet";
    case "application-plus":
      return "Application Cheatsheet+";
    default:
      return planCode;
  }
}
