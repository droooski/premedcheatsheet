// src/pages/Account/AccountPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import { onAuthChange, logoutUser, getUserProfile } from '../../firebase/authService';
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
  const [emailVerified, setEmailVerified] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      const unsubscribe = onAuthChange(async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setEmailVerified(currentUser.emailVerified);
          
          // Fetch user profile data
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              const profileData = userDoc.data();
              setUserProfile(profileData);
              
              // Check subscription status
              if (profileData.subscriptions && profileData.subscriptions.length > 0) {
                const activeSubscription = profileData.subscriptions.find(sub => {
                  return sub.active && new Date(sub.endDate) > new Date();
                });
                
                if (activeSubscription) {
                  setSubscriptionStatus('active');
                  setSubscriptionDetails(activeSubscription);
                  setRenewalDate(new Date(activeSubscription.endDate));
                  setDigitalProducts([
                    { id: 1, name: "PremedCheatsheet Members Access", status: "Active" },
                    { id: 2, name: "Application Cheatsheet", status: "Active" }
                  ]);
                }
              }
              
              // Set exact order data to match the screenshot
              setOrders([
                { id: "00650", date: "2023-04-15", status: "completed", total: "$59.99" }
              ]);
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
    setResendingEmail(true);
    try {
      // Mock verification email sending
      setTimeout(() => {
        alert("Verification email has been resent to your email address");
        setResendingEmail(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending verification email:", error);
      alert("Error sending verification email. Please try again later.");
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
            <h1 className="page-title">Account</h1>
            <div className="account-actions-top">
              <button className="back-button" onClick={() => navigate(-1)}>BACK</button>
              <button className="close-button" onClick={() => navigate('/profile')}>CLOSE</button>
            </div>
          </div>
          
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
            
            {/* Profile Section (Moved to top) */}
            <div className="account-card">
              <h2 className="section-title">Profile</h2>
              <div className="section-content">
                <p className="profile-email">{user?.email || 'Guest User'}</p>
                {/* <button className="edit-button">Edit Profile</button> */}
              </div>
            </div>
            
            {/* Address Section (Moved up) */}
            <div className="account-card">
              <h2 className="section-title">Address</h2>
              <div className="section-content empty">
                <p className="section-summary">No saved addresses</p>
                {/* <button className="add-new-button">Add Address</button> */}
              </div>
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
                        <span className="product-name">{product.name}</span>
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
              <div className="section-content empty">
                <p className="section-summary">No saved payments</p>
                {/* <button className="add-new-button">Add Payment Method</button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountPage;