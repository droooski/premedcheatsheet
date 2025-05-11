// src/pages/Checkout/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import AuthModal from '../../components/auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import './Checkout.scss';

const Checkout = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cardType, setCardType] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('plan'); // 'plan', 'payment', 'verify'
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  // For simulating payment process
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    // Check if the user is already logged in
    if (!loading && !currentUser && checkoutStep !== 'plan') {
      // If not on plan selection page, show login modal
      setShowAuthModal(true);
    }
  }, [currentUser, loading, checkoutStep]);

  // Generate random order number
  useEffect(() => {
    if (checkoutStep === 'verify' && !orderNumber) {
      // Generate a 5-digit order number
      const randomOrderNumber = Math.floor(10000 + Math.random() * 90000);
      setOrderNumber(`${randomOrderNumber}`);
    }
  }, [checkoutStep, orderNumber]);

  const togglePlan = (plan) => {
    setSelectedPlan(plan);
    // Reset coupon when plan changes
    setCouponApplied(false);
    setCouponCode('');
    setDiscountAmount(0);
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    // Move to payment step
    setCheckoutStep('payment');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false);
      // Move to verification step
      setCheckoutStep('verify');
    }, 1500);
  };

  const handlePurchaseComplete = () => {
    // Simulate final purchase completion
    setProcessingPayment(true);
    
    setTimeout(() => {
      setProcessingPayment(false);
      // Navigate to dashboard or profile page
      navigate('/dashboard');
    }, 1500);
  };

  const toggleCouponInput = () => {
    setShowCouponInput(!showCouponInput);
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'premedvip') {
      setCouponApplied(true);
      setDiscountAmount(selectedPlan === 'monthly' ? 2.00 : 19.19);
      alert('Coupon applied! 10% discount added to your order.');
    } else {
      alert('Invalid coupon code. Please try again.');
    }
  };

  // Format and validate card number with card type detection
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    
    // Format with spaces
    if (value.length > 0) {
      value = value.match(/.{1,4}/g).join(' ');
    }
    
    // Detect card type
    if (value.startsWith('4')) {
      setCardType('visa');
    } else if (/^5[1-5]/.test(value.replace(/\s/g, ''))) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(value.replace(/\s/g, ''))) {
      setCardType('amex');
    } else {
      setCardType(null);
    }
    
    setCardNumber(value);
  };

  // Format card expiry date
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    setCardExpiry(value);
  };

  // Calculate prices including any discounts
  const getPrice = () => {
    let basePrice = selectedPlan === 'monthly' ? 19.99 : 191.90;
    if (couponApplied) {
      basePrice = basePrice - discountAmount;
      return basePrice.toFixed(2);
    }
    return selectedPlan === 'monthly' ? '19.99' : '191.90';
  };

  // Calculate savings for yearly plan
  const yearlySavings = () => {
    const monthlyCost = 19.99 * 12;
    const yearlyCost = 191.90;
    return (monthlyCost - yearlyCost).toFixed(2);
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
                <span className="amount">${getPrice()}</span>
                <span className="period">/{selectedPlan === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {selectedPlan === 'monthly' && (
                <div className="yearly-equivalent">
                  ${(getPrice() * 12).toFixed(2)}/year
                </div>
              )}
              {selectedPlan === 'yearly' && (
                <div className="savings-callout">
                  You save ${yearlySavings()} per year!
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
                  disabled={couponApplied || !couponCode}
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            )}
            
            <button 
              className="checkout-button" 
              onClick={handleCheckout}
              disabled={processingPayment}
            >
              {processingPayment ? 'Processing...' : 'Get Access Now'}
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

  // Render payment information step
  const renderPaymentInfo = () => {
    return (
      <>
        <div className="checkout-header">
          <h1>Complete Your Purchase</h1>
          <p>You're just one step away from accessing all profiles.</p>
        </div>
        
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Premed Cheatsheet - {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan</span>
            <span>${selectedPlan === 'monthly' ? '19.99' : '191.90'}</span>
          </div>
          
          {couponApplied && (
            <div className="summary-discount">
              <span>Discount (Coupon: {couponCode})</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="summary-total">
            <span>Total</span>
            <span>${getPrice()}</span>
          </div>
        </div>
        
        <div className="payment-form-container">
          <h3>Payment Information</h3>
          <form onSubmit={handlePaymentSubmit} className="payment-form">
            <div className="form-group">
              <label>Card Number</label>
              <div className="card-input-wrapper">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
                {cardType && (
                  <span className={`card-icon ${cardType}`}>
                    {cardType === 'visa' && '💳Visa'}
                    {cardType === 'mastercard' && '💳MC'}
                    {cardType === 'amex' && '💳Amex'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Security Code (CVC)</label>
                <input
                  type="text"
                  value={cardCVC}
                  onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="CVC"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="checkout-button"
              disabled={processingPayment || !cardNumber || !cardExpiry || !cardCVC}
            >
              {processingPayment ? 'Processing...' : `Pay $${getPrice()}`}
            </button>
          </form>
          
          <div className="secure-checkout-info">
            <div className="secure-icon">🔒</div>
            <p>Your payment information is encrypted and secure. We never store your full card details.</p>
          </div>
        </div>
      </>
    );
  };
  
  // Render verification/success step
  const renderVerification = () => {
    return (
      <div className="verification-container">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h2>Order Confirmed</h2>
          <p className="order-number">Order Number: #{orderNumber}</p>
          <p className="success-message">
            You now have access to PremedCheatsheet.
            A receipt was sent to {currentUser?.email}.
          </p>
          
          <button 
            className="access-button" 
            onClick={handlePurchaseComplete}
            disabled={processingPayment}
          >
            {processingPayment ? 'Loading...' : 'View Product'}
          </button>
        </div>
        
        <div className="order-details">
          <h3>Order Details</h3>
          <div className="order-item">
            <div className="item-name">
              <span className="item-icon">📊</span>
              <div>
                <h4>Premed Cheatsheet {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'}</h4>
                <p>New full applicant profile added every couple days.</p>
              </div>
            </div>
            <div className="item-price">${getPrice()}</div>
          </div>
          
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${selectedPlan === 'monthly' ? '19.99' : '191.90'}</span>
            </div>
            {couponApplied && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row tax">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${getPrice()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to handle authentication modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    // If user was trying to checkout but closed the auth modal, reset to plan selection
    if (checkoutStep !== 'plan') {
      setCheckoutStep('plan');
    }
  };

  // Render the current step
  const renderCurrentStep = () => {
    switch (checkoutStep) {
      case 'payment':
        return renderPaymentInfo();
      case 'verify':
        return renderVerification();
      case 'plan':
      default:
        return renderPlanSelection();
    }
  };

  // For subscription implementation
  // Uncomment and use this method when implementing subscription functionality
  /*
  const processSubscription = async () => {
    // This method would handle the actual subscription creation through a payment processor API
    // Example with Stripe:
    try {
      // Create a payment method using card details
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: currentUser.email,
        },
      });

      if (error) {
        console.error("Error creating payment method:", error);
        return { error };
      }

      // Send to your backend to create the subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          userId: currentUser.uid,
          plan: selectedPlan,
          couponCode: couponApplied ? couponCode : null
        }),
      });

      const subscription = await response.json();
      
      return { subscription };
    } catch (error) {
      console.error("Subscription error:", error);
      return { error };
    }
  };
  */

  // For one-time purchase implementation
  // Uncomment and use this method when implementing one-time purchase functionality
  /*
  const processOneTimePayment = async () => {
    // This method would handle one-time payment through a payment processor API
    // Example with Stripe:
    try {
      // Create a payment intent
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getPrice() * 100, // Convert to cents
          userId: currentUser.uid,
          planType: selectedPlan,
          couponCode: couponApplied ? couponCode : null
        }),
      });

      const { clientSecret } = await response.json();
      
      // Confirm the payment
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: currentUser.email,
          },
        }
      });

      if (error) {
        console.error("Error confirming payment:", error);
        return { error };
      }

      return { paymentIntent };
    } catch (error) {
      console.error("Payment error:", error);
      return { error };
    }
  };
  */

  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-content">
        <div className="container">
          <div className="checkout-wrapper">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        onSuccess={() => setShowAuthModal(false)}
      />
      
      <Footer />
    </div>
  );
};

export default Checkout;