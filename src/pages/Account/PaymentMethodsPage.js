// src/pages/Account/PaymentMethodsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import SavedPaymentMethods from '../../components/payment/SavedPaymentMethods';
import SavePaymentMethodForm from '../../components/payment/SavePaymentMethodForm';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './PaymentMethodsPage.scss';

const PaymentMethodsPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const db = getFirestore();

  // Fetch the latest payment methods directly from Firestore
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Always get the latest data directly from Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Fetched payment methods from Firestore:", userData.paymentMethods || []);
          setPaymentMethods(userData.paymentMethods || []);
        } else {
          setPaymentMethods([]);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [currentUser, db]);

  // Handle saving a new payment method
  const handleSaveComplete = (newMethod, updatedMethods) => {
    // If we got the complete updated list, use it directly
    if (updatedMethods) {
      setPaymentMethods(updatedMethods);
    } else {
      // Otherwise update the local list with the new method
      setPaymentMethods(prevMethods => {
        const existingIndex = prevMethods.findIndex(method => method.id === newMethod.id);
        
        if (existingIndex >= 0) {
          // Replace existing method
          const newMethods = [...prevMethods];
          newMethods[existingIndex] = newMethod;
          return newMethods;
        } else {
          // Add new method
          return [...prevMethods, newMethod];
        }
      });
    }
    
    setShowAddForm(false); // Hide form after save
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
              <SavedPaymentMethods 
                showAddNew={false}
                showInfoSection={false}
                paymentMethods={paymentMethods}
                setPaymentMethods={setPaymentMethods}
                loading={loading}
                forceDataFromProps={true}
              />
              
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