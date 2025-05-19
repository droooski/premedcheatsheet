// src/pages/Account/AddressesPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import SavedAddresses from '../../components/address/SavedAddresses';
import AddressForm from '../../components/address/AddressForm';
import './AddressesPage.scss';

const AddressesPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleSaveComplete = () => {
    setShowAddForm(false);
    // You could add a success message here if desired
  };

  return (
    <div className="addresses-page">
      <Navbar />
      
      <div className="addresses-content">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Addresses</h1>
            <div className="header-actions">
              <button className="back-button" onClick={() => navigate('/account')}>
                Back to Account
              </button>
            </div>
          </div>
          
          {!showAddForm ? (
            <div className="addresses-section">
              <SavedAddresses showAddNew={false} />
              
              <div className="add-address">
                <button 
                  className="add-address-button"
                  onClick={() => setShowAddForm(true)}
                >
                  Add New Address
                </button>
              </div>
              
              <div className="address-info-note">
                <h3>Why save your addresses?</h3>
                <ul>
                  <li>Streamline your checkout process</li>
                  <li>Easily manage multiple shipping locations</li>
                  <li>Keep track of your billing information</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="add-address-form-section">
              <h2>Add New Address</h2>
              
              <AddressForm 
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

export default AddressesPage;