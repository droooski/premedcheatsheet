// src/pages/Checkout/Checkout.js

/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import AuthModal from '../../components/auth/AuthModal';
import PricingCards from '../../components/PricingCards/PricingCards';
import { onAuthChange, registerUser } from '../../firebase/authService';
import { processPayment, processStripePayment } from '../../services/paymentService';
import StripeWrapper from '../../components/payment/StripeWrapper';
import { 
  getFirestore, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import './Checkout.scss';

const Checkout = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');
  const initialPlan = queryParams.get('plan') || 'cheatsheet';
  
  // State management
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [user, setUser] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('plan'); // 'plan', 'payment', 'review', 'confirmation'
  const [previousStep, setPreviousStep] = useState(null);
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    email: '',
    cardType: null
  });
  const [discountCodes] = useState({
    'PREMEDVIP': { rate: 10, description: 'VIP Discount' },
    'STUDENT2025': { rate: 20, description: 'Student Discount' },
    'PARTNER': { rate: 100, description: 'Partnership - 100% Off' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(mode === 'login');
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  const [useStripe, setUseStripe] = useState(true); // Default to using Stripe
  const [subscription, setSubscription] = useState({
    type: 'monthly', // or 'yearly'
    price: 5.99     // Default price
  });
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [pendingUserData, setPendingUserData] = useState(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  
  const navigate = useNavigate();

  const db = getFirestore();

  // Check for authenticated user on component mount
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      
      // If the user signs in and we're on the payment step, update the email field
      if (currentUser && currentUser.email && checkoutStep === 'payment') {
        setCardInfo(prev => ({
          ...prev,
          email: currentUser.email
        }));
      }
    });

    return () => unsubscribe();
  }, [checkoutStep]);

  // Handle URL parameters for authentication mode
  useEffect(() => {
    if (mode === 'login') {
      setShowAuthModal(true);
      setIsLoginMode(true);
    } else if (mode === 'signup') {
      setShowAuthModal(true);
      setIsLoginMode(false);
    }
  }, [mode]);

  // Set subscription details based on selected plan
useEffect(() => {
  // Set pricing based on the plan
  switch(selectedPlan) {
    case 'cheatsheet':
      setSubscription({
        type: 'onetime', // Changed from 'monthly' to 'onetime'
        price: 14.99     // Updated from 5.99 to 14.99
      });
      break;
    case 'cheatsheet-plus':
      setSubscription({
        type: 'onetime',  // Changed from 'monthly' to 'onetime'
        price: 29.99      // Updated from 9.99 to 29.99
      });
      break;
    case 'application':
      setSubscription({
        type: 'onetime',
        price: 19.99
      });
      break;
    case 'application-plus':
      setSubscription({
        type: 'onetime',
        price: 34.99
      });
      break;
    default:
      setSubscription({
        type: 'onetime',
        price: 14.99  // Updated default price
      });
  }
}, [selectedPlan]);

  // Redirect to profile after confirmation
  useEffect(() => {
    if (checkoutStep === 'confirmation' && orderId) {
      const timer = setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [checkoutStep, orderId, navigate]);

  // Proper step change that records previous step for back navigation
  const changeCheckoutStep = (newStep) => {
    setPreviousStep(checkoutStep);
    setCheckoutStep(newStep);
    console.log(`Changing from ${checkoutStep} to ${newStep}, previous step saved as ${checkoutStep}`);
  };

  // Proper back navigation that uses previous step
  const handleGoBack = () => {
    console.log("Back button pressed, current step:", checkoutStep, "previous step:", previousStep);
    
    // If we're on payment, go back to plan selection
    if (checkoutStep === 'payment') {
      setCheckoutStep('plan');
    }
    // If we're on review, go back to payment
    else if (checkoutStep === 'review') {
      setCheckoutStep('payment');
    }
    else {
      navigate(-1); // Use browser navigation as fallback
    }
  };

  // Handle plan selection
  const handleSelectPlan = (plan, couponInfo = {}) => {
    setSelectedPlan(plan);
    
    // Apply any coupon info passed from pricing card component
    if (couponInfo.couponCode) {
      setCouponCode(couponInfo.couponCode);
      setDiscount(couponInfo.discount);
      setCouponApplied(true);
    } else {
      // Reset coupon when plan changes without coupon info
      setCouponApplied(false);
      setCouponCode('');
      setDiscount(0);
    }
    
    // CHANGE: Go directly to payment step without requiring login first
    setPreviousStep('plan');
    setCheckoutStep('payment');
    
    // Store the plan selection in URL parameters for easy recovery
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('plan', plan);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  };

  // Toggle coupon input visibility
  const toggleCouponInput = () => {
    setShowCouponInput(!showCouponInput);
  };

  // Apply coupon function
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }
    
    // Convert to uppercase for case-insensitive comparison
    const code = couponCode.toUpperCase();
    
    if (discountCodes[code]) {
      setCouponApplied(true);
      setDiscount(discountCodes[code].rate);
      alert(`Coupon applied! ${discountCodes[code].description} (${discountCodes[code].rate}% off)`);
    } else {
      alert('Invalid coupon code. Please try again.');
    }
  };

  // Function to remove applied coupon
  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setDiscount(0);
  };

  // Calculate prices including any discounts
  const getBasePrice = () => {
    return subscription.price;
  };

  const getDiscountAmount = () => {
    const basePrice = getBasePrice();
    return (basePrice * discount) / 100;
  };

  const getFinalPrice = () => {
    const basePrice = getBasePrice();
    if (couponApplied) {
      const discountAmount = getDiscountAmount();
      const finalPrice = basePrice - discountAmount;
      return finalPrice <= 0 ? 0 : finalPrice.toFixed(2);
    }
    return basePrice.toFixed(2);
  };

  // Check if purchase is free with 100% discount coupon
  const isFreeWithCoupon = () => {
    return couponApplied && discount === 100;
  };

  useEffect(() => {
    // Get flag from session storage that tracks if modal was just closed
    const modalJustClosed = sessionStorage.getItem('modalJustClosed') === 'true';
    
    // Show auth modal if we're in payment step and need user data
    if (checkoutStep === 'payment' && !user && !pendingUserData && !showAuthModal && !modalJustClosed) {
      console.log("Showing auth modal for data collection");
      setShowAuthModal(true);
      setIsLoginMode(false); // Force signup mode
    }
    
    // Clear the flag after checking it
    if (modalJustClosed) {
      sessionStorage.removeItem('modalJustClosed');
    }
  }, [checkoutStep, user, pendingUserData, showAuthModal]);

  const handleCloseAuthModal = () => {
    // Set a flag in session storage to prevent immediate reopening
    sessionStorage.setItem('modalJustClosed', 'true');
    setShowAuthModal(false);
  };

  // Process a free purchase with 100% discount coupon
  const processFreePurchase = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log("Starting free purchase process");
      
      // Check if we're dealing with a logged-in user or pending user data
      if (!user && pendingUserData) {
        console.log("Creating new user account from pending data for free purchase");
        
        // Create the user account from pending data
        const registrationResult = await registerUser(
          pendingUserData.email,
          pendingUserData.password,
          pendingUserData.firstName,
          pendingUserData.lastName
        );
        
        if (!registrationResult.success) {
          throw new Error(registrationResult.error || 'Account creation failed');
        }
        
        console.log("User account created successfully:", registrationResult.user.uid);
        
        // Update the user state
        setUser(registrationResult.user);
        
        // Create a free order for the new user
        const orderResult = await processPayment(
          null, // No payment details for free purchase
          registrationResult.user.uid,
          {
            amount: 0,
            plan: selectedPlan,
            discount: discount,
            couponCode: couponCode,
            isFree: true
          }
        );
        
        if (!orderResult.success) {
          throw new Error(orderResult.error || 'Error processing your free access');
        }
        
        console.log("Free order created:", orderResult.orderId);
        
        // Set order ID and move to confirmation
        setOrderId(orderResult.orderId);
        changeCheckoutStep('confirmation');
        
        // Set payment verification in session storage for immediate access
        sessionStorage.setItem('paymentVerified', 'true');
        
        return;
      }
      
      // Handle case for already logged-in user
      if (user && user.uid) {
        console.log("Processing free purchase for existing user:", user.uid);
        
        // Create a free order record
        const result = await processPayment(
          null, // No payment details needed for free purchase
          user.uid,
          {
            amount: 0,
            plan: selectedPlan,
            discount: discount,
            couponCode: couponCode,
            isFree: true
          }
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Error processing your free access');
        }
        
        console.log("Free order created:", result.orderId);
        
        // Set order ID and move to confirmation
        setOrderId(result.orderId);
        changeCheckoutStep('confirmation');
        
        // Set payment verification in session storage for immediate access
        sessionStorage.setItem('paymentVerified', 'true');
      } else {
        throw new Error('User account required to complete purchase');
      }
    } catch (error) {
      console.error("Free purchase error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle authentication success
  const handleAuthSuccess = (userData) => {
    console.log("Auth success in checkout flow:", userData);
    
    // Check if this is data collection mode (for payment) or actual authentication
    if (userData?.dataCollectionOnly) {
      console.log("Data collection mode - storing user data without authentication");
      
      // Don't set the user state - just store the registration data
      setPendingUserData({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      });
      
      // Mark registration as complete
      setRegistrationComplete(true);
      
      // Close auth modal
      setShowAuthModal(false);
      
      return; // Critical: exit early without setting user state or changing route
    }
    
    // If it's a real authentication (not data collection), set the user state
    if (userData?.user) {
      // Set the authenticated user
      setUser(userData.user);
      
      // Update email field if available
      if (userData.user.email) {
        setCardInfo(prev => ({
          ...prev,
          email: userData.user.email
        }));
      }
    }
    
    // Close auth modal
    setShowAuthModal(false);
    
    if (userData?.isGuest) {
      // Handle guest access
      navigate('/guest-preview');
    }
  };

  // Handle continue to review
  const continueToReview = (e) => {
    e.preventDefault();
    
    // Validate card details
    let isValid = true;
    let errorMessage = '';
    
    const cardNumber = cardInfo.number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 16) {
      isValid = false;
      errorMessage = 'Please enter a valid card number';
    }
    
    if (!cardInfo.expiry || !cardInfo.expiry.includes('/')) {
      isValid = false;
      errorMessage = 'Please enter a valid expiration date (MM/YY)';
    }
    
    if (!cardInfo.cvc || cardInfo.cvc.length < 3) {
      isValid = false;
      errorMessage = 'Please enter a valid CVC code';
    }
    
    if (!cardInfo.name || cardInfo.name.trim().length < 3) {
      isValid = false;
      errorMessage = 'Please enter the cardholder name';
    }
    
    if (!isValid) {
      setError(errorMessage);
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Move to review step
    changeCheckoutStep('review');
  };

  // Detect card type based on first digits
  const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    // Visa - starts with 4
    if (/^4/.test(cleanNumber)) return 'visa';
    
    // Mastercard - starts with 51-55, or 2221-2720
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7][0-9]{2}/.test(cleanNumber)) return 'mastercard';
    
    // American Express - starts with 34 or 37
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    
    return null;
  };

  // Handle card input changes with better formatting
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'number') {
      // Remove all non-digits and existing spaces
      let digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      // Detect card type
      const cardType = detectCardType(digits);
      
      // Format differently based on card type
      if (cardType === 'amex') {
        // Format as 4-6-5 for American Express
        for (let i = 0; i < digits.length && i < 15; i++) {
          if (i === 4 || i === 10) formattedValue += ' ';
          formattedValue += digits[i];
        }
      } else {
        // Format as 4-4-4-4 for other cards
        for (let i = 0; i < digits.length && i < 16; i++) {
          if (i > 0 && i % 4 === 0) formattedValue += ' ';
          formattedValue += digits[i];
        }
      }
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue,
        cardType
      });
    } 
    // Format expiry date as MM/YY
    else if (name === 'expiry') {
      let digits = value.replace(/\D/g, '');
      let formattedValue = '';
      
      // Format first 2 digits as month
      if (digits.length > 0) {
        // Make sure month is valid (01-12)
        let month = digits.substring(0, 2);
        if (month.length === 1) {
          if (parseInt(month) > 1) {
            month = '0' + month;
          }
        } else if (parseInt(month) > 12) {
          month = '12';
        } else if (parseInt(month) === 0) {
          month = '01';
        }
        
        formattedValue = month;
        
        // Add slash and year if we have enough digits
        if (digits.length > 2) {
          formattedValue += '/' + digits.substring(2, 4);
        }
      }
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
    }
    // Restrict CVC to numbers only and limit length based on card type
    else if (name === 'cvc') {
      const digits = value.replace(/\D/g, '');
      const maxLength = cardInfo.cardType === 'amex' ? 4 : 3;
      
      setCardInfo({
        ...cardInfo,
        [name]: digits.substring(0, maxLength)
      });
    }
    // All other fields
    else {
      setCardInfo({
        ...cardInfo,
        [name]: value
      });
    }
  };

  // Render card brand icon based on detected card type
  const renderCardBrandIcon = () => {
    if (!cardInfo.cardType) {
      return (
        <div className="card-icons">
          <div className="card-icon visa-faded"></div>
          <div className="card-icon mastercard-faded"></div>
          <div className="card-icon amex-faded"></div>
        </div>
      );
    }
    
    switch(cardInfo.cardType) {
      case 'visa':
        return <div className="card-icon visa"></div>;
      case 'mastercard':
        return <div className="card-icon mastercard"></div>;
      case 'amex':
        return <div className="card-icon amex"></div>;
      default:
        return null;
    }
  };

  // Handle registration data collection but don't create account yet
const handleAuthDataCollection = (userData) => {
  console.log("Registration data collected:", userData);
  
  // Store pending user data
  setPendingUserData({
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName || '',
    lastName: userData.lastName || ''
  });
  
  // Mark registration step as complete
  setRegistrationComplete(true);
  
  // Close auth modal
  setShowAuthModal(false);
  
  // Move to payment step without creating Firebase account
  changeCheckoutStep('payment');
};

  // Calculate subscription end date based on plan type
  const getSubscriptionEndDate = () => {
    const now = new Date();
    if (subscription.type === 'monthly') {
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    } else if (subscription.type === 'yearly') {
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    } else {
      // For one-time purchases, set to 1 year by default
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    }
  };

  // Process payment
  const handleProcessPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Process the payment first
      const paymentResult = await processStripePayment(
        {
          cardId: cardInfo.id,
          name: cardInfo.name,
          email: pendingUserData.email || cardInfo.email
        },
        null, // No user ID yet since account isn't created
        {
          amount: parseFloat(getFinalPrice()),
          plan: selectedPlan,
          couponCode: couponApplied ? couponCode : ''
        }
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment processing failed');
      }

      // 2. Now create the user account AFTER payment success
      const registrationResult = await registerUser(
        pendingUserData.email,
        pendingUserData.password,
        pendingUserData.firstName,
        pendingUserData.lastName
      );

      if (!registrationResult.success) {
        // This is a critical error - payment successful but account creation failed
        console.error("Payment succeeded but account creation failed:", registrationResult.error);
        throw new Error("Your payment was successful, but we encountered an issue creating your account. Please contact support with your payment confirmation.");
      }

      // 3. Set the user state with the newly created user
      setUser(registrationResult.user);

      // 4. Update the order with the user ID and create subscription record
      await updateDoc(doc(db, "orders", paymentResult.orderId), {
        userId: registrationResult.user.uid,
        status: 'completed'
      });

      // 5. Update user document with subscription details
      await updateDoc(doc(db, "users", registrationResult.user.uid), {
        paymentVerified: true,
        purchaseDate: new Date().toISOString(),
        purchasedPlan: selectedPlan,
        purchaseAmount: parseFloat(getFinalPrice()),
        subscriptions: [{
          plan: selectedPlan,
          startDate: new Date().toISOString(),
          endDate: getSubscriptionEndDate(),
          orderId: paymentResult.orderId,
          active: true
        }]
      });

      // 6. Set payment verification in session storage for immediate access
      sessionStorage.setItem('paymentVerified', 'true');

      // 7. Move to confirmation step
      setOrderId(paymentResult.orderId);
      changeCheckoutStep('confirmation');
      
    } catch (error) {
      console.error("Payment/Registration error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get plan display name
  const getPlanDisplayName = () => {
    switch(selectedPlan) {
      case 'cheatsheet':
        return 'The Cheatsheet';
      case 'cheatsheet-plus':
        return 'The Cheatsheet+';
      case 'application':
        return 'Application Cheatsheet';
      case 'application-plus':
        return 'Application Cheatsheet+';
      default:
        return 'Selected Plan';
    }
  };

  // Get text for subscription period
  const getSubscriptionPeriodText = () => {
    if (subscription.type === 'monthly') {
      return 'every month';
    } else if (subscription.type === 'yearly') {
      return 'per year';
    } else {
      return 'one time';
    }
  };

  // Render different steps based on checkout progress
  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 'plan':
        return renderPlanSelection();
      case 'payment':
        return renderPaymentForm();
      case 'review':
        return renderReviewStep();
      case 'confirmation':
        return renderConfirmation();
      default:
        return renderPlanSelection();
    }
  };

  // Render plan selection step
  const renderPlanSelection = () => {
    // Check if query param has plan selection
    if (location.search.includes('plan=')) {
      // If plan is pre-selected, move to payment step
      if (user) {
        if (checkoutStep === 'plan') {
          changeCheckoutStep('payment');
        }
        return renderPaymentForm();
      } else {
        // If no user, show auth modal
        if (!showAuthModal) {
          setShowAuthModal(true);
        }
      }
    }
    
    return (
      <>
        <div className="checkout-header">
          <h1>This is your in.</h1>
          <p>The full profiles of successful medical school applicants will be available once you join the cheatsheet.</p>
        </div>
        
        <PricingCards onSelectPlan={handleSelectPlan} />
        
      <div className="faq-section">
        <h3>Frequently Asked Questions</h3>
        
        {/* Replace these static faq-items with interactive dropdowns */}
        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(0)}>
            <h4>Can I cancel my subscription?</h4>
              <div className="arrow-icon">
                <svg 
                  width="14" 
                  height="8" 
                  viewBox="0 0 14 8" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L7 7L13 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
          </div>
          <div className={`faq-answer ${expandedFaq === 0 ? 'expanded' : ''}`}>
            <p>Yes, you can cancel at any time. If you cancel within the first 7 days, you'll receive a full refund.</p>
          </div>
        </div>
        
        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(1)}>
            <h4>How frequently is new content added?</h4>
            <div className="arrow-icon">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className={`faq-answer ${expandedFaq === 1 ? 'expanded' : ''}`}>
            <p>We add new successful applicant profiles every month, with major updates at the beginning of each application cycle.</p>
          </div>
        </div>
        
        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(2)}>
            <h4>Will this help me if I'm a non-traditional applicant?</h4>
            <div className="arrow-icon">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L7 7L13 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className={`faq-answer ${expandedFaq === 2 ? 'expanded' : ''}`}>
            <p>Absolutely! We have profiles from all types of applicants, including many non-traditional success stories.</p>
          </div>
        </div>
      </div>
      </>
    );
  };


  // This function collects user registration data without creating the account
const handleRegistrationDataCollection = (userData) => {
  console.log("Registration data collected:", userData);
  
  // Store pending user data for later account creation
  setPendingUserData({
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName || '',
    lastName: userData.lastName || ''
  });
  
  // Mark registration as complete
  setRegistrationComplete(true);
  
  // Close the auth modal
  setShowAuthModal(false);
};

  // Add this explicit handler for confirming free purchases
  const handleConfirmFreePurchase = async () => {
    console.log("Confirming free purchase");
    setLoading(true);
    setError('');
    
    try {
      // We need to check if we have pending user data (new user) or existing user
      if (!user && pendingUserData) {
        console.log("Creating account from pending data:", pendingUserData.email);
        
        // 1. First create the user account
        const registrationResult = await registerUser(
          pendingUserData.email,
          pendingUserData.password,
          pendingUserData.firstName,
          pendingUserData.lastName
        );
        
        if (!registrationResult.user || !registrationResult.success) {
          console.error("Failed to create user account:", registrationResult.error);
          throw new Error(registrationResult.error || 'Failed to create your account');
        }
        
        console.log("Account created successfully:", registrationResult.user.uid);
        
        // 2. Set the user state with the newly created user
        setUser(registrationResult.user);
        
        // 3. Create a free order for this user
        const orderResult = await processPayment(
          null, // No payment details for free purchase
          registrationResult.user.uid,
          {
            amount: 0,
            plan: selectedPlan,
            discount: discount,
            couponCode: couponCode,
            isFree: true
          }
        );
        
        if (!orderResult.success) {
          console.error("Failed to create order:", orderResult.error);
          throw new Error(orderResult.error || 'Failed to process your free access');
        }
        
        console.log("Order created successfully:", orderResult.orderId);
        
        // 4. Update the user document to mark payment as verified
        try {
          const db = getFirestore();
          await updateDoc(doc(db, "users", registrationResult.user.uid), {
            paymentVerified: true,
            purchaseDate: new Date().toISOString(),
            purchasedPlan: selectedPlan,
            purchaseAmount: 0, // Free purchase
            subscriptions: [{
              plan: selectedPlan,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
              orderId: orderResult.orderId,
              active: true
            }]
          });
          
          // Set payment verification in session storage for immediate access
          sessionStorage.setItem('paymentVerified', 'true');
        } catch (updateError) {
          console.error("Failed to update user document:", updateError);
          // Continue anyway since the core account and order were created
        }
        
        // 5. Move to confirmation step
        setOrderId(orderResult.orderId);
        changeCheckoutStep('confirmation');
      } else if (user && user.uid) {
        // Handle existing user free purchase
        console.log("Processing free purchase for existing user:", user.uid);
        
        const result = await processPayment(
          null, // No payment details needed for free purchase
          user.uid,
          {
            amount: 0,
            plan: selectedPlan,
            discount: discount,
            couponCode: couponCode,
            isFree: true
          }
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Error processing your free access');
        }
        
        console.log("Free order created:", result.orderId);
        
        // Set order ID and move to confirmation
        setOrderId(result.orderId);
        changeCheckoutStep('confirmation');
        
        // Set payment verification in session storage for immediate access
        sessionStorage.setItem('paymentVerified', 'true');
      } else {
        throw new Error('Missing user information. Please try again.');
      }
    } catch (error) {
      console.error("Free purchase error:", error);
      setError(error.message || 'An error occurred while processing your order');
    } finally {
      setLoading(false);
    }
  };

  // Render payment form step
  const renderPaymentForm = () => {
    // If we need to collect user data first and haven't done so yet
    if (!user && !pendingUserData && !loading) {
      return (
        <div className="payment-form-container">
          <div className="payment-header">
            <h2>Creating Your Account</h2>
            <p>Please provide your details to continue with payment</p>
          </div>
          
          {/* Back button to plan selection */}
          <div className="navigation-controls">
            <button className="back-button" onClick={handleGoBack}>
              ← Back to Plans
            </button>
          </div>
          
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        </div>
      );
    }
    
    // If purchase is free with 100% discount, show confirmation screen instead of auto-processing
    if (isFreeWithCoupon()) {
      return (
        <div className="payment-form-container">
          <div className="payment-header">
            <h2>Confirm Free Access</h2>
            <p>Your order qualifies for free access with the applied coupon.</p>
          </div>
          
          {/* Back button */}
          <div className="navigation-controls">
            <button className="back-button" onClick={handleGoBack}>
              ← Back
            </button>
          </div>
          
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-details">
              <div className="plan-name">
                <h4>{getPlanDisplayName()}</h4>
                <p className="subscription-period">
                  <span style={{textDecoration: 'line-through'}}>${subscription.price.toFixed(2)}</span>
                  {' '}<strong>FREE</strong> {getSubscriptionPeriodText()}
                </p>
                <p className="plan-description">New full applicant profile added every couple days.</p>
              </div>
              
              <div className="applied-discount">
                <div className="discount-info" style={{marginBottom: '20px'}}>
                  <span>Discount coupon applied: </span>
                  <span><strong>{couponCode}</strong> ({discount}% off)</span>
                </div>
              </div>
              
              {/* If we have pending user data, show account details to be created */}
              {pendingUserData && (
                <div className="user-info-summary" style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderLeft: '3px solid #10b981',
                  padding: '15px',
                  marginBottom: '20px',
                  borderRadius: '4px'
                }}>
                  <h4 style={{marginBottom: '10px'}}>Account Details</h4>
                  <p><strong>Email:</strong> {pendingUserData.email}</p>
                  <p><strong>Name:</strong> {pendingUserData.firstName} {pendingUserData.lastName}</p>
                  <p style={{marginTop: '10px', fontSize: '0.9em', fontStyle: 'italic'}}>
                    Your account will be created when you confirm your order.
                  </p>
                </div>
              )}
              
              {/* Show a prominent confirm button */}
              <button 
                onClick={handleConfirmFreePurchase} 
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#065f46',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '20px',
                  marginBottom: '20px'
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Free Access'}
              </button>
              
              {/* Show any error messages */}
              {error && (
                <div style={{
                  color: '#e53e3e',
                  backgroundColor: '#fee2e2',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  marginTop: '15px'
                }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Regular payment form for non-free purchases (your existing code)
    return (
      <div className="payment-form-container">
          <div className="payment-header">
            <h2>Payment & Discounts</h2>
            <p>Enter your payment details to continue</p>
          </div>
          
          {/* Back button */}
          <div className="navigation-controls">
            <button className="back-button" onClick={handleGoBack}>
              ← Back
            </button>
          </div>
          
          <div className="order-summary">
            <h3>Subscription Summary</h3>
            <div className="order-details">
              <div className="plan-name">
                <h4>{getPlanDisplayName()}</h4>
                <p className="subscription-period">${subscription.price.toFixed(2)} {getSubscriptionPeriodText()}</p>
                <p className="plan-description">New full applicant profile added every couple days.</p>
              </div>
              
              {/* GIFT OR DISCOUNT CODE SECTION */}
              <div className="discount-section">
                <h4>GIFT OR DISCOUNT CODE</h4>
                
                {!couponApplied ? (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="Gift or Discount Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="coupon-input"
                    />
                    <button 
                      className="apply-coupon-btn"
                      onClick={applyCoupon}
                    >
                      APPLY
                    </button>
                  </div>
                ) : (
                  <div className="applied-discount">
                    <div className="discount-info">
                      <span>Discount ({discount}% off)</span>
                      <span>-${getDiscountAmount().toFixed(2)}</span>
                    </div>
                    <button className="remove-discount-btn" onClick={removeCoupon}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              <div className="checkout-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subscription.price.toFixed(2)}</span>
                </div>
                
                {couponApplied && (
                  <div className="summary-row discount">
                    <span>Discount ({discount}%)</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${getFinalPrice()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="payment-form">
            <h3>
              <img src={require('../../assets/images/credit-card.png')} alt="Card" className="form-icon" />
              Card Information
            </h3>
              
            {error && <div className="payment-error">{error}</div>}
            
            {/* If we have pending user data (from auth modal), show their email */}
            {pendingUserData && (
              <div className="user-info-summary">
                <p>Account will be created for: <strong>{pendingUserData.email}</strong></p>
                <p className="pending-note">Your account will be created after successful payment.</p>
              </div>
            )}
            
            {/* Replace your custom form with the Stripe Elements component */}
            <StripeWrapper
              onSuccess={(paymentMethod) => {
                console.log("Payment method created:", paymentMethod);
                // Store the payment method details and proceed to review
                setCardInfo({
                  ...cardInfo,
                  brand: paymentMethod.card?.brand || 'unknown',
                  last4: paymentMethod.card?.last4 || '****',
                  id: paymentMethod.id
                });
                changeCheckoutStep('review');
              }}
              onError={(errorMessage) => {
                setError(errorMessage);
              }}
              processingPayment={loading}
            />
            
            <div className="secure-checkout">
              <div className="secure-icon">🔒</div>
              <span>SECURE SSL CHECKOUT</span>
            </div>
          </div>
        </div>
      );
    };

  // Render review step
  const renderReviewStep = () => {
    return (
      <div className="review-container">
        <div className="review-header">
          <h2>Review & Subscribe</h2>
          <p>Please review your subscription details before finalizing your purchase</p>
        </div>
        
        {/* Back button */}
        <div className="navigation-controls">
          <button className="back-button" onClick={handleGoBack}>
            ← Back
          </button>
        </div>
        
        <div className="subscription-summary">
          <h3>Subscription Summary</h3>
          
          <div className="summary-details">
            <h4>{getPlanDisplayName()}</h4>
            <p className="subscription-period">${subscription.price.toFixed(2)} {getSubscriptionPeriodText()}</p>
            <p className="plan-description">New full applicant profile added every couple days.</p>
            
            {/* GIFT OR DISCOUNT CODE SECTION */}
            <div className="discount-section">
              <h4>GIFT OR DISCOUNT CODE</h4>
              
              {!couponApplied ? (
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Gift or Discount Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                  />
                  <button 
                    className="apply-coupon-btn"
                    onClick={applyCoupon}
                  >
                    APPLY
                  </button>
                </div>
              ) : (
                <div className="applied-discount">
                  <div className="discount-info">
                    <span>Discount ({discount}% off)</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                  <button className="remove-discount-btn" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            <div className="payment-method">
              <h4>Payment Method</h4>
              <div className="card-info">
                <div className="card-icon">
                  {/* You can use a simple text representation for now */}
                  {cardInfo.brand && <span>{cardInfo.brand.toUpperCase()}</span>}
                </div>
                <div className="card-details">
                  <p>**** **** **** {cardInfo.last4 || '****'}</p>
                  <p>{cardInfo.name || 'Cardholder'}</p>
                </div>
              </div>
            </div>
            
            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subscription.price.toFixed(2)}</span>
              </div>
              
              {couponApplied && (
                <div className="summary-row discount">
                  <span>Discount ({discount}%)</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              
              <div className="summary-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>${getFinalPrice()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="terms-section">
          <p>
            By clicking "Subscribe" below, you agree to our Terms of Service and authorize us to charge your card for the amount shown above.
            You can cancel at any time from your account settings.
          </p>
        </div>
        
        <button 
          className="subscribe-button" 
          onClick={handleProcessPayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Subscribe'}
        </button>
        
        <div className="secure-checkout">
          <div className="secure-icon">🔒</div>
          <span>SECURE SSL CHECKOUT</span>
        </div>
      </div>
    );
  };

  // Render confirmation step
  const renderConfirmation = () => {
    return (
      <div className="confirmation-container">
        <div className="confirmation-icon">✅</div>
        <h2>Access Granted!</h2>
        <p>Thank you! You now have access to PremedCheatsheet.</p>
        {!isFreeWithCoupon() && <p>A receipt has been sent to your email address.</p>}
        {orderId && (
          <p className="order-id">Order ID: #{orderId}</p>
        )}
        <button 
          className="continue-button"
          onClick={() => navigate('/profile')}
        >
          Start Exploring Profiles
        </button>
      </div>
    );
  };

  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-content">
        <div className="container">
          <div className="checkout-wrapper">
            {renderCheckoutStep()}
          </div>
        </div>
      </div>
      
      {/* Auth Modal with preventRedirect prop */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          // Set flag that modal was just closed to prevent immediate reopening
          sessionStorage.setItem('modalJustClosed', 'true');
          setShowAuthModal(false);
        }}
        onSuccess={handleAuthSuccess}
        initialMode={isLoginMode ? 'login' : 'signup'}
        preventRedirect={true}
        dataCollectionOnly={checkoutStep === 'payment'}
      />  
      <Footer />
    </div>
  );
};

export default Checkout;