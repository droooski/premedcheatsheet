// src/pages/Checkout/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import AuthModal from '../../components/auth/AuthModal';
import { onAuthChange, getCurrentUser } from '../../firebase/authService';
import { processPayment } from '../../services/paymentService';
import './Checkout.scss';

const Checkout = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');
  // Basic state management
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('plan'); // 'plan', 'payment', 'confirmation'
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [discountCodes, setDiscountCodes] = useState({
  'PREMEDVIP': { rate: 10, description: 'VIP Discount' },
  'STUDENT2025': { rate: 20, description: 'Student Discount' },
  'PARTNER': { rate: 100, description: 'Partnership' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(mode === 'login');
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');
  
  const navigate = useNavigate();

  // Check for authenticated user on component mount
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  // If user has completed payment, redirect to profile page
  if (checkoutStep === 'confirmation' && orderId) {
    // Add a small delay to show the confirmation screen
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 3000); // 3 seconds delay
    
    return () => clearTimeout(timer);
  }
}, [checkoutStep, orderId, navigate]);

  // Plan toggle function
  const togglePlan = (plan) => {
    setSelectedPlan(plan);
    // Reset coupon when plan changes
    setCouponApplied(false);
    setCouponCode('');
    setDiscount(0);
  };

  // Coupon toggle function
  const toggleCouponInput = () => {
    setShowCouponInput(!showCouponInput);
  };

  // Apply coupon function
  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'premedvip') {
      setCouponApplied(true);
      setDiscount(10); // 10% discount
      alert('Coupon applied! 10% discount added to your order.');
    } else {
      alert('Invalid coupon code. Please try again.');
    }
  };

  // Calculate prices including any discounts
  const getBasePrice = () => {
    return selectedPlan === 'monthly' ? 5.99 : 59.99;
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

  // Start checkout process
  const startCheckout = () => {
    if (user) {
      // User is already authenticated, proceed to payment
      setCheckoutStep('payment');
    } else {
      // Show authentication modal
      setShowAuthModal(true);
    }
  };

  // Function to continue as guest
  const continueAsGuest = () => {
    // Set a cookie or localStorage item to track guest access
    localStorage.setItem('guestAccess', 'true');
    localStorage.setItem('guestAccessExpiry', Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    
    // Redirect to profile page
    navigate('/profile');
  };

  // Handle authentication success
  const handleAuthSuccess = (userData) => {
    setUser(userData?.user || null);
    setShowAuthModal(false);
    setCheckoutStep('payment');
  };

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };

  // Process payment
  const handleProcessPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvc) {
        throw new Error('Please fill in all required payment fields');
      }

      // Process payment
      const result = await processPayment(
        cardInfo,
        user?.uid,
        {
          amount: parseFloat(getFinalPrice()),
          plan: selectedPlan,
          discount: discount,
          couponCode: couponApplied ? couponCode : null
        }
      );

      if (result.success) {
        setOrderId(result.orderId);
        setCheckoutStep('confirmation');
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
    return (
      <>
        <div className="checkout-header">
          <h1>Get Full Access to PremedCheatsheet</h1>
          <p>Join thousands of pre-med students who've found their path to medical school using our curated profiles database.</p>
        </div>
        
        <div className="plan-selector">
          <div className="plan-tabs">
            <div 
              className={`plan-tab ${selectedPlan === 'monthly' ? 'active' : ''}`}
              onClick={() => togglePlan('monthly')}
            >
              Monthly
            </div>
            <div 
              className={`plan-tab ${selectedPlan === 'yearly' ? 'active' : ''}`}
              onClick={() => togglePlan('yearly')}
            >
              Yearly <span className="save-badge">Save 20%</span>
            </div>
          </div>
          
          <div className="price-card">
            <div className="price-header">
              <h3>{selectedPlan === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}</h3>
              <div className="price">
                <span className="amount">${getFinalPrice()}</span>
                <span className="period">/{selectedPlan === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {selectedPlan === 'monthly' && (
                <div className="yearly-equivalent">
                  ${(parseFloat(getFinalPrice()) * 12).toFixed(2)}/year
                </div>
              )}
              {selectedPlan === 'yearly' && (
                <div className="savings-callout">
                  You save ${((5.99 * 12) - 59.99).toFixed(2)} per year!
                </div>
              )}
            </div>
            
            <ul className="features-list">
              <li>Access to all accepted student profiles</li>
              <li>Detailed stats: GPA, MCAT, extracurriculars</li>
              <li>Application timelines and strategies</li>
              <li>School selection insights</li>
              <li>Personal statement guidance</li>
              {selectedPlan === 'yearly' && <li className="premium-feature">Priority access to new profiles</li>}
              {selectedPlan === 'yearly' && <li className="premium-feature">Download up to 50 profiles per month</li>}
            </ul>
            
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
            
            <button className="checkout-button" onClick={startCheckout}>
              Get Access Now
            </button>
            
            <div className="payment-methods">
              <div className="payment-icons">
                <span className="payment-icon">💳</span>
                <span className="payment-icon">💰</span>
                <span className="payment-icon">🔒</span>
              </div>
              <p className="secure-payment">Secure payment processing</p>
            </div>
            
            <p className="guarantee">
              7-day money-back guarantee. No questions asked.
            </p>
          </div>
        </div>
        
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
              <span>PremedCheatsheet {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan</span>
              <span>${getBasePrice().toFixed(2)}</span>
            </div>
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
              placeholder="1234 1234 1234 1234"
              value={cardInfo.number}
              onChange={handleCardInputChange}
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
            />
          </div>
          
          <div className="billing-address-option">
            <input
              type="checkbox"
              id="same-address"
              defaultChecked
            />
            <label htmlFor="same-address">Billing address is the same as account address</label>
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
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase. You now have access to PremedCheatsheet.</p>
      <p>A receipt has been sent to your email address.</p>
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
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={isLoginMode ? 'login' : 'signup'}
      />
      
      <Footer />
    </div>
  );
};

export default Checkout;