// src/components/PricingCards/PricingCards.js - 2 cards per row layout
import React, { useState } from 'react';
import './PricingCards.scss';

const PricingCards = ({ onSelectPlan }) => {
  // Coupon state for showing/hiding the input field
  const [showCouponInputs, setShowCouponInputs] = useState({
    'cheatsheet': false,
    'application': false,
    'cheatsheet-plus': false,
    'application-plus': false
  });
  
  // Coupon code values
  const [couponCodes, setCouponCodes] = useState({
    'cheatsheet': '',
    'application': '',
    'cheatsheet-plus': '',
    'application-plus': ''
  });
  
  // Coupon application status
  const [appliedCoupons, setAppliedCoupons] = useState({
    'cheatsheet': { applied: false, discount: 0 },
    'application': { applied: false, discount: 0 },
    'cheatsheet-plus': { applied: false, discount: 0 },
    'application-plus': { applied: false, discount: 0 }
  });

  // Define discount codes
  const discountCodes = {
    'PREMEDVIP': { rate: 10, description: 'VIP Discount' },
    'STUDENT2025': { rate: 20, description: 'Student Discount' },
    'PARTNER': { rate: 100, description: 'Partnership - 100% Off' }
  };

  // Toggle coupon input visibility
  const toggleCouponInput = (plan) => {
    setShowCouponInputs({
      ...showCouponInputs,
      [plan]: !showCouponInputs[plan]
    });
  };

  // Handle coupon code input change
  const handleCouponChange = (plan, value) => {
    setCouponCodes({
      ...couponCodes,
      [plan]: value
    });
  };

  // Apply coupon code
  const applyCoupon = (plan) => {
    const code = couponCodes[plan].toUpperCase();
    
    if (discountCodes[code]) {
      setAppliedCoupons({
        ...appliedCoupons,
        [plan]: {
          applied: true,
          discount: discountCodes[code].rate
        }
      });
      alert(`Coupon applied! ${discountCodes[code].description} (${discountCodes[code].rate}% off)`);
    } else {
      alert('Invalid coupon code. Please try again.');
    }
  };

  // Get base prices for plans
  const getPlanPrice = (plan) => {
    switch (plan) {
      case 'cheatsheet': return 14.99;
      case 'application': return 19.99;
      case 'cheatsheet-plus': return 29.99;
      case 'application-plus': return 34.99;
      default: return 0;
    }
  };

  // Get final price after discount
  const getFinalPrice = (plan) => {
    const basePrice = getPlanPrice(plan);
    if (appliedCoupons[plan].applied) {
      const discountAmount = (basePrice * appliedCoupons[plan].discount) / 100;
      return Math.max(0, basePrice - discountAmount).toFixed(2);
    }
    return basePrice.toFixed(2);
  };

  // Handle plan selection
  const handleSelectPlan = (plan) => {
    onSelectPlan(plan, {
      couponCode: appliedCoupons[plan].applied ? couponCodes[plan] : '',
      discount: appliedCoupons[plan].discount,
      finalPrice: getFinalPrice(plan)
    });
  };

  // Coupon prompt component
  const CouponPrompt = ({ plan }) => {
    return (
      <div className="coupon-section">
        {!showCouponInputs[plan] ? (
          <div className="coupon-prompt" onClick={() => toggleCouponInput(plan)}>
            Have a coupon code? Enter it here
          </div>
        ) : (
          <div className="coupon-input-group">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCodes[plan]}
              onChange={(e) => handleCouponChange(plan, e.target.value)}
              disabled={appliedCoupons[plan].applied}
            />
            <button
              className="apply-button"
              onClick={() => applyCoupon(plan)}
              disabled={appliedCoupons[plan].applied}
            >
              {appliedCoupons[plan].applied ? 'Applied' : 'Apply'}
            </button>
          </div>
        )}
        
        {appliedCoupons[plan].applied && (
          <div className="discount-info">
            <p className="discount-text">{appliedCoupons[plan].discount}% discount applied!</p>
            <p className="final-price">Final price: ${getFinalPrice(plan)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pricing-cards-container">
      {/* First row: The Cheatsheet and Application Cheatsheet */}
      <div className="pricing-row">
        {/* The Cheatsheet card */}
        <div className="pricing-card">
          <h3>The Cheatsheet</h3>
          <div className="price">
            <span className="amount">$14.99</span>
            <span className="period">One time</span>
          </div>
          
          <button 
            className="sign-up-button"
            onClick={() => handleSelectPlan('cheatsheet')}
          >
            Sign up
          </button>
          
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
          
          <CouponPrompt plan="cheatsheet" />
        </div>
        
        {/* Application Cheatsheet card */}
        <div className="pricing-card">
          <h3>Application Cheatsheet</h3>
          <div className="price">
            <span className="amount">$19.99</span>
            <span className="period">One time</span>
          </div>
          
          <button 
            className="sign-up-button"
            onClick={() => handleSelectPlan('application')}
          >
            Sign up
          </button>
          
          <ul className="features-list">
            <li>Personal statement writing guide</li>
            <li>Activity section description guide</li>
            <li>Insider advice on what admissions committees want</li>
            <li>General writing strategy guide</li>
            <li>Letter of recommendation email template</li>
          </ul>
          
          <CouponPrompt plan="application" />
        </div>
      </div>
      
      {/* Second row: The Cheatsheet+ and Application Cheatsheet+ */}
      <div className="pricing-row">
        {/* The Cheatsheet+ card */}
        <div className="pricing-card">
          <h3>The Cheatsheet +</h3>
          <div className="price">
            <span className="amount">$29.99</span>
            <span className="period">One time</span>
          </div>
          
          <button 
            className="sign-up-button"
            onClick={() => handleSelectPlan('cheatsheet-plus')}
          >
            Sign up
          </button>
          
          <p className="description">
            Get everything in the Premed Cheatsheet + extra resources. New full applicant profile added every couple days.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>The Premed Cheatsheet</li>
            <li>Proven cold emailing templates</li>
            <li>Polished CV template</li>
            <li>Pre-med summer program database</li>
            <li>MCAT-Optimized Course Schedules & Study Plan</li>
          </ul>
          
          <CouponPrompt plan="cheatsheet-plus" />
        </div>
        
        {/* Application Cheatsheet+ card - Styled like Image 1 */}
        <div className="pricing-card">
          <h3>Application Cheatsheet +</h3>
          <div className="price">
            <span className="amount">$34.99</span>
            <span className="period">One time</span>
          </div>
          
          <button 
            className="sign-up-button"
            onClick={() => handleSelectPlan('application-plus')}
          >
            Sign up
          </button>
          
          <p className="description">
            Get everything in the Premed Cheatsheet + Application Cheatsheet. New full applicant profile added every couple days.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>The Premed Cheatsheet</li>
            <li>The Application Cheatsheet</li>
          </ul>
          
          <CouponPrompt plan="application-plus" />
        </div>
      </div>
    </div>
  );
};

export default PricingCards;