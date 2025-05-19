// src/components/address/SavedAddresses.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './SavedAddresses.scss';

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const db = getFirestore();

  // Load addresses from user profile
  useEffect(() => {
    if (userProfile) {
      setAddresses(userProfile.addresses || []);
    }
    setLoading(false);
  }, [userProfile]);

  // Handle making an address the default
  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      
      // Update all addresses, setting only the selected one as default
      const updatedAddresses = addresses.map(address => ({
        ...address,
        isDefault: address.id === addressId
      }));
      
      // Update in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      setLoading(false);
    } catch (error) {
      console.error("Error setting default address:", error);
      setError("Failed to update default address. Please try again.");
      setLoading(false);
    }
  };

  // Handle deleting an address
  const handleDeleteAddress = async (addressId) => {
    try {
      setLoading(true);
      
      // Filter out the address to delete
      const updatedAddresses = addresses.filter(address => address.id !== addressId);
      
      // Update in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      setShowDeleteConfirm(null);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting address:", error);
      setError("Failed to delete address. Please try again.");
      setLoading(false);
    }
  };

  // Navigate to edit address page
  const handleEditAddress = (addressId) => {
    navigate(`/account/addresses/edit/${addressId}`);
  };

  if (loading) {
    return <div className="loading">Loading addresses...</div>;
  }

  return (
    <div className="saved-addresses">
      <div className="addresses-header">
        <h2>Saved Addresses</h2>
        <button 
          className="add-address-button"
          onClick={() => navigate('/account/addresses/add')}
        >
          Add New Address
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {addresses.length === 0 ? (
        <div className="no-addresses">
          <p>You don't have any saved addresses yet.</p>
          <button 
            className="add-first-address"
            onClick={() => navigate('/account/addresses/add')}
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="addresses-list">
          {addresses.map(address => (
            <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              {address.isDefault && <div className="default-badge">Default</div>}
              
              <div className="address-details">
                <p className="address-name">{address.fullName}</p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
                {address.phone && <p>Phone: {address.phone}</p>}
              </div>
              
              <div className="address-actions">
                {!address.isDefault && (
                  <button 
                    className="set-default-button"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={loading}
                  >
                    Set as Default
                  </button>
                )}
                
                <button 
                  className="edit-button"
                  onClick={() => handleEditAddress(address.id)}
                  disabled={loading}
                >
                  Edit
                </button>
                
                <button 
                  className="delete-button"
                  onClick={() => setShowDeleteConfirm(address.id)}
                  disabled={loading}
                >
                  Delete
                </button>
                
                {showDeleteConfirm === address.id && (
                  <div className="delete-confirm">
                    <p>Are you sure you want to delete this address?</p>
                    <div className="confirm-actions">
                      <button 
                        className="confirm-yes"
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={loading}
                      >
                        Yes, Delete
                      </button>
                      <button 
                        className="confirm-no"
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;