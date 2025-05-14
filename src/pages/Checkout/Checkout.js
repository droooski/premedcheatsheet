// src/pages/Checkout/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import AuthModal from '../../components/auth/AuthModal';
import PricingCards from '../../components/PricingCards/PricingCards';
import { onAuthChange } from '../../firebase/authService';
import { processPayment, processStripePayment } from '../../services/paymentService';
import StripeWrapper from '../../components/payment/StripeWrapper';
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

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  
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
    
    // Must be logged in to proceed to payment
    if (user) {
      // Set previous step first then change current step
      setPreviousStep('plan');
      setCheckoutStep('payment');
    } else {
      setShowAuthModal(true);
      setIsLoginMode(false);
    }
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
        changeCheckoutStep('confirmation');
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
    console.log("Auth success in checkout flow:", userData);
    
    // Update user state with the authenticated user
    setUser(userData?.user || null);
    
    // Close auth modal
    setShowAuthModal(false);
    
    if (userData?.isGuest) {
      // Handle guest access
      navigate('/guest-preview');
    } else if (userData?.user) {
      // Update email field if available
      if (userData.user.email) {
        setCardInfo(prev => ({
          ...prev,
          email: userData.user.email
        }));
      }
      
      // Check if purchase is free with coupon
      if (isFreeWithCoupon()) {
        // Process the free purchase, but ensure we have a valid user first
        if (userData.user.uid) {
          processFreePurchase();
        }
      } else {
        // Proceed to payment step
        console.log("Setting checkout step to payment after auth success");
        changeCheckoutStep('payment');
      }
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
    
    // Process the payment first before granting access
    const paymentResult = await processPayment(
      cardInfo,
      user.uid,
      {
        amount: parseFloat(getFinalPrice()),
        plan: selectedPlan,
        discount: discount,
        couponCode: couponCode
      }
    );
    
    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment processing failed');
    }
    
    // Payment successful, now update user's subscription status in Firestore
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        paymentVerified: true,
        purchaseDate: new Date().toISOString(),
        purchasedPlan: selectedPlan,
        purchaseAmount: parseFloat(getFinalPrice())
      });

    // Set session storage for immediate access
    sessionStorage.setItem('paymentVerified', 'true');

    // Set the order ID and move to confirmation page
    setOrderId(paymentResult.orderId);
    changeCheckoutStep('confirmation');
    
  } catch (error) {
    console.error("Payment processing error:", error);
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