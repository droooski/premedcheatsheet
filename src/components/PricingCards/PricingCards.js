import React from 'react';
import './PricingCards.scss';

const PricingCards = ({ onSelectPlan }) => {
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
          
          <button 
            className="sign-up-button" 
            onClick={() => onSelectPlan('cheatsheet')}
          >
            Sign up
          </button>
          
          <p className="description">
            New full applicant profile added every couple days.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>✓ Advice and reflections from successful applicants</li>
            <li>✓ Which medical schools an applicant was accepted</li>
            <li>✓ Extra-curriculars that got them in</li>
            <li>✓ MCAT and GPA that got them in</li>
            <li>✓ Gap years they took</li>
          </ul>
        </div>

        {/* Card 2: The Cheatsheet + */}
        <div className="pricing-card">
          <h3>The Cheatsheet +</h3>
          <div className="price">
            <span className="amount">$29.99</span>
            <span className="period">One time</span>
          </div>
          
          <button 
            className="sign-up-button" 
            onClick={() => onSelectPlan('cheatsheet-plus')}
          >
            Sign up
          </button>
          
          <p className="description">
            Get everything in the Premed Cheatsheet + extra resources. New full applicant profile added every couple days.
          </p>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>✓ The Premed Cheatsheet</li>
            <li>✓ Proven cold emailing templates</li>
            <li>✓ Polished CV template</li>
            <li>✓ Pre-med summer program database</li>
            <li>✓ MCAT-Optimized Course Schedules & Study Plan</li>
          </ul>
        </div>

        {/* Card 3: Application Cheatsheet */}
        <div className="pricing-card">
          <h3>Application Cheatsheet</h3>
          <div className="price">
            <span className="amount">$19.99</span>
            <span className="period">One time</span>
          </div>
          
          <button 
            className="sign-up-button" 
            onClick={() => onSelectPlan('application')}
          >
            Sign up
          </button>
          
          <div className="divider"></div>
          
          <ul className="features-list">
            <li>✓ Personal statement writing guide</li>
            <li>✓ Activity section description guide</li>
            <li>✓ Insider advice on what admissions committees want</li>
            <li>✓ General writing strategy guide</li>
            <li>✓ Letter of recommendation email template</li>
          </ul>
        </div>
      </div>
      
      {/* Card 4: Application Cheatsheet + */}
      <div className="pricing-card application-plus">
        <h3>Application Cheatsheet +</h3>
        <div className="price">
          <span className="amount">$34.99</span>
          <span className="period">One time</span>
        </div>
        
        <button 
          className="sign-up-button" 
          onClick={() => onSelectPlan('application-plus')}
        >
          Sign up
        </button>
        
        <p className="description">
          Get everything in the Premed Cheatsheet + Application Cheatsheet. New full applicant profile added every couple days.
        </p>
        
        <div className="divider"></div>
        
        <ul className="features-list">
          <li>✓ The Premed Cheatsheet</li>
          <li>✓ The Application Cheatsheet</li>
        </ul>
      </div>
    </div>
  );
};

export default PricingCards;