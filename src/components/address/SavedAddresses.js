// src/components/address/SavedAddresses.js
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { countries } from '../../utils/countries';
import './SavedAddresses.scss';

const SavedAddresses = ({ onSelectAddress, selectedAddressId, showAddNew = true, showInfoSection = true }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  
  const { currentUser, userProfile } = useAuth();
  const db = getFirestore();
  // Load addresses from user profile
  useEffect(() => {
    if (userProfile) {
      console.log("Loading addresses from profile:", userProfile.addresses || []);
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
      
      console.log("Setting default address:", addressId);
      console.log("Updated addresses:", updatedAddresses);
      
      // First get the latest user data to avoid overwriting recent changes
      const userRef = doc(db, "users", currentUser.uid);
      await getDoc(userRef); // Just to verify the doc exists
      
      // Update in Firestore
      await updateDoc(userRef, {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      setLoading(false);
      
      // Reload the page to reflect changes
      window.location.reload();
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
      
      // Get the latest user data first
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
      
      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      
      // Filter out the address to delete
      const updatedAddresses = currentAddresses.filter(address => address.id !== addressId);
      
      console.log("Deleting address:", addressId);
      console.log("Updated addresses after deletion:", updatedAddresses);
      
      // Update in Firestore
      await updateDoc(userRef, {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      setShowDeleteConfirm(null);
      setLoading(false);
      
      // Force reload to ensure all components reflect the update
      window.location.reload();
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
  
  // Handle opening edit form for an address
  const handleEdit = (e, address) => {
    e.stopPropagation();
    
    // Set the address being edited
    setEditingAddressId(address.id);
    
    // Initialize form with current address data
    setEditFormData({
      id: address.id,
      fullName: address.name || address.fullName || '',
      addressLine1: address.line1 || address.addressLine1 || '',
      addressLine2: address.line2 || address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.postalCode || address.zipCode || '',
      country: address.country || 'United States',
      phone: address.phone || '',
      isDefault: address.isDefault || false
    });
    
    console.log("Editing address:", address);
  };
  
  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Cancel editing
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingAddressId(null);
    setEditFormData({});
  };
  
  // Save updated address
  const handleSaveAddress = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      setSaveLoading(true);
      
      // Validate form
      if (!editFormData.fullName || !editFormData.addressLine1 || !editFormData.city || 
          !editFormData.state || !editFormData.zipCode || !editFormData.country) {
        throw new Error("Please fill in all required fields");
      }
      
      // Get the latest user data first
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
      
      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      
      // Find the address index
      const addressIndex = currentAddresses.findIndex(addr => addr.id === editingAddressId);
      
      if (addressIndex === -1) {
        throw new Error("Address not found");
      }
      
      // Create the updated address object
      const updatedAddress = {
        id: editFormData.id,
        fullName: editFormData.fullName,
        addressLine1: editFormData.addressLine1,
        addressLine2: editFormData.addressLine2,
        city: editFormData.city,
        state: editFormData.state,
        zipCode: editFormData.zipCode,
        country: editFormData.country,
        phone: editFormData.phone,
        isDefault: editFormData.isDefault
      };
      
      // If this is being set as default, update all others to not be default
      const updatedAddresses = currentAddresses.map(addr => {
        if (addr.id === updatedAddress.id) {
          return updatedAddress;
        }
        
        if (updatedAddress.isDefault) {
          return { ...addr, isDefault: false };
        }
        
        return addr;
      });
      
      // Update Firestore
      await updateDoc(userRef, {
        addresses: updatedAddresses
      });
      
      // Update local state
      setAddresses(updatedAddresses);
      setEditingAddressId(null);
      setEditFormData({});
      setSaveLoading(false);
      
      // Reload the page to ensure all components reflect the update
      window.location.reload();
    } catch (error) {
      console.error("Error saving address:", error);
      setError(error.message || "Failed to save address. Please try again.");
      setSaveLoading(false);
    }
  };
  
  // Handle adding a new address
  const handleAddNewAddress = () => {
    // Create a new blank address with a unique ID
    const newAddress = {
      id: uuidv4(),
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: addresses.length === 0 // Make default if it's the first address
    };
    
    // Set as the editing address
    setEditingAddressId(newAddress.id);
    setEditFormData(newAddress);
    
    // Add it to the addresses array (empty fields will be shown in edit mode)
    setAddresses(prev => [...prev, newAddress]);
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
              className={`address-card ${address.isDefault ? 'default' : ''} ${selectedAddressId === address.id ? 'selected' : ''} ${editingAddressId === address.id ? 'editing' : ''}`}
              onClick={() => handleSelectAddress(address)}
            >
              {editingAddressId === address.id ? (
                // Edit Form
                <div className="address-edit-form" onClick={e => e.stopPropagation()}>
                  <h3>Edit Address</h3>
                  <form onSubmit={handleSaveAddress}>
                    <div className="form-group">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={editFormData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="addressLine1">Address Line 1</label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={editFormData.addressLine1}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="addressLine2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={editFormData.addressLine2}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={editFormData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={editFormData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="zipCode">ZIP Code</label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={editFormData.zipCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <select
                        id="country"
                        name="country"
                        value={editFormData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a country</option>
                        {countries.map(country => (
                          <option key={country.code || country} value={country.name || country}>
                            {country.name || country}
                          </option>
                        ))}
                      </select>
                    </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Phone (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group checkbox">
                      <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={editFormData.isDefault}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isDefault">Set as default address</label>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="cancel-button"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="save-button"
                        disabled={saveLoading}
                      >
                        {saveLoading ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Display Mode
                <>
                  {/* {address.isDefault && <span className="default-badge">Default</span>} */}
                  
                  <div className="address-icon">📍</div>
                  <div className="address-details">
                    <p className="address-name">{address.name || address.fullName}</p>
                    <p className="address-line">{address.line1 || address.addressLine1}</p>
                    {(address.line2 || address.addressLine2) && (
                      <p className="address-line">{address.line2 || address.addressLine2}</p>
                    )}
                    <p className="address-city-state">
                      {address.city}, {address.state} {address.postalCode || address.zipCode}
                    </p>
                    <p className="address-country">{address.country}</p>
                    {address.phone && <p className="address-phone">{address.phone}</p>}
                    
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
                        onClick={(e) => handleEdit(e, address)}
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
                    </div>
                  </div>
                  
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showAddNew && (
        <div className="add-new-section">
          <button 
            className="add-new-button"
            onClick={handleAddNewAddress}
          >
            Add New Address
          </button>
        </div>
      )}
      
      {/* Information section about saving addresses - only show if prop is true */}
      {showInfoSection && (
        <div className="address-info-note">
          <h3>Why save your addresses?</h3>
          <ul>
            <li>Streamline your checkout process</li>
            <li>Easily manage multiple shipping locations</li>
            <li>Keep track of your billing information</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;