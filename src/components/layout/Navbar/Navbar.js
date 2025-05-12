// src/components/layout/Navbar/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthChange, logoutUser } from '../../../firebase/authService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import logo from '../../../assets/icons/Icon.png';
import './Navbar.scss';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
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

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Left side with logo and main nav links */}
          <div className="navbar-left">
            <Link to={user ? "/profile" : "/"} className="logo" onClick={closeMobileMenu}>
              <img src={logo} alt="PremedCheatsheet" />
              <span>PremedCheatsheet</span>
            </Link>
            
            {/* Primary navigation items - different depending on auth state */}
            {!user ? (
              <ul className="primary-menu">
                <li>
                  <Link to="/" onClick={closeMobileMenu}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" onClick={closeMobileMenu}>
                    About
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="primary-menu">
                <li>
                  <Link to="/profile" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin" onClick={closeMobileMenu}>
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>
          
          {/* Right side with login and CTA */}
          <div className="navbar-right">
            {user ? (
              <>
                <span className="user-email">
                  {userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}` : user.email}
                </span>
                <button onClick={handleLogout} className="logout-button">
                  Sign Out
                </button>
              </>
            ) : hasAccess() ? (
              <>
                <span className="user-status">Guest Access</span>
                <button onClick={handleLogout} className="logout-button">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/checkout?mode=login" className="login-link">
                  Log in
                </Link>
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
              {!user ? (
                <>
                  <li>
                    <Link to="/" onClick={closeMobileMenu}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={closeMobileMenu}>
                      About
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/profile" onClick={closeMobileMenu}>
                      Dashboard
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link to="/admin" onClick={closeMobileMenu}>
                        Admin
                      </Link>
                    </li>
                  )}
                </>
              )}
              
              {user || hasAccess() ? (
                <li>
                  <button onClick={handleLogout} className="logout-button-mobile">
                    Sign Out
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/checkout?mode=login" onClick={closeMobileMenu}>
                      Log in
                    </Link>
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
    </nav>
  );
};

export default Navbar;