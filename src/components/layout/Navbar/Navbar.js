// src/components/layout/Navbar/Navbar.js - With Stable State Management
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // ADD STABLE STATE MANAGEMENT
  const [stableUserData, setStableUserData] = useState({
    isAuthenticated: false,
    isPaidUser: false,
    hasGuestAccess: false,
    userPlans: [],
    isAdmin: false
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  // Check for guest access
  const isGuest = () => {
    const guestAccess = localStorage.getItem('guestAccess');
    const guestExpiry = localStorage.getItem('guestAccessExpiry');
    
    return guestAccess === 'true' && guestExpiry && parseInt(guestExpiry) > Date.now();
  };

  // Helper function to determine user plan
  const getUserPlans = (userProfile) => {
    if (userProfile?.subscriptions && userProfile.subscriptions.length > 0) {
      return userProfile.subscriptions
        .filter(sub => sub.active)
        .map(sub => sub.plan);
    }
    return ['cheatsheet']; // default array
  };
  

  const hasAccessToProfiles = (plans) => {
    return plans.some(plan => ['cheatsheet', 'cheatsheet-plus', 'application-plus', 'interview-cheatsheet-plus'].includes(plan));
  };

  const hasAccessToCheatsheetPlus = (plans) => {
    return plans.some(plan => ['cheatsheet-plus'].includes(plan));
  };

  const hasAccessToApplication = (plans) => {
    return plans.some(plan => ['application', 'application-plus'].includes(plan));
  };

  const hasAccessToInterview = (plans) =>{
    return plans.some(plan => ['interview-cheatsheet', 'interview-cheatsheet-plus'].includes(plan));
  }

  // UPDATE STABLE STATE WHENEVER AUTH CHANGES
  useEffect(() => {
    const updateStableState = () => {
      const currentIsGuest = isGuest();
      const currentIsAuthenticated = !!user;
      const currentIsPaidUser = currentIsAuthenticated && paymentVerified;
      const currentUserPlans = getUserPlans(userProfile);
      
      // Only update if there's an actual change to prevent unnecessary re-renders
      setStableUserData(prevState => {
        const newState = {
          isAuthenticated: currentIsAuthenticated,
          isPaidUser: currentIsPaidUser,
          hasGuestAccess: currentIsGuest,
          userPlans: currentUserPlans,
          isAdmin: isAdmin
        };
        
        // Deep comparison to avoid unnecessary updates
        const hasChanged = JSON.stringify(prevState) !== JSON.stringify(newState);
        return hasChanged ? newState : prevState;
      });
    };
    
    // Update stable state whenever any dependency changes
    updateStableState();
  }, [user, paymentVerified, userProfile, isAdmin]);

  // Separate function to refresh user profile
  const refreshUserProfile = useCallback(async (currentUser) => {
    try {
      // Always fetch fresh user profile data
      const userDoc = await getDoc(doc(db, "users", currentUser.uid), { source: 'server' });
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        console.log("🔄 Fresh user profile data:", profileData);
        console.log("🔄 User subscriptions:", profileData.subscriptions);
        setUserProfile(profileData);
        setIsAdmin(profileData.isAdmin === true);
        
        // Check payment verification
        const hasVerifiedPayment = profileData.paymentVerified === true ||
          (profileData.subscriptions && 
          profileData.subscriptions.length > 0 && 
          profileData.subscriptions.some(sub => sub.active));
            
        setPaymentVerified(hasVerifiedPayment);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setPaymentVerified(false);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setUserProfile(null);
      setIsAdmin(false);
      setPaymentVerified(false);
    }
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      console.log("Navbar - Auth state changed:", currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        await refreshUserProfile(currentUser);
      } else {
        // Check if guest access is still valid
        if (isGuest()) {
          console.log("Guest access active");
        } else {
          localStorage.removeItem('guestAccess');
          localStorage.removeItem('guestAccessExpiry');
        }
        
        setUserProfile(null);
        setIsAdmin(false);
        setPaymentVerified(false);
      }
      
    });

    // Listen for multiple events that might indicate a purchase was completed
    const handleFocus = async () => {
      if (user) {
        console.log("🔄 Window focused - refreshing user profile");
        await refreshUserProfile(user);
      }
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden && user) {
        console.log("🔄 Page became visible - refreshing user profile");
        await refreshUserProfile(user);
      }
    };

    // Listen for storage events (when sessionStorage is updated after purchase)
    const handleStorageChange = async (e) => {
      if (e.key === 'paymentVerified' && e.newValue === 'true' && user) {
        console.log("🔄 Payment verified in storage - refreshing user profile");
        await refreshUserProfile(user);
      }
    };

    // Listen for custom events from other components
    const handleProfileUpdate = async () => {
      if (user) {
        console.log("🔄 Profile update event - refreshing user profile");
        await refreshUserProfile(user);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [db, user, refreshUserProfile]);


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
    
    navigate('/profile');
  };

  // Determine if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // USE STABLE STATE FOR RENDERING
    const { isAuthenticated, isPaidUser, hasGuestAccess, userPlans, isAdmin: stableIsAdmin } = stableUserData;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);


  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Left side with logo and brand name */}
          <div className="navbar-left">
            <Link to="/" className="logo" onClick={closeMobileMenu}>
              <img src={logo} alt="PremedCheatsheet" />
              <span>PremedCheatsheet</span>
            </Link>
            
            {/* Primary navigation - Show ONLY for non-authenticated or guest users */}
            {(!isAuthenticated || hasGuestAccess) && (
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
          
          {/* Center navigation - Only show when authenticated AND payment verified */}
          {isPaidUser && !hasGuestAccess && (
            <div className="navbar-center" ref={dropdownRef}>
              <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                Your Products ▼
              </button>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  {hasAccessToProfiles(userPlans) && (
                    <li>
                      <Link 
                        to="/profile" 
                        className={isActive('/profile') ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        Premed Cheatsheet Members
                      </Link>
                    </li>
                  )}
                  
                  {hasAccessToCheatsheetPlus(userPlans) && (
                    <li>
                      <Link 
                        to="/premed-cheatsheet-plus" 
                        className={isActive('/premed-cheatsheet-plus') ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        Cheatsheet+
                      </Link>
                    </li>
                  )}
                  
                  {hasAccessToApplication(userPlans) && (
                    <li>
                      <Link 
                        to="/application-cheatsheet" 
                        className={isActive('/application-cheatsheet') ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        Application Cheatsheet
                      </Link>
                    </li>
                  )}
                  {hasAccessToInterview(userPlans) && (
                    <li>
                      <Link 
                        to="/interview-cheatsheet" 
                        onClick={closeMobileMenu}
                      >
                        Interview Cheatsheet
                      </Link>
                    </li>
                  )}
                </ul>
                
              )}
            </div>
          )}

          
          {/* Right side with account or login links */}
          <div className="navbar-right">
            {isAuthenticated ? (
              // For verified authenticated users
              <div className="account-menu">
                <Link to="/account" className="account-button">
                  Account
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Log out
                </button>
              </div>
            ) : (
              // For ALL non-authenticated users (including guests)
              <>
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="login-link-button"
                >
                  Login
                </button>
                <Link to="/signup" className="try-free-button">
                  Join
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
              {isPaidUser ? (
                // For paid users - show member menu items based on their plan
                <>
                  {hasAccessToProfiles(userPlans) && (
                    <li>
                      <Link 
                        to="/profile" 
                        className={isActive('/profile') ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        Premed Cheatsheet Members
                      </Link>
                    </li>
                  )}
                  
                  {/* Cheatsheet+ Mobile Menu Item */}
                  {hasAccessToCheatsheetPlus(userPlans) && (
                    <li>
                      <Link 
                        to="/premed-cheatsheet-plus" 
                        className={isActive('/premed-cheatsheet-plus') ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        Cheatsheet+
                      </Link>
                    </li>
                  )}
                  
                  {hasAccessToApplication(userPlans) && (
                    <li>
                      <Link 
                        to="/application-cheatsheet" 
                        className={isActive('/application-cheatsheet') ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        Application Cheatsheet
                      </Link>
                    </li>
                  )}
                  
                  {stableIsAdmin && (
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
                  <li>
                    <button onClick={handleLogout} className="logout-button-mobile">
                      Log out
                    </button>
                  </li>
                </>
                ) : (
                // For guest users and non-authenticated users
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
                  {hasGuestAccess ? (
                    // For guest users, show upgrade option
                    <li>
                      <Link to="/pricing" className="try-free-mobile" onClick={closeMobileMenu}>
                        Upgrade
                      </Link>
                    </li>
                  ) : (
                    // For non-authenticated users
                    <>
                      <li>
                        <button
                          type="button"
                          className="mobile-login-button"
                          onClick={() => {
                            closeMobileMenu();
                            setShowAuthModal(true);
                          }}
                        >
                          Login
                        </button>
                      </li>
                      <li>
                        <Link to="/signup" className="try-free-mobile" onClick={closeMobileMenu}>
                          Join
                        </Link>
                      </li>
                    </>
                  )}
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