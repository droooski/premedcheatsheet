import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import './Checkout.scss';

const Checkout = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const navigate = useNavigate();

  const togglePlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCheckout = () => {
    // Handle checkout process here
    // This would typically integrate with a payment processor
    alert('Checkout process would start here.');
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
                  Yearly (Save 20%)
                </div>
              </div>
              
              <div className="price-card">
                <div className="price-header">
                  <h3>{selectedPlan === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}</h3>
                  <div className="price">
                    <span className="amount">${selectedPlan === 'monthly' ? '19.99' : '191.90'}</span>
                    <span className="period">/{selectedPlan === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                </div>
                
                <ul className="features-list">
                  <li>Access to all accepted student profiles</li>
                  <li>Detailed stats: GPA, MCAT, extracurriculars</li>
                  <li>Application timelines and strategies</li>
                  <li>School selection insights</li>
                  <li>Personal statement guidance</li>
                  {selectedPlan === 'yearly' && <li>Priority access to new profiles</li>}
                  {selectedPlan === 'yearly' && <li>Download up to 50 profiles per month</li>}
                </ul>
                
                <button className="checkout-button" onClick={handleCheckout}>
                  Get Started Now
                </button>
                
                <p className="guarantee">
                  7-day money-back guarantee. No questions asked.
                </p>
              </div>
            </div>
            
            <div className="testimonials">
              <div className="testimonial">
                <p>"PremedCheatsheet was a game-changer for my application. Seeing what actually worked for others helped me focus my efforts and ultimately get accepted to my top-choice school."</p>
                <div className="author">- Sarah K., Stanford Medical School</div>
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