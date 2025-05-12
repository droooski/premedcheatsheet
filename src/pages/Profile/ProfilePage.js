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
import { loadProfiles, filterProfiles, extractSchools } from '../../utils/profilesData';
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

  // Load data from JSON file
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load profiles from JSON
        const profilesData = await loadProfiles();
        console.log(`Loaded ${profilesData.length} profiles successfully`);
        
        // Extract schools from profiles
        const schoolsData = extractSchools(profilesData);
        console.log(`Extracted ${schoolsData.length} schools from profiles`);
        
        setProfiles(profilesData);
        setFilteredProfiles(profilesData);
        setSchools(schoolsData);
        setFilteredSchools(schoolsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
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
    
    // Filter schools by search query
    let filtered = [...schools];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(school => 
        school.name.toLowerCase().includes(query)
      );
    }
    
    // Sort schools
    if (sortOption === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'alphabetical-reverse') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === 'profiles-desc') {
      filtered.sort((a, b) => b.count - a.count);
    } else if (sortOption === 'profiles-asc') {
      filtered.sort((a, b) => a.count - b.count);
    }
    
    setFilteredSchools(filtered);
  }, [searchQuery, sortOption, schools]);

  // Update filtered profiles when search changes
  useEffect(() => {
    if (profiles.length === 0) return;
    
    const filtered = filterProfiles(profiles, searchQuery);
    setFilteredProfiles(filtered);
    // Reset current profile index when filters change
    setCurrentProfileIndex(0);
  }, [searchQuery, profiles]);

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
        profile.acceptedSchools && profile.acceptedSchools.some(s => 
          s.toLowerCase().includes(school.name.toLowerCase())
        )
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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
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

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-content">
        <div className="container">
          <div className="dashboard-header">
            <h1>Student Profile Database</h1>
            <p className="subtitle">Discover profiles from successful med school applicants</p>
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
                        <img src={`/images/default-school-logo.png`} alt={school.name} />
                      </div>
                      <div className="school-info">
                        <h3>{school.name}</h3>
                        <p>{school.count || 0} Accepted Profiles</p>
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
              
              <div className="profile-navigation">
                <ProfileNavigation 
                  currentIndex={currentProfileIndex}
                  totalProfiles={filteredProfiles.length}
                  goToPrev={goToPrevProfile}
                  goToNext={goToNextProfile}
                  goToIndex={goToProfileIndex}
                />
              </div>
              
              <div className="profile-display">
                {filteredProfiles.length > 0 ? (
                  <ProfileCard 
                    profile={filteredProfiles[currentProfileIndex]}
                    showBookmark={true}
                    size="large"
                  />
                ) : (
                  <div className="no-profiles">
                    <p>No profiles match your current filters.</p>
                    <button onClick={clearFilters}>Clear All Filters</button>
                  </div>
                )}
              </div>
              
              {/* Add profile navigation dots at the bottom */}
              <div className="profile-pagination-dots">
                {filteredProfiles.length > 0 && 
                  filteredProfiles.map((_, index) => (
                    <span 
                      key={index}
                      className={`profile-dot ${index === currentProfileIndex ? 'active' : ''}`}
                      onClick={() => goToProfileIndex(index)}
                    />
                  ))
                }
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