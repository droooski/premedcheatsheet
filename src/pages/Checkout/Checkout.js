import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import './Checkout.scss';

const Checkout = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  const togglePlan = (plan) => {
    setSelectedPlan(plan);
    // Reset coupon when plan changes
    setCouponApplied(false);
    setCouponCode('');
  };

  const handleCheckout = () => {
    // Handle checkout process here
    // This would typically integrate with a payment processor
    alert('Processing your order. Redirecting to payment...');
  };

  const toggleCouponInput = () => {
    setShowCouponInput(!showCouponInput);
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'premedvip') {
      setCouponApplied(true);
      alert('Coupon applied! 10% discount added to your order.');
    } else {
      alert('Invalid coupon code. Please try again.');
    }
  };

  // Calculate prices including any discounts
  const getPrice = () => {
    let basePrice = selectedPlan === 'monthly' ? 19.99 : 191.90;
    if (couponApplied) {
      basePrice = basePrice * 0.9; // 10% discount
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

  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-content">
        <div className="container">
          <div className="checkout-wrapper">
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
                
                {/* {!showCouponInput ? (
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
                )} */}
                
                <button className="checkout-button" onClick={handleCheckout}>
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
            
            {/* <div className="trust-elements">
              <div className="trust-element">
                <div className="trust-icon">👨‍⚕️</div>
                <div className="trust-text">
                  <h4>Created by med students</h4>
                  <p>Built by a team who've been in your shoes</p>
                </div>
              </div>
              <div className="trust-element">
                <div className="trust-icon">🔄</div>
                <div className="trust-text">
                  <h4>Updated regularly</h4>
                  <p>New profiles added every month</p>
                </div>
              </div>
              <div className="trust-element">
                <div className="trust-icon">👍</div>
                <div className="trust-text">
                  <h4>Trusted by thousands</h4>
                  <p>Used by pre-meds nationwide</p>
                </div>
              </div>
            </div>
            
            <div className="testimonials">
              <div className="testimonial">
                <p>"PremedCheatsheet was a game-changer for my application. Seeing what actually worked for others helped me focus my efforts and ultimately get accepted to my top-choice school."</p>
                <div className="author">- Sarah K., Stanford Medical School</div>
              </div>
              
              <div className="testimonial">
                <p>"I was struggling with my extracurriculars until I found this site. The profiles showed me exactly what successful applicants were doing, and I modeled my approach after them."</p>
                <div className="author">- Michael T., Johns Hopkins School of Medicine</div>
              </div>
            </div> */}
            
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
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;