// src/services/userService.js
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import app from '../firebase/config';

const db = getFirestore(app);

// Save a payment method to user document
export const savePaymentMethod = async (userId, paymentMethod) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    
    // Update user document with the new payment method
    await updateDoc(userRef, {
      paymentMethods: [...(userData.paymentMethods || []), paymentMethod]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving payment method:', error);
    return {
      success: false,
      error: error.message || 'Failed to save payment method'
    };
  }
};

// Save an address to user document
export const saveAddress = async (userId, address) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    
    // Update user document with the new address
    await updateDoc(userRef, {
      addresses: [...(userData.addresses || []), address]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving address:', error);
    return {
      success: false,
      error: error.message || 'Failed to save address'
    };
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (userId, paymentMethodId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    const paymentMethods = userData.paymentMethods || [];
    
    // Update all payment methods, setting only the selected one as default
    const updatedPaymentMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === paymentMethodId
    }));
    
    // Update user document
    await updateDoc(userRef, {
      paymentMethods: updatedPaymentMethods
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return {
      success: false,
      error: error.message || 'Failed to set default payment method'
    };
  }
};

// Set an address as default
export const setDefaultAddress = async (userId, addressId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    const userData = userDoc.data();
    const addresses = userData.addresses || [];
    
    // Update all addresses, setting only the selected one as default
    const updatedAddresses = addresses.map(address => ({
      ...address,
      isDefault: address.id === addressId
    }));
    
    // Update user document
    await updateDoc(userRef, {
      addresses: updatedAddresses
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting default address:', error);
    return {
      success: false,
      error: error.message || 'Failed to set default address'
    };
  }
};

const userService = {
  savePaymentMethod,
  saveAddress,
  setDefaultPaymentMethod,
  setDefaultAddress
};

export default userService;