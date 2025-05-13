// src/components/layout/Navbar/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthChange, logoutUser } from '../../../firebase/authService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AuthModal from '../../auth/AuthModal';
import logo from '../../../assets/icons/Icon.png';
import './Navbar.scss';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      console.log("Navbar - Auth state changed:", currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            console.log("User profile data:", profileData);
            setUserProfile(profileData);
            setIsAdmin(profileData.isAdmin === true);
          } else {
            console.log("No user profile found");
            setUserProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } else {
        // Check if guest access is enabled
        const guestAccess = localStorage.getItem('guestAccess');
        const guestExpiry = localStorage.getItem('guestAccessExpiry');
        
        if (guestAccess === 'true' && guestExpiry && parseInt(guestExpiry) > Date.now()) {
          console.log("Guest access active");
        } else {
          // Clear guest access if expired
          if (guestAccess) {
            localStorage.removeItem('guestAccess');
            localStorage.removeItem('guestAccessExpiry');
          }
        }
        
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Clear any guest access tokens
      localStorage.removeItem('guestAccess');
      localStorage.removeItem('guestAccessExpiry');
      
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to handle login button click
  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowAuthModal(true);
    closeMobileMenu();
  };

  // Handle auth modal success
  const handleAuthSuccess = (userData) => {
    console.log("Auth success in navbar:", userData);
    setShowAuthModal(false);
    
    // If we're already on checkout page, refresh the component
    if (location.pathname.includes('/checkout')) {
      window.location.reload();
    }
  };

  // Check if user has active subscription or guest access
  const hasAccess = () => {
    if (userProfile && userProfile.subscriptions && userProfile.subscriptions.length > 0) {
      // Check if any subscription is active
      const hasActiveSubscription = userProfile.subscriptions.some(sub => {
        return sub.active && new Date(sub.endDate) > new Date();
      });
      
      return hasActiveSubscription;
    }
    
    // Check for guest access
    const guestAccess = localStorage.getItem('guestAccess');
    const guestExpiry = localStorage.getItem('guestAccessExpiry');
    
    return guestAccess === 'true' && guestExpiry && parseInt(guestExpiry) > Date.now();
  };

  // Determine if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Check if user is authenticated or has access
  const isAuthenticated = user || hasAccess();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Left side with logo, brand name, and primary navigation */}
          <div className="navbar-left">
            <Link to={isAuthenticated ? "/profile" : "/"} className="logo" onClick={closeMobileMenu}>
              <img src={logo} alt="PremedCheatsheet" />
              <span>PremedCheatsheet</span>
            </Link>
            
            {/* Primary navigation (Home, About, Pricing) - Only show when NOT logged in */}
            {!isAuthenticated && (
              <ul className="primary-menu">
                <li>
                  <Link to="/" className={isActive('/') ? 'active' : ''} onClick={closeMobileMenu}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className={isActive('/about') ? 'active' : ''} onClick={closeMobileMenu}>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className={isActive('/pricing') ? 'active' : ''} onClick={closeMobileMenu}>
                    Pricing
                  </Link>
                </li>
              </ul>
            )}
          </div>
          
          {/* Center navigation - only shown when logged in */}
          {isAuthenticated && (
            <div className="navbar-center">
              <ul className="main-menu">
                <li>
                  <Link 
                    to="/profile" 
                    className={isActive('/profile') ? 'active' : ''}
                    onClick={closeMobileMenu}
                  >
                    Members
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/application-cheatsheet" 
                    className={isActive('/application-cheatsheet') ? 'active' : ''}
                    onClick={closeMobileMenu}
                  >
                    Application Cheatsheet
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link 
                      to="/admin" 
                      className={isActive('/admin') ? 'active' : ''}
                      onClick={closeMobileMenu}
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Right side with account or login links */}
          <div className="navbar-right">
            {isAuthenticated ? (
              <div className="account-menu">
                <Link to="/account" className="account-button">
                  Account
                </Link>
              </div>
            ) : (
              <>
                <a href="#" onClick={handleLoginClick} className="login-link">
                  Log in
                </a>
                <Link to="/signup" className="try-free-button">
                  Try it Free
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu toggle */}
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <ul className="mobile-menu-items">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link 
                      to="/profile" 
                      className={isActive('/profile') ? 'active' : ''}
                      onClick={closeMobileMenu}
                    >
                      Members
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/application-cheatsheet" 
                      className={isActive('/application-cheatsheet') ? 'active' : ''}
                      onClick={closeMobileMenu}
                    >
                      Application Cheatsheet
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link 
                        to="/admin" 
                        className={isActive('/admin') ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link 
                      to="/account" 
                      className={isActive('/account') ? 'active' : ''}
                      onClick={closeMobileMenu}
                    >
                      Account
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" onClick={closeMobileMenu} className={isActive('/') ? 'active' : ''}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={closeMobileMenu} className={isActive('/about') ? 'active' : ''}>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" onClick={closeMobileMenu} className={isActive('/pricing') ? 'active' : ''}>
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <a href="#" onClick={handleLoginClick}>
                      Log in
                    </a>
                  </li>
                  <li>
                    <Link to="/signup" className="try-free-mobile" onClick={closeMobileMenu}>
                      Try it Free
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
      
      {/* Auth Modal for login */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="login"
      />
    </nav>
  );
};

export default Navbar;