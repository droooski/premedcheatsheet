// src/pages/Account/AddressesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import SavedAddresses from '../../components/address/SavedAddresses';
import AddressForm from '../../components/address/AddressForm';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './AddressesPage.scss';

const AddressesPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Removed userProfile since it's not used
  const db = getFirestore();

  // Fetch the latest addresses directly from Firestore
  useEffect(() => {
    const fetchUserAddresses = async () => {
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
          setAddresses(userData.addresses || []);
        } else {
          setAddresses([]);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAddresses();
  }, [currentUser, db]);// Re-fetch when currentUser changes

  // Handle saved address
  const handleSaveComplete = (newAddress, updatedAddresses) => {
    // If we got the complete updated list, use it directly
    if (updatedAddresses) {
      setAddresses(updatedAddresses);
    } else {
      // Otherwise update the local list with the new address
      setAddresses(prevAddresses => {
        const existingIndex = prevAddresses.findIndex(addr => addr.id === newAddress.id);
        
        if (existingIndex >= 0) {
          // Replace existing address
          const newAddresses = [...prevAddresses];
          newAddresses[existingIndex] = newAddress;
          return newAddresses;
        } else {
          // Add new address
          return [...prevAddresses, newAddress];
        }
      });
    }
    
    setShowAddForm(false); // Hide form after save
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
              {/* Pass setAddresses to SavedAddresses to allow it to update state directly */}
              <SavedAddresses 
                showAddNew={false} 
                showInfoSection={false} 
                addresses={addresses}
                setAddresses={setAddresses}
                loading={loading}
                forceDataFromProps={true} // Add this prop to force using the prop data
              />
              
              <div className="add-address">
                <button 
                  className="add-address-button"
                  onClick={() => setShowAddForm(true)}
                >
                  Add New Address
                </button>
              </div>
              
              {/* Add the info section here in the page */}
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