// src/components/address/AddressForm.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { countries } from '../../utils/countries';
import './AddressForm.scss';

const AddressForm = ({ initialAddress = {}, onSave, onCancel }) => {
  const [address, setAddress] = useState({
    id: initialAddress.id || uuidv4(),
    name: initialAddress.name || '',
    line1: initialAddress.line1 || '',
    line2: initialAddress.line2 || '',
    city: initialAddress.city || '',
    state: initialAddress.state || '',
    postalCode: initialAddress.postalCode || '',
    country: initialAddress.country || 'United States',
    phone: initialAddress.phone || '',
    isDefault: initialAddress.isDefault || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [saveToAccount, setSaveToAccount] = useState(true); // Default to true for better UX
  
  const { currentUser } = useAuth();
  const db = getFirestore();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!address.name || !address.line1 || !address.city || !address.state || !address.postalCode) {
        throw new Error('Please fill out all required fields');
      }

      // If user is logged in and wants to save the address
      if (currentUser) {
        // Get reference to user doc
        const userRef = doc(db, "users", currentUser.uid);
        
        // Get current user data first to manage defaults properly
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found");
        }
        
        const userData = userDoc.data();
        const currentAddresses = userData.addresses || [];
        
        // Create new address object with proper properties
        const newAddress = {
          id: address.id,
          name: address.name,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
          isDefault: address.isDefault
        };
        
        let updatedAddresses;
        if (address.isDefault) {
          // If this address is being set as default, make all other addresses non-default
          updatedAddresses = currentAddresses.map(addr => ({
            ...addr,
            isDefault: false // Set all existing addresses to non-default
          }));
          
          // Check if we're editing an existing address or adding a new one
          const existingIndex = updatedAddresses.findIndex(addr => addr.id === newAddress.id);
          if (existingIndex >= 0) {
            // Replace existing address
            updatedAddresses[existingIndex] = newAddress;
          } else {
            // Add new address
            updatedAddresses.push(newAddress);
          }
        } else {
          // If not setting as default, just add or update normally
          const existingIndex = currentAddresses.findIndex(addr => addr.id === newAddress.id);
          if (existingIndex >= 0) {
            // Update existing address
            updatedAddresses = [...currentAddresses];
            updatedAddresses[existingIndex] = newAddress;
          } else {
            // Add new address
            updatedAddresses = [...currentAddresses, newAddress];
          }
        }
        
        // Update in Firestore
        await updateDoc(userRef, {
          addresses: updatedAddresses
        });
        
        // Call onSave with the updated list - this is important for immediate UI update
        if (onSave) {
          onSave(newAddress, updatedAddresses);
        }
      } else {
        // Just pass back the new address if not saving to account
        if (onSave) {
          onSave(address);
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError(error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-form-container">
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-group">
          <label htmlFor="name">Full Name <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={address.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="line1">Address Line 1 <span className="required">*</span></label>
          <input
            type="text"
            id="line1"
            name="line1"
            value={address.line1}
            onChange={handleChange}
            placeholder="Street address, P.O. box, company name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="line2">Address Line 2</label>
          <input
            type="text"
            id="line2"
            name="line2"
            value={address.line2}
            onChange={handleChange}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City <span className="required">*</span></label>
            <input
              type="text"
              id="city"
              name="city"
              value={address.city}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="state">State/Province <span className="required">*</span></label>
            <input
              type="text"
              id="state"
              name="state"
              value={address.state}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="postalCode">Zip/Postal Code <span className="required">*</span></label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="country">Country <span className="required">*</span></label>
            <select
              id="country"
              name="country"
              value={address.country}
              onChange={handleChange}
              required
              className="country-select"
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
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={address.phone}
            onChange={handleChange}
            placeholder="For delivery questions only"
          />
        </div>
        
        {/* {currentUser && (
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="saveToAccount"
              checked={saveToAccount}
              onChange={(e) => setSaveToAccount(e.target.checked)}
            />
            <label htmlFor="saveToAccount">Save this address to my account</label>
          </div>
        )} */}
        
        <div className="form-checkbox">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={address.isDefault}
            onChange={handleChange}
          />
          <label htmlFor="isDefault">Set as default address</label>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save Address'}
          </button>
          {onCancel && (
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddressForm;