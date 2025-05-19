// src/components/address/SavedAddresses.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './SavedAddresses.scss';

const SavedAddresses = ({ onSelectAddress, selectedAddressId, showAddNew = true }) => {
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
      setLoading(false);
    } else {
      setLoading(false);
    }
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

  // Handle address selection (for checkout process)
  const handleSelectAddress = (address) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  if (loading) {
    return <div className="loading-saved-addresses">Loading addresses...</div>;
  }

  return (
    <div className="saved-addresses">
      <div className="section-title">Saved Addresses</div>
      
      {error && <div className="error-message">{error}</div>}
      
      {addresses.length === 0 ? (
        <div className="no-saved-addresses">No saved addresses yet.</div>
      ) : (
        <div className="addresses-list">
          {addresses.map(address => (
            <div 
              key={address.id} 
              className={`address-card ${address.isDefault ? 'default' : ''} ${selectedAddressId === address.id ? 'selected' : ''}`}
              onClick={() => handleSelectAddress(address)}
            >
              <div className="address-icon">📍</div>
              <div className="address-details">
                <p className="address-name">{address.fullName}</p>
                <p className="address-line">{address.addressLine1}</p>
                {address.addressLine2 && <p className="address-line">{address.addressLine2}</p>}
                <p className="address-city-state">{address.city}, {address.state} {address.zipCode}</p>
                <p className="address-country">{address.country}</p>
                {address.phone && <p className="address-phone">{address.phone}</p>}
              </div>
              
              {!onSelectAddress && (
                <div className="address-actions">
                  {!address.isDefault && (
                    <button 
                      className="set-default-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      disabled={loading}
                    >
                      Set as Default
                    </button>
                  )}
                  
                  <button 
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/account/addresses/edit/${address.id}`);
                    }}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(address.id);
                    }}
                    disabled={loading}
                  >
                    Remove
                  </button>
                  
                  {showDeleteConfirm === address.id && (
                    <div className="delete-confirm">
                      <p>Are you sure you want to delete this address?</p>
                      <div className="confirm-actions">
                        <button 
                          className="confirm-yes"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address.id);
                          }}
                          disabled={loading}
                        >
                          Yes, Delete
                        </button>
                        <button 
                          className="confirm-no"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                className="remove-address-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(address.id);
                }}
                disabled={loading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      {showAddNew && (
        <div className="add-new-section">
          <button 
            className="add-new-button"
            onClick={() => navigate('/account/addresses/add')}
          >
            + Add New Address
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;