// src/pages/Account/PaymentMethodsPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import SavedPaymentMethods from '../../components/payment/SavedPaymentMethods';
import SavePaymentMethodForm from '../../components/payment/SavePaymentMethodForm';
import './PaymentMethodsPage.scss';

const PaymentMethodsPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleSaveComplete = () => {
    setShowAddForm(false);
    // You could add a success message here if desired
  };

  return (
    <div className="payment-methods-page">
      <Navbar />
      
      <div className="payment-methods-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Payment Methods</h1>
            <div className="header-actions">
              <button className="back-button" onClick={() => navigate('/account')}>
                Back to Account
              </button>
            </div>
          </div>
          
          {!showAddForm ? (
            <div className="payment-methods-section">
              <SavedPaymentMethods showAddNew={false} />
              
              <div className="add-payment-method">
                <button 
                  className="add-payment-button"
                  onClick={() => setShowAddForm(true)}
                >
                  Add Payment Method
                </button>
              </div>
              
              <div className="payment-info-note">
                <h3>Why save your payment information?</h3>
                <ul>
                  <li>Faster checkout experience</li>
                  <li>Secure storage - your full card details are never saved</li>
                  <li>Easy to manage - add or remove payment methods anytime</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="add-payment-form-section">
              <h2>Add Payment Method</h2>
              
              <SavePaymentMethodForm 
                onSave={handleSaveComplete}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentMethodsPage;