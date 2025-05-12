// src/components/layout/Navbar/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthChange, logoutUser } from '../../../firebase/authService';
import logo from '../../../assets/icons/Icon.png';
import './Navbar.scss';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      
      // Check if user is admin
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Left side with logo and main nav links */}
          <div className="navbar-left">
            <Link to="/" className="logo" onClick={closeMobileMenu}>
              <img src={logo} alt="PremedCheatsheet" />
              <span>PremedCheatsheet</span>
            </Link>
            
            {/* Primary navigation items */}
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
              {user && (
                <li>
                  <Link to="/profile" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={closeMobileMenu}>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          {/* Right side with login and CTA */}
          <div className="navbar-right">
            {user ? (
              <>
                <span className="user-email">{user.email}</span>
                <button onClick={handleLogout} className="logout-button">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link">
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
              {user && (
                <li>
                  <Link to="/profile" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={closeMobileMenu}>
                    Admin
                  </Link>
                </li>
              )}
              {user ? (
                <li>
                  <button onClick={handleLogout} className="logout-button-mobile">
                    Sign Out
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={closeMobileMenu}>
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