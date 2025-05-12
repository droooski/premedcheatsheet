// src/pages/Profile/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import ProfileCard from '../../components/sections/ProfileCard/ProfileCard';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import SchoolFilters from '../../components/SchoolFilters/SchoolFilters';
import ProfileSearch from '../../components/ProfileSearch/ProfileSearch';
import ProfileNavigation from '../../components/ProfileNavigation/ProfileNavigation';
import { onAuthChange, logoutUser } from '../../firebase/authService';
import { loadProfilesFromCSV, extractSchoolsFromProfiles, filterProfiles, filterAndSortSchools } from '../../utils/csvParser';
import './ProfilePage.scss';

const ProfilePage = () => {
  // State management
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('schools');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('alphabetical');
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // New state for enhanced features
  const [showPremedCheatsheet, setShowPremedCheatsheet] = useState(true); // Default to showing Premed Cheatsheet
  const [showApplicationCheatsheet, setShowApplicationCheatsheet] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    majors: [],
    gpaRanges: [],
    mcatRanges: []
  });
  
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // For demo, we'll simulate a user profile
        setUserProfile({
          firstName: currentUser.displayName?.split(' ')[0] || 'User',
          lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
          email: currentUser.email,
          subscriptions: [
            {
              plan: 'monthly',
              active: true,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      } else {
        // Redirect to home page if not authenticated
        navigate('/');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load data from CSV file
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from CSV...');
        // Load profiles from CSV
        const profilesData = await loadProfilesFromCSV();
        console.log(`Loaded ${profilesData.length} profiles from CSV`);
        
        // Extract schools from profiles
        const schoolsData = extractSchoolsFromProfiles(profilesData);
        console.log(`Extracted ${schoolsData.length} schools from profiles`);
        
        setProfiles(profilesData);
        setFilteredProfiles(profilesData);
        setSchools(schoolsData);
        setFilteredSchools(schoolsData);
      } catch (error) {
        console.error('Error loading data:', error);
        // Use mock data as fallback if needed
      }
    };
    
    // Only fetch data if user is authenticated
    if (!loading && user) {
      fetchData();
    }
  }, [user, loading]);

  // Update filtered schools when search or sort changes
  useEffect(() => {
    if (schools.length === 0) return;
    const filtered = filterAndSortSchools(schools, searchQuery, sortOption);
    setFilteredSchools(filtered);
  }, [searchQuery, sortOption, schools]);

  // Update filtered profiles when search or filters change
  useEffect(() => {
    if (profiles.length === 0) return;
    const filtered = filterProfiles(profiles, searchQuery, filterCriteria);
    setFilteredProfiles(filtered);
    // Reset current profile index when filters change
    setCurrentProfileIndex(0);
  }, [searchQuery, filterCriteria, profiles]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Navigate to next profile
  const goToNextProfile = () => {
    if (currentProfileIndex < filteredProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    }
  };

  // Navigate to previous profile
  const goToPrevProfile = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1);
    }
  };

  // Go to specific profile
  const goToProfileIndex = (index) => {
    if (index >= 0 && index < filteredProfiles.length) {
      setCurrentProfileIndex(index);
    }
  };

  // View profiles for a specific school
  const viewSchoolProfiles = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      // Filter profiles by this school
      const schoolProfiles = profiles.filter(profile => 
        profile.acceptedSchools.some(s => s === school.name)
      );
      
      if (schoolProfiles.length > 0) {
        // Navigate to profiles view with filtered profiles
        setActiveView('profiles');
        setFilteredProfiles(schoolProfiles);
        setCurrentProfileIndex(0);
      } else {
        // No profiles for this school
        alert(`No profiles found for ${school.name}. Please check back later.`);
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (type, value, checked) => {
    setFilterCriteria(prev => {
      const updatedCriteria = { ...prev };
      
      if (checked) {
        // Add filter value
        updatedCriteria[type] = [...updatedCriteria[type], value];
      } else {
        // Remove filter value
        updatedCriteria[type] = updatedCriteria[type].filter(item => item !== value);
      }
      
      return updatedCriteria;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterCriteria({
      majors: [],
      gpaRanges: [],
      mcatRanges: []
    });
    setSearchQuery('');
  };

  // Toggle feature views
  const togglePremedCheatsheet = () => {
    setShowPremedCheatsheet(true);
    setShowApplicationCheatsheet(false);
    setShowAccountDetails(false);
    setActiveView('schools'); // Set default tab for schools
  };

  const toggleApplicationCheatsheet = () => {
    setShowPremedCheatsheet(false);
    setShowApplicationCheatsheet(true);
    setShowAccountDetails(false);
  };

  const toggleAccountDetails = () => {
    setShowPremedCheatsheet(false);
    setShowApplicationCheatsheet(false);
    setShowAccountDetails(true);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-content">
          <div className="container">
            <div className="loading-spinner">Loading your dashboard...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main menu view (we're skipping this and going directly to Premed Cheatsheet)
  if (!showPremedCheatsheet && !showApplicationCheatsheet && !showAccountDetails) {
    return (
      <div className="profile-page main-menu">
        <Navbar />
        <div className="profile-content">
          <div className="container">
            <div className="dashboard-header">
              <h1>Welcome to PremedCheatsheet</h1>
              <p className="subtitle">Discover profiles from successful med school applicants</p>
            </div>
            
            <div className="main-menu-grid">
              <div className="menu-card" onClick={togglePremedCheatsheet}>
                <h2>Premed Cheatsheet Member</h2>
                <p>Browse medical school profiles of successful applicants</p>
                <span className="chevron-icon">›</span>
              </div>
              
              <div className="menu-card" onClick={toggleApplicationCheatsheet}>
                <h2>Application Cheatsheet</h2>
                <p>Get insights on application strategies</p>
                <span className="chevron-icon">›</span>
              </div>
              
              <div className="menu-card" onClick={toggleAccountDetails}>
                <h2>Account</h2>
                <p>Manage your profile and subscription</p>
                <span className="chevron-icon">›</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Account details view
  if (showAccountDetails) {
    return (
      <div className="profile-page account-page">
        <Navbar />
        <div className="profile-content">
          <div className="container">
            <div className="page-header">
              <button className="back-button" onClick={() => {
                setShowAccountDetails(false);
                setShowPremedCheatsheet(true);
              }}>
                ← Back
              </button>
              <h1>Account</h1>
            </div>
            
            <div className="account-notice">
              <p>Your account is not verified yet. A verification email has been sent to {user?.email}.</p>
              <button className="resend-button">Resend Verification Email</button>
            </div>
            
            <div className="account-greeting">
              <h2>Hi, {userProfile?.firstName || user?.email?.split('@')[0]}</h2>
              <button className="sign-out-button" onClick={handleLogout}>Sign out</button>
            </div>
            
            <div className="account-details-grid">
              <div className="account-section">
                <h3>Digital Products</h3>
                <p className="section-info">2 Active Digital Products</p>
              </div>
              
              <div className="account-section">
                <h3>Orders</h3>
                <p className="section-info">Last order #00650 is completed</p>
              </div>
              
              <div className="account-section">
                <h3>Payment</h3>
                <p className="section-info">No saved payments</p>
              </div>
              
              <div className="account-section">
                <h3>Address</h3>
                <p className="section-info">No saved addresses</p>
              </div>
              
              <div className="account-section">
                <h3>Profile</h3>
                <p className="section-info">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Application Cheatsheet view
  if (showApplicationCheatsheet) {
    return (
      <div className="profile-page application-cheatsheet">
        <Navbar />
        <div className="profile-content">
          <div className="container">
            <div className="page-header">
              <button className="back-button" onClick={() => {
                setShowApplicationCheatsheet(false);
                setShowPremedCheatsheet(true);
              }}>
                ← Back
              </button>
              <h1>Application Cheatsheet</h1>
            </div>
            
            <div className="account-notice">
              <p>Your account is not verified yet. A verification email has been sent to {user?.email}.</p>
              <button className="resend-button">Resend Verification Email</button>
            </div>
            
            <div className="search-bar">
              <input type="text" placeholder="Search application topics..." value={searchQuery} onChange={handleSearchChange} />
            </div>
            
            <div className="application-content">
              <h2>Application Guide</h2>
              <p>Our comprehensive guide to medical school applications</p>
              
              <div className="application-sections">
                <div className="section-item">
                  <h3>Personal Statement</h3>
                  <p>Tips and examples for crafting your personal statement</p>
                </div>
                <div className="section-item">
                  <h3>Activities & Experiences</h3>
                  <p>How to present your experiences effectively</p>
                </div>
                <div className="section-item">
                  <h3>Secondary Applications</h3>
                  <p>Strategies for secondary essays and prompts</p>
                </div>
                <div className="section-item">
                  <h3>Interviews</h3>
                  <p>Preparation tips for traditional and MMI interviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Premed Cheatsheet view (schools and profiles)
  return (
    <div className="profile-page premed-cheatsheet">
      <Navbar />
      
      <div className="profile-content">
        <div className="container">
          <div className="page-header">
            <h1>Premed Cheatsheet Member</h1>
            <div className="header-actions">
              <button className="account-button" onClick={toggleAccountDetails}>
                Account Settings
              </button>
            </div>
          </div>
          
          <div className="account-notice">
            <p>Your account is not verified yet. A verification email has been sent to {user?.email}.</p>
            <button className="resend-button">Resend Verification Email</button>
          </div>
          
          <ViewToggle activeView={activeView} setActiveView={setActiveView} />
          
          {activeView === 'schools' ? (
            <>
              <SchoolFilters 
                sortOption={sortOption} 
                handleSortChange={handleSortChange}
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
              />
              
              <div className="schools-grid">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map(school => (
                    <div className="school-card" key={school.id}>
                      <div className="school-logo">
                        <img src={school.logoUrl || '/images/default-school-logo.png'} alt={school.name} />
                      </div>
                      <div className="school-info">
                        <h3>{school.name}</h3>
                        <p>{school.profileCount || 0} Accepted Profiles</p>
                        {school.avgGPA !== 'N/A' && (
                          <p>Avg GPA: {school.avgGPA}</p>
                        )}
                        {school.avgMCAT !== 'N/A' && (
                          <p>Avg MCAT: {school.avgMCAT}</p>
                        )}
                      </div>
                      <button 
                        className="view-profiles-button"
                        onClick={() => viewSchoolProfiles(school.id)}
                      >
                        View Profiles
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No medical schools found matching "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery('')}>Clear Search</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="profiles-container">
              <div className="profiles-header">
                <button 
                  className="back-to-schools"
                  onClick={() => setActiveView('schools')}
                >
                  ← Back to Schools
                </button>
                <h2>Applicant Profiles</h2>
              </div>

              <ProfileSearch 
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                filters={showFilters}
                setFilters={setShowFilters}
              />
              
              {showFilters && (
                <div className="filter-panel">
                  <div className="filter-groups">
                    <div className="filter-group">
                      <h4>Major</h4>
                      <div className="filter-options">
                        {['biomedical', 'biology', 'chemistry', 'neuroscience', 'psychology', 'non-trad'].map(major => (
                          <label key={major}>
                            <input 
                              type="checkbox" 
                              checked={filterCriteria.majors.includes(major)}
                              onChange={(e) => handleFilterChange('majors', major, e.target.checked)}
                            /> 
                            {major.charAt(0).toUpperCase() + major.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="filter-group">
                      <h4>GPA Range</h4>
                      <div className="filter-options">
                        {['3.9-4.0', '3.7-3.89', '3.5-3.69', '3.0-3.49', '0-2.99'].map(range => (
                          <label key={range}>
                            <input 
                              type="checkbox" 
                              checked={filterCriteria.gpaRanges.includes(range)}
                              onChange={(e) => handleFilterChange('gpaRanges', range, e.target.checked)}
                            /> 
                            {range}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="filter-group">
                      <h4>MCAT Range</h4>
                      <div className="filter-options">
                        {['520+', '515-519', '510-514', '505-509', '500-504', '0-499'].map(range => (
                          <label key={range}>
                            <input 
                              type="checkbox" 
                              checked={filterCriteria.mcatRanges.includes(range)}
                              onChange={(e) => handleFilterChange('mcatRanges', range, e.target.checked)}
                            /> 
                            {range}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="filter-actions">
                    <button className="clear-filters" onClick={clearFilters}>
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
              
              <div className="profile-flashcards">
                <div className="flashcard-nav">
                  <button 
                    className="nav-button prev"
                    onClick={goToPrevProfile}
                    disabled={currentProfileIndex === 0 || filteredProfiles.length === 0}
                  >
                    Previous Profile
                  </button>
                  
                  <span className="counter">
                    {filteredProfiles.length > 0 
                      ? `Profile ${currentProfileIndex + 1} of ${filteredProfiles.length}` 
                      : 'No profiles found'}
                  </span>
                  
                  <button 
                    className="nav-button next"
                    onClick={goToNextProfile}
                    disabled={currentProfileIndex === filteredProfiles.length - 1 || filteredProfiles.length === 0}
                  >
                    Next Profile
                  </button>
                </div>
                
                <div className="profile-display">
                  {filteredProfiles.length > 0 ? (
                    <ProfileCard 
                      profile={filteredProfiles[currentProfileIndex]}
                      showBookmark={true}
                      size="large"
                      flippable={true}
                    />
                  ) : (
                    <div className="no-profiles">
                      <p>No profiles match your current filters.</p>
                      <button onClick={clearFilters}>Clear All Filters</button>
                    </div>
                  )}
                </div>
                
                <div className="indicator-dots">
                  {filteredProfiles.length > 0 && Array.from({ length: Math.min(filteredProfiles.length, 10) }, (_, i) => (
                    <span 
                      key={i} 
                      className={`dot ${i === currentProfileIndex ? 'active' : ''}`} 
                      onClick={() => goToProfileIndex(i)}
                    />
                  ))}
                  {filteredProfiles.length > 10 && (
                    <span className="more-dots">...</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;