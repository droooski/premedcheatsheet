// src/pages/Account/AccountPage.js - Fully updated with proper data display

/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import { 
  onAuthChange, 
  logoutUser, 
  getUserProfile, 
  sendVerificationEmail,
  verifyEmail,
  updateEmailVerificationStatus
} from '../../firebase/authService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './AccountPage.scss';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [renewalDate, setRenewalDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [digitalProducts, setDigitalProducts] = useState([]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  // Helper function to determine upgrade options
  const getUpgradeOptions = (userProfile) => {
    // Get all plans the user currently has
    const currentPlans = [];
    if (userProfile?.subscriptions && userProfile.subscriptions.length > 0) {
      userProfile.subscriptions
        .filter(sub => sub.active)
        .forEach(sub => currentPlans.push(sub.plan));
    }
    
    // All available plans
    const allPlans = ['cheatsheet', 'cheatsheet-plus', 'application', 'application-plus'];
    
    // Return plans the user doesn't have yet
    return allPlans.filter(plan => !currentPlans.includes(plan));
  };

  // Helper function to get plan display names
  const getPlanDisplayName = (plan) => {
    const planNames = {
      'cheatsheet': 'The Cheatsheet',
      'cheatsheet-plus': 'The Cheatsheet+',
      'application': 'Application Cheatsheet', 
      'application-plus': 'Application Cheatsheet+'
    };
    return planNames[plan] || plan;
  };

  // Get user's current plan
  const getCurrentUserPlans = () => {
    if (userProfile?.subscriptions && userProfile.subscriptions.length > 0) {
      return userProfile.subscriptions
        .filter(sub => sub.active)
        .map(sub => sub.plan);
    }
    return ['cheatsheet']; // Default fallback
  };

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        console.log("Fetched profile data:", profileData); // Debug log
        setUserProfile(profileData);
        
        // Update subscription status and digital products
        if (profileData.subscriptions && profileData.subscriptions.length > 0) {
          const activeSubscriptions = profileData.subscriptions.filter(sub => sub.active);
          if (activeSubscriptions.length > 0) {
            setSubscriptionStatus('active');
            
            // Create digital products based on actual plans purchased
            const digitalProductList = [];
            const uniquePlans = [...new Set(activeSubscriptions.map(sub => sub.plan))];
            
            uniquePlans.forEach(plan => {
              switch(plan) {
                case 'cheatsheet':
                  digitalProductList.push({ 
                    id: 1, 
                    name: "Premed Cheatsheet Members Access", 
                    status: "Active",
                    description: "Access to applicant profiles"
                  });
                  break;
                case 'cheatsheet-plus':
                  digitalProductList.push({ 
                    id: 2, 
                    name: "Premed Cheatsheet+ Members Access", 
                    status: "Active",
                    description: "Access to profiles + extra resources"
                  });
                  break;
                case 'application':
                  digitalProductList.push({ 
                    id: 3, 
                    name: "Application Cheatsheet Access", 
                    status: "Active",
                    description: "Application writing guides and templates"
                  });
                  break;
                case 'application-plus':
                  digitalProductList.push({ 
                    id: 4, 
                    name: "Application Cheatsheet+ Access", 
                    status: "Active",
                    description: "Complete access to all features"
                  });
                  break;
                default:
                  // Handle unknown plan types
                  digitalProductList.push({ 
                    id: digitalProductList.length + 1, 
                    name: "PremedCheatsheet Access", 
                    status: "Active",
                    description: "Basic access"
                  });
                  break;
              }
            });
            
            setDigitalProducts(digitalProductList);
          }
        }
        
        // Update orders display - Show ALL orders, not just the first one
        if (profileData.orders && profileData.orders.length > 0) {
          const formattedOrders = profileData.orders.map((order, index) => ({
            id: order.orderId || `00${650 + index}`,
            date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: order.status || "completed",
            total: `$${order.amount ? order.amount.toFixed(2) : "0.00"}`,
            plan: order.plan || "",
            planName: order.planName || getPlanDisplayName(order.plan)
          }));
          
          // Sort orders by date (newest first)
          formattedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
          setOrders(formattedOrders);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [user, db]);

  // Handle email verification from link
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    const oobCode = queryParams.get('oobCode');
    
    const handleVerification = async () => {
      // If this is an email verification link
      if (mode === 'verifyEmail' && oobCode) {
        try {
          setLoading(true);
          const result = await verifyEmail(oobCode);
          
          if (result.success) {
            setVerificationSuccess(true);
            setEmailVerified(true);
            
            // Clear URL parameters after successful verification
            navigate('/account', { replace: true });
          } else {
            setVerificationError(result.error.message || 'Verification failed');
          }
        } catch (error) {
          console.error("Error handling verification:", error);
          setVerificationError('An error occurred during verification');
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (mode === 'verifyEmail' && oobCode) {
      handleVerification();
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      const unsubscribe = onAuthChange(async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          
          // Check Firebase auth email verification status
          setEmailVerified(currentUser.emailVerified);
          
          // If email was just verified, update Firestore
          if (currentUser.emailVerified) {
            await updateEmailVerificationStatus(currentUser.uid, true);
          }
          
          // Fetch user profile data
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              const profileData = userDoc.data();
              console.log("LOADED USER PROFILE:", profileData); // Debug log
              console.log("Payment methods:", profileData.paymentMethods || []); // Debug payment methods
              console.log("Addresses:", profileData.addresses || []); // Debug addresses
              console.log("Orders:", profileData.orders || []); // Debug orders
              setUserProfile(profileData);
              
              // Check subscription status
              if (profileData.subscriptions && profileData.subscriptions.length > 0) {
                // Get ALL active subscriptions (not just the first one)
                const activeSubscriptions = profileData.subscriptions.filter(sub => {
                  return sub.active && new Date(sub.endDate) > new Date();
                });
                
                if (activeSubscriptions.length > 0) {
                  setSubscriptionStatus('active');
                  
                  // Use the most recent subscription for renewal date
                  const mostRecentSub = activeSubscriptions.sort((a, b) => 
                    new Date(b.startDate) - new Date(a.startDate)
                  )[0];
                  setSubscriptionDetails(mostRecentSub);
                  setRenewalDate(new Date(mostRecentSub.endDate));
                  
                  // Create digital products based on ALL active plans
                  const digitalProductList = [];
                  const uniquePlans = [...new Set(activeSubscriptions.map(sub => sub.plan))];
                  
                  uniquePlans.forEach((plan, index) => {
                    let productName, description;
                    switch(plan) {
                      case 'cheatsheet':
                        productName = "Premed Cheatsheet Members Access";
                        description = "Access to applicant profiles";
                        break;
                      case 'cheatsheet-plus':
                        productName = "Premed Cheatsheet+ Members Access";
                        description = "Access to profiles + extra resources";
                        break;
                      case 'application':
                        productName = "Application Cheatsheet Access";
                        description = "Application writing guides and templates";
                        break;
                      case 'application-plus':
                        productName = "Application Cheatsheet+ Access";
                        description = "Complete access to all features";
                        break;
                      default:
                        productName = "PremedCheatsheet Access";
                        description = "Basic access";
                    }
                    
                    digitalProductList.push({ 
                      id: index + 1, 
                      name: productName,
                      description: description,
                      status: "Active" 
                    });
                  });
                  
                  // Set digital products from actual subscription data
                  setDigitalProducts(digitalProductList);
                }
              }
              
              // Use actual orders from user profile instead of hardcoded values
              if (profileData.orders && profileData.orders.length > 0) {
                const formattedOrders = profileData.orders.map((order, index) => ({
                  id: order.orderId || `00${650 + index}`,
                  date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : "2023-04-15",
                  status: order.status || "completed",
                  total: `$${order.amount ? order.amount.toFixed(2) : "0.00"}`,
                  plan: order.plan || "",
                  planName: order.planName || ""
                }));
                
                setOrders(formattedOrders);
              } else {
                setOrders([]);
              }
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          // Check if guest access is enabled
          const guestAccess = localStorage.getItem('guestAccess');
          const guestExpiry = localStorage.getItem('guestAccessExpiry');
          
          if (guestAccess === 'true' && guestExpiry && parseInt(guestExpiry) > Date.now()) {
            setSubscriptionStatus('guest');
            setRenewalDate(new Date(parseInt(guestExpiry)));
            setDigitalProducts([
              { id: 1, name: "PremedCheatsheet Members Access (Trial)", status: "Active" }
            ]);
          } else {
            // Redirect to home if not authenticated
            navigate('/');
          }
        }
        
        setLoading(false);
      });
      
      return unsubscribe;
    };
    
    fetchUserData();
  }, [navigate, db]);

  useEffect(() => {
    // Listen for navigation changes to refresh data after purchase
    const handleFocus = () => {
      if (user) {
        // Refresh user data when page gets focus (user returns from checkout)
        fetchUserData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, fetchUserData]);

  const handleLogout = async () => {
    try {
      // Clear guest access tokens
      localStorage.removeItem('guestAccess');
      localStorage.removeItem('guestAccessExpiry');
      
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    
    setResendingEmail(true);
    setVerificationError(null);
    
    try {
      const result = await sendVerificationEmail(user);
      
      if (result.success) {
        alert("Verification email has been sent to your email address. Please check your inbox.");
      } else {
        throw new Error(result.error.message || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      setVerificationError(error.message || "Error sending verification email. Please try again later.");
    } finally {
      setResendingEmail(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="account-page">
        <Navbar />
        <div className="account-content">
          <div className="container">
            <div className="loading-spinner">Loading account details...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="account-page">
      <Navbar />
      
      <div className="account-content">
        <div className="container">
          <div className="account-header">
            <h1 className="page-title">
              Account
              {emailVerified && (
                <span className="verified-badge" title="Email Verified">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" fill="#10B981" strokeWidth="2"/>
                    <path d="M7 11L10 14L15 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </h1>
            <div className="account-actions-top">
              <button className="back-button" onClick={() => navigate(-1)}>BACK</button>
              <button className="close-button" onClick={() => navigate('/profile')}>CLOSE</button>
            </div>
          </div>
          
          {/* Verification success message */}
          {verificationSuccess && (
            <div className="verification-success-banner">
              <p>Your email has been successfully verified. Thank you!</p>
            </div>
          )}
          
          {/* Verification error message */}
          {verificationError && (
            <div className="verification-error-banner">
              <p>{verificationError}</p>
            </div>
          )}
          
          {/* Email Verification Banner */}
          {user && !emailVerified && (
            <div className="verification-banner">
              <p>
                Your account is not verified yet. A verification email has been sent to {user.email}.
              </p>
              <button 
                className="resend-button" 
                onClick={handleResendVerification}
                disabled={resendingEmail}
              >
                {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
          
          <div className="account-main">
            <div className="account-card user-greeting">
              <h2>Hi, {userProfile?.firstName || 'User'}</h2>
              <button onClick={handleLogout} className="sign-out-button">
                Sign out
              </button>
            </div>
            
            {/* Profile Section */}
            <div className="account-card">
              <h2 className="section-title">Profile</h2>
              <div className="section-content">
                <p className="profile-email">
                  {user?.email || 'Guest User'}
                  {emailVerified && (
                    <span className="email-verified-tag" title="Email Verified">Verified</span>
                  )}
                </p>
                {/* <button className="edit-button">Edit Profile</button> */}
              </div>
            </div>
            
            {/* Address Section */}
            <div className="account-card">
              <h2 className="section-title">Address</h2>
              {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                <div className="section-content">
                  {/* Find default address, or fall back to first address if no default is set */}
                  {(() => {
                    const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || 
                                          userProfile.addresses[0];
                    
                    return (
                      <div className="addresses-list">
                        <div className="address-item">
                          <p className="address-name">{defaultAddress.name || defaultAddress.fullName}</p>
                          <p className="address-details">
                            {defaultAddress.line1 || defaultAddress.addressLine1}
                            {(defaultAddress.line2 || defaultAddress.addressLine2) && 
                              `, ${defaultAddress.line2 || defaultAddress.addressLine2}`}
                            <br />
                            {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode || defaultAddress.zipCode}
                            <br />
                            {defaultAddress.country}
                          </p>
                          {defaultAddress.isDefault && <span className="default-tag">Default</span>}
                        </div>
                        <button className="view-all-button" onClick={() => navigate('/account/addresses')}>
                          {userProfile.addresses.length > 1 ? 'Manage Addresses' : 'Manage Address'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="section-content empty">
                  <p className="section-summary">No saved addresses</p>
                  <button className="add-new-button" onClick={() => navigate('/account/addresses')}>Add Address</button>
                </div>
              )}
            </div>
            
            {/* Digital Products Section */}
            <div className="account-card">
              <h2 className="section-title">Digital Products</h2>
              {digitalProducts.length > 0 ? (
                <div className="section-content">
                  <p className="section-summary">{digitalProducts.length} Active Digital {digitalProducts.length === 1 ? 'Product' : 'Products'}</p>
                  <div className="products-list">
                    {digitalProducts.map(product => (
                      <div key={product.id} className="product-item">
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          {product.description && (
                            <p className="product-description">{product.description}</p>
                          )}
                        </div>
                        <span className={`product-status ${product.status.toLowerCase()}`}>
                          {product.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="section-content empty">
                  <p className="section-summary">No digital products</p>
                </div>
              )}
            </div>
            
            {/* Orders Section */}
            <div className="account-card">
              <h2 className="section-title">Orders</h2>
              {orders.length > 0 ? (
                <div className="section-content">
                  <p className="section-summary">
                    Last order #{orders[0].id} is {orders[0].status}
                  </p>
            <div className="orders-summary">
              {orders.slice(0, 3).map(order => (  // Show up to 3 recent orders
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <div className="order-details">
                    {order.planName && (
                      <p className="order-plan">{order.planName}</p>
                    )}
                    <span className="order-total">{order.total}</span>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
                  
                  {/* Upgrade Options */}
                  {(() => {
                    const availableUpgrades = getUpgradeOptions(userProfile);
                    
                    if (availableUpgrades.length > 0) {
                      return (
                        <div className="upgrade-options">
                          <h4>Add More Plans</h4>
                          <p>Get access to additional features by adding more plans.</p>
                          <div className="upgrade-buttons">
                            {availableUpgrades.map(plan => (
                              <button
                                key={plan}
                                className="upgrade-button"
                                onClick={() => navigate(`/checkout?plan=${plan}&upgrade=true`)}
                              >
                                Add {getPlanDisplayName(plan)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="max-plan-notice">
                          <p>🎉 You have access to all available plans!</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="section-content empty">
                  <p className="section-summary">No orders yet</p>
                </div>
              )}
            </div>
            
            {/* Payment Section */}
            <div className="account-card">
              <h2 className="section-title">Payment</h2>
              {userProfile?.paymentMethods && userProfile.paymentMethods.length > 0 ? (
                <div className="section-content">
                  <p className="section-summary">{userProfile.paymentMethods.length} Saved Payment {userProfile.paymentMethods.length === 1 ? 'Method' : 'Methods'}</p>
                  <div className="payment-methods-list">
                    {userProfile.paymentMethods.slice(0, 1).map(payment => (
                      <div key={payment.id} className="payment-item">
                        <p className="payment-info">
                          <span className="card-type">
                            {payment.cardType === 'Coupon' ? 'Free Purchase' : payment.cardType || 'Card'}
                          </span> ending in <span className="card-last4">{payment.lastFourDigits || '****'}</span>
                        </p>
                        <p className="payment-expiry">
                          {payment.expiryDate && payment.expiryDate !== 'N/A' ? `Expires: ${payment.expiryDate}` : ''}
                        </p>
                        {payment.isDefault && <span className="default-tag">Default</span>}
                      </div>
                    ))}
                    <button className="view-all-button" onClick={() => navigate('/account/payment-methods')}>
                      Manage Payment Methods
                    </button>
                  </div>
                </div>
              ) : (
                <div className="section-content empty">
                  <p className="section-summary">No saved payments</p>
                  <button className="add-new-button" onClick={() => navigate('/account/payment-methods')}>Add Payment Method</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountPage;