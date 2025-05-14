// src/pages/Checkout/Checkout.js - Improved to enforce payment
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import AuthModal from '../../components/auth/AuthModal';
import PricingCards from '../../components/PricingCards/PricingCards';
import { onAuthChange } from '../../firebase/authService';
import { processPayment, processStripePayment } from '../../services/paymentService';
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
  const [checkoutStep, setCheckoutStep] = useState('plan'); // 'plan', 'payment', 'confirmation'
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    email: ''
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
  
  const navigate = useNavigate();

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

  // Redirect to profile after confirmation
  useEffect(() => {
    if (checkoutStep === 'confirmation' && orderId) {
      const timer = setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [checkoutStep, orderId, navigate]);

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
    
    // Must be logged in to proceed to payment
    if (user) {
      setCheckoutStep('payment');
    } else {
      setShowAuthModal(true);
    }
  };

  // Toggle coupon input visibility
  const toggleCouponInput = () => {
    setShowCouponInput(!showCouponInput);
  };

  // Apply coupon function
  const applyCoupon = () => {
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

  // Calculate prices including any discounts
  const getBasePrice = () => {
    switch (selectedPlan) {
      case 'cheatsheet':
        return 14.99;
      case 'cheatsheet-plus':
        return 29.99;
      case 'application':
        return 19.99;
      case 'application-plus':
        return 34.99;
      default:
        return 14.99;
    }
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

  // Process a free purchase with 100% discount coupon
  const processFreePurchase = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validate user is authenticated
      if (!user || !user.uid) {
        throw new Error('You must be logged in to complete this purchase');
      }
      
      console.log("Processing free purchase with 100% discount");
      
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

      if (result.success) {
        setOrderId(result.orderId);
        setCheckoutStep('confirmation');
      } else {
        throw new Error(result.error || 'Error processing your free access');
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
    console.log("Auth success:", userData);
    setUser(userData?.user || null);
    setShowAuthModal(false);
    
    // Update email field if available
    if (userData?.user?.email) {
      setCardInfo(prev => ({
        ...prev,
        email: userData.user.email
      }));
    }
    
    // Check if purchase is free with coupon
    if (isFreeWithCoupon()) {
      // Process the free purchase, but ensure we have a valid user first
      if (userData?.user?.uid) {
        processFreePurchase();
      }
    } else {
      setCheckoutStep('payment');
    }
  };

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'number') {
      const formattedValue = value
        .replace(/\s/g, '') // Remove existing spaces
        .replace(/(\d{4})/g, '$1 ') // Add space every 4 digits
        .trim(); // Remove trailing space
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
    } 
    // Format expiry date
    else if (name === 'expiry') {
      let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
      
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
      
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
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

  // Process payment
  const handleProcessPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate user authentication
      if (!user || !user.uid) {
        throw new Error('You must be logged in to complete this purchase');
      }
      
      // Check if purchase is free with 100% discount coupon
      if (isFreeWithCoupon()) {
        return processFreePurchase();
      }
      
      // Card validation for paid purchases
      const cardNumber = cardInfo.number.replace(/\s/g, '');
      if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 16) {
        throw new Error('Please enter a valid card number');
      }
      
      if (!cardInfo.expiry || !cardInfo.expiry.includes('/')) {
        throw new Error('Please enter a valid expiration date (MM/YY)');
      }
      
      const [expMonth, expYear] = cardInfo.expiry.split('/');
      if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
        throw new Error('Please enter a valid expiration date in MM/YY format');
      }
      
      // Check expiration date validity
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
      const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
      
      if (
        parseInt(expYear, 10) < currentYear || 
        (parseInt(expYear, 10) === currentYear && parseInt(expMonth, 10) < currentMonth)
      ) {
        throw new Error('Your card has expired');
      }
      
      if (!cardInfo.cvc || cardInfo.cvc.length < 3) {
        throw new Error('Please enter a valid CVC code');
      }
      
      if (!cardInfo.name || cardInfo.name.trim().length < 3) {
        throw new Error('Please enter the cardholder name');
      }

      // Process the payment using the appropriate method
      const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
      let result;
      if (useStripe && STRIPE_PUBLISHABLE_KEY) {
        result = await processStripePayment(
          cardInfo,
          user.uid,
          {
            amount: parseFloat(getFinalPrice()),
            plan: selectedPlan,
            discount: discount,
            couponCode: couponApplied ? couponCode : null,
            isFree: false
          }
        );
      } else {
        result = await processPayment(
          cardInfo,
          user.uid,
          {
            amount: parseFloat(getFinalPrice()),
            plan: selectedPlan,
            discount: discount,
            couponCode: couponApplied ? couponCode : null,
            isFree: false
          }
        );
      }

      if (result.success) {
        setOrderId(result.orderId);
        setCheckoutStep('confirmation');
      } else {
        throw new Error(result.error || 'Payment processing failed. Please check your card information and try again.');
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setError(error.message);
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

  // Render different steps based on checkout progress
  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 'plan':
        return renderPlanSelection();
      case 'payment':
        return renderPaymentForm();
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
          setCheckoutStep('payment');
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
          <div className="faq-item">
            <h4>Can I cancel my subscription?</h4>
            <p>Yes, you can cancel at any time. If you cancel within the first 7 days, you'll receive a full refund.</p>
          </div>
          <div className="faq-item">
            <h4>How frequently is new content added?</h4>
            <p>We add new successful applicant profiles every month, with major updates at the beginning of each application cycle.</p>
          </div>
          <div className="faq-item">
            <h4>Will this help me if I'm a non-traditional applicant?</h4>
            <p>Absolutely! We have profiles from all types of applicants, including many non-traditional success stories.</p>
          </div>
        </div>
      </>
    );
  };

  // Render payment form step
  const renderPaymentForm = () => {
    // If purchase is free with 100% discount, process it immediately
    if (isFreeWithCoupon()) {
      // Trigger free purchase processing
      if (!loading && !orderId) {
        processFreePurchase();
      }
      
      return (
        <div className="payment-form-container">
          <div className="payment-header">
            <h2>Processing your order...</h2>
            <p>Please wait while we process your free access.</p>
          </div>
          
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="payment-form-container">
        <div className="payment-header">
          <h2>Complete your purchase</h2>
          <p>You're almost done! Just enter your payment details below.</p>
        </div>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-details">
            <div className="order-item">
              <span>{getPlanDisplayName()}</span>
              <span>${getBasePrice().toFixed(2)}</span>
            </div>
            
            {!showCouponInput ? (
              <div className="coupon-prompt" onClick={toggleCouponInput}>
                Have a coupon code? Enter it here
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={applyCoupon}
                  disabled={couponApplied}
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            )}
            
            {couponApplied && (
              <div className="order-item discount">
                <span>Discount ({discount}%)</span>
                <span>-${getDiscountAmount().toFixed(2)}</span>
              </div>
            )}
            <div className="order-item total">
              <span>Total</span>
              <span>${getFinalPrice()}</span>
            </div>
          </div>
        </div>
        
        <div className="payment-form">
          <h3>Payment Details</h3>
          
          {error && <div className="payment-error">{error}</div>}
          
          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              name="number"
              placeholder="1234 5678 9012 3456"
              value={cardInfo.number}
              onChange={handleCardInputChange}
              maxLength="19" // 16 digits + 3 spaces
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Expiration Date</label>
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={cardInfo.expiry}
                onChange={handleCardInputChange}
                maxLength="5" // MM/YY format
                required
              />
            </div>
            <div className="form-group">
              <label>CVC</label>
              <input
                type="text"
                name="cvc"
                placeholder="123"
                value={cardInfo.cvc}
                onChange={handleCardInputChange}
                maxLength="4"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Name on Card</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={cardInfo.name}
              onChange={handleCardInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={cardInfo.email || (user ? user.email : '')}
              onChange={handleCardInputChange}
              required
            />
          </div>
          
          <button 
            className="payment-button" 
            onClick={handleProcessPayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay $${getFinalPrice()}`}
          </button>
          
          <div className="payment-security">
            <span>🔒</span>
            <p>Your payment information is secure and encrypted.</p>
          </div>
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
      
      {/* Auth Modal - FIXED: Added preventRedirect prop */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={isLoginMode ? 'login' : 'signup'}
        preventRedirect={true} /* This prevents automatic redirection */
      />
      
      <Footer />
    </div>
  );
};

export default Checkout;