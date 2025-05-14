import React, { useState } from 'react';
import './PricingCards.scss';

const PricingCards = ({ onSelectPlan }) => {
  // Coupon state management per card
  const [couponStates, setCouponStates] = useState({
    cheatsheet: { showInput: false, code: '', applied: false, discount: 0 },
    'cheatsheet-plus': { showInput: false, code: '', applied: false, discount: 0 },
    application: { showInput: false, code: '', applied: false, discount: 0 },
    'application-plus': { showInput: false, code: '', applied: false, discount: 0 }
  });

  // Define discount codes
  const discountCodes = {
    'PREMEDVIP': { rate: 10, description: 'VIP Discount' },
    'STUDENT2025': { rate: 20, description: 'Student Discount' },
    'PARTNER': { rate: 100, description: 'Partnership - 100% Off' }
  };

  // Toggle coupon input visibility
  const toggleCouponInput = (plan) => {
    setCouponStates({
      ...couponStates,
      [plan]: { 
        ...couponStates[plan], 
        showInput: !couponStates[plan].showInput 
      }
    });
  };

  // Handle coupon code input change
  const handleCouponChange = (plan, value) => {
    setCouponStates({
      ...couponStates,
      [plan]: { 
        ...couponStates[plan], 
        code: value 
      }
    });
  };

  // Apply coupon code
  const applyCoupon = (plan) => {
    const code = couponStates[plan].code.toUpperCase();
    
    if (discountCodes[code]) {
      setCouponStates({
        ...couponStates,
        [plan]: {
          ...couponStates[plan],
          applied: true,
          discount: discountCodes[code].rate
        }
      });
      alert(`Coupon applied! ${discountCodes[code].description} (${discountCodes[code].rate}% off)`);
    } else {
      alert('Invalid coupon code. Please try again.');
    }
  };

  // Calculate prices including discounts
  const getBasePrice = (plan) => {
    switch (plan) {
      case 'cheatsheet': return 14.99;
      case 'cheatsheet-plus': return 29.99;
      case 'application': return 19.99;
      case 'application-plus': return 34.99;
      default: return 14.99;
    }
  };

  const getFinalPrice = (plan) => {
    const basePrice = getBasePrice(plan);
    if (couponStates[plan].applied) {
      const discountAmount = (basePrice * couponStates[plan].discount) / 100;
      const finalPrice = basePrice - discountAmount;
      return finalPrice <= 0 ? 0 : finalPrice.toFixed(2);
    }
    return basePrice.toFixed(2);
  };

  // Handle plan selection with coupon info
  const handleSelectPlan = (plan) => {
    onSelectPlan(plan, {
      couponCode: couponStates[plan].applied ? couponStates[plan].code : '',
      discount: couponStates[plan].discount,
      basePrice: getBasePrice(plan),
      finalPrice: getFinalPrice(plan)
    });
  };

  return (
    <div className="pricing-cards-container">
      <div className="pricing-cards-row">
        {/* Card 1: The Cheatsheet */}
        <div className="pricing-card">
          <h3>The Cheatsheet</h3>
          <div className="price">
            <span className="amount">$14.99</span>
            <span className="period">One time</span>
          </div>
          
          <p className="description">
            New full applicant profile added every couple days.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>Advice and reflections from successful applicants</li>
            <li>Which medical schools an applicant was accepted</li>
            <li>Extra-curriculars that got them in</li>
            <li>MCAT and GPA that got them in</li>
            <li>Gap years they took</li>
          </ul>
          
          {/* Coupon section */}
          <div className="coupon-section">
            {!couponStates.cheatsheet.showInput ? (
              <div className="coupon-prompt" onClick={() => toggleCouponInput('cheatsheet')}>
                Have a coupon code? Enter it here
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponStates.cheatsheet.code}
                  onChange={(e) => handleCouponChange('cheatsheet', e.target.value)}
                  disabled={couponStates.cheatsheet.applied}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={() => applyCoupon('cheatsheet')}
                  disabled={couponStates.cheatsheet.applied}
                >
                  {couponStates.cheatsheet.applied ? 'Applied' : 'Apply'}
                </button>
              </div>
            )}
            
            {couponStates.cheatsheet.applied && (
              <>
                <div className="discount-text">
                  {couponStates.cheatsheet.discount}% discount applied!
                </div>
                <div className="final-price">
                  Final Price: ${getFinalPrice('cheatsheet')}
                </div>
              </>
            )}
          </div>
          
          <button 
            className="sign-up-button" 
            onClick={() => handleSelectPlan('cheatsheet')}
          >
            Sign up
          </button>
        </div>

        {/* Card 2: The Cheatsheet + */}
        <div className="pricing-card">
          <h3>The Cheatsheet +</h3>
          <div className="price">
            <span className="amount">$29.99</span>
            <span className="period">One time</span>
          </div>
          
          <p className="description">
            Get everything in the Premed Cheatsheet + extra resources.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>The Premed Cheatsheet</li>
            <li>Proven cold emailing templates</li>
            <li>Polished CV template</li>
            <li>Pre-med summer program database</li>
            <li>MCAT-Optimized Course Schedules & Study Plan</li>
          </ul>
          
          {/* Coupon section */}
          <div className="coupon-section">
            {!couponStates['cheatsheet-plus'].showInput ? (
              <div className="coupon-prompt" onClick={() => toggleCouponInput('cheatsheet-plus')}>
                Have a coupon code? Enter it here
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponStates['cheatsheet-plus'].code}
                  onChange={(e) => handleCouponChange('cheatsheet-plus', e.target.value)}
                  disabled={couponStates['cheatsheet-plus'].applied}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={() => applyCoupon('cheatsheet-plus')}
                  disabled={couponStates['cheatsheet-plus'].applied}
                >
                  {couponStates['cheatsheet-plus'].applied ? 'Applied' : 'Apply'}
                </button>
              </div>
            )}
            
            {couponStates['cheatsheet-plus'].applied && (
              <>
                <div className="discount-text">
                  {couponStates['cheatsheet-plus'].discount}% discount applied!
                </div>
                <div className="final-price">
                  Final Price: ${getFinalPrice('cheatsheet-plus')}
                </div>
              </>
            )}
          </div>
          
          <button 
            className="sign-up-button" 
            onClick={() => handleSelectPlan('cheatsheet-plus')}
          >
            Sign up
          </button>
        </div>
      </div>
      
      <div className="pricing-cards-row">
        {/* Card 3: Application Cheatsheet */}
        <div className="pricing-card">
          <h3>Application Cheatsheet</h3>
          <div className="price">
            <span className="amount">$19.99</span>
            <span className="period">One time</span>
          </div>
          
          <p className="description">
            Complete guide to medical school applications.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>Personal statement writing guide</li>
            <li>Activity section description guide</li>
            <li>Insider advice on what admissions committees want</li>
            <li>General writing strategy guide</li>
            <li>Letter of recommendation email template</li>
          </ul>
          
          {/* Coupon section */}
          <div className="coupon-section">
            {!couponStates.application.showInput ? (
              <div className="coupon-prompt" onClick={() => toggleCouponInput('application')}>
                Have a coupon code? Enter it here
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponStates.application.code}
                  onChange={(e) => handleCouponChange('application', e.target.value)}
                  disabled={couponStates.application.applied}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={() => applyCoupon('application')}
                  disabled={couponStates.application.applied}
                >
                  {couponStates.application.applied ? 'Applied' : 'Apply'}
                </button>
              </div>
            )}
            
            {couponStates.application.applied && (
              <>
                <div className="discount-text">
                  {couponStates.application.discount}% discount applied!
                </div>
                <div className="final-price">
                  Final Price: ${getFinalPrice('application')}
                </div>
              </>
            )}
          </div>
          
          <button 
            className="sign-up-button" 
            onClick={() => handleSelectPlan('application')}
          >
            Sign up
          </button>
        </div>

        {/* Card 4: Application Cheatsheet + */}
        <div className="pricing-card">
          <h3>Application Cheatsheet +</h3>
          <div className="price">
            <span className="amount">$34.99</span>
            <span className="period">One time</span>
          </div>
          
          <p className="description">
            Get everything in the Premed Cheatsheet + Application Cheatsheet.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>The Premed Cheatsheet</li>
            <li>The Application Cheatsheet</li>
            <li>Proven cold emailing templates</li>
            <li>Polished CV template</li>
            <li>Complete med school application guides</li>
          </ul>
          
          {/* Coupon section */}
          <div className="coupon-section">
            {!couponStates['application-plus'].showInput ? (
              <div className="coupon-prompt" onClick={() => toggleCouponInput('application-plus')}>
                Have a coupon code? Enter it here
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponStates['application-plus'].code}
                  onChange={(e) => handleCouponChange('application-plus', e.target.value)}
                  disabled={couponStates['application-plus'].applied}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={() => applyCoupon('application-plus')}
                  disabled={couponStates['application-plus'].applied}
                >
                  {couponStates['application-plus'].applied ? 'Applied' : 'Apply'}
                </button>
              </div>
            )}
            
            {couponStates['application-plus'].applied && (
              <>
                <div className="discount-text">
                  {couponStates['application-plus'].discount}% discount applied!
                </div>
                <div className="final-price">
                  Final Price: ${getFinalPrice('application-plus')}
                </div>
              </>
            )}
          </div>
          
          <button 
            className="sign-up-button" 
            onClick={() => handleSelectPlan('application-plus')}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCards;