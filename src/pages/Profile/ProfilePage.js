// src/pages/Profile/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import ProfileCard from '../../components/sections/ProfileCard/ProfileCard';
import { onAuthChange, getUserProfile } from '../../firebase/authService';
import './ProfilePage.scss';

const ProfilePage = () => {
  // State management
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schools'); // 'schools' or 'profiles'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('alphabetical');
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  
  const navigate = useNavigate();

  // Check authentication and load user data
  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile
        const { profile, error } = await getUserProfile(currentUser.uid);
        if (profile) {
          setProfile(profile);
        } else if (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // Redirect to home page if not authenticated
        navigate('/');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load school data
  useEffect(() => {
    const fetchSchools = async () => {
      // Simulated school data - in a real app, this would come from Firestore
      const schoolData = [
        { id: '1', name: 'Harvard Medical School', logoUrl: '/images/harvard.png', profiles: 15 },
        { id: '2', name: 'Johns Hopkins University School of Medicine', logoUrl: '/images/johns-hopkins.png', profiles: 12 },
        { id: '3', name: 'Stanford University School of Medicine', logoUrl: '/images/stanford.png', profiles: 10 },
        { id: '4', name: 'UCSF School of Medicine', logoUrl: '/images/ucsf.png', profiles: 8 },
        { id: '5', name: 'NYU Grossman School of Medicine', logoUrl: '/images/nyu.png', profiles: 7 },
        { id: '6', name: 'Mayo Clinic Alix School of Medicine', logoUrl: '/images/mayo.png', profiles: 6 },
        { id: '7', name: 'Columbia University Vagelos College', logoUrl: '/images/columbia.png', profiles: 9 },
        { id: '8', name: 'University of Pennsylvania Perelman', logoUrl: '/images/upenn.png', profiles: 11 },
        { id: '9', name: 'Washington University School of Medicine', logoUrl: '/images/wustl.png', profiles: 5 },
        { id: '10', name: 'Yale School of Medicine', logoUrl: '/images/yale.png', profiles: 8 },
      ];
      
      setSchools(schoolData);
      setFilteredSchools(schoolData);
    };
    
    fetchSchools();
  }, []);

  // Filter and sort schools based on search query and sort option
  useEffect(() => {
    let filtered = [...schools];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(school => 
        school.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortOption === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'profiles-desc') {
      filtered.sort((a, b) => b.profiles - a.profiles);
    } else if (sortOption === 'profiles-asc') {
      filtered.sort((a, b) => a.profiles - b.profiles);
    }
    
    setFilteredSchools(filtered);
  }, [searchQuery, sortOption, schools]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // View profiles for a specific school
  const viewSchoolProfiles = (schoolId) => {
    navigate(`/school/${schoolId}`);
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
            <h1>Welcome to PremedCheatsheet</h1>
            <p className="subtitle">Discover profiles from successful med school applicants</p>
          </div>
          
          <div className="user-info-card">
            <div className="user-info">
              <h3>Account Information</h3>
              <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
            </div>
            
            <div className="subscription-info">
              <h3>Subscription</h3>
              {profile?.subscriptions?.length > 0 ? (
                <>
                  <p><strong>Plan:</strong> {profile.subscriptions[0].plan === 'monthly' ? 'Monthly' : 'Annual'}</p>
                  <p><strong>Status:</strong> <span className="active-status">Active</span></p>
                  <p><strong>Renewal Date:</strong> {new Date(profile.subscriptions[0].endDate).toLocaleDateString()}</p>
                </>
              ) : (
                <p>No active subscription found.</p>
              )}
            </div>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`toggle-button ${activeTab === 'schools' ? 'active' : ''}`}
              onClick={() => setActiveTab('schools')}
            >
              Medical Schools
            </button>
            <button 
              className={`toggle-button ${activeTab === 'profiles' ? 'active' : ''}`}
              onClick={() => setActiveTab('profiles')}
            >
              All Profiles
            </button>
          </div>
          
          <div className="filter-sort-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder={activeTab === 'schools' ? "Search medical schools..." : "Search profiles..."}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="sort-options">
              <label>Sort By:</label>
              <select value={sortOption} onChange={handleSortChange}>
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="profiles-desc">Most Profiles</option>
                <option value="profiles-asc">Fewest Profiles</option>
              </select>
            </div>
          </div>
          
          {activeTab === 'schools' ? (
            <div className="schools-grid">
              {filteredSchools.length > 0 ? (
                filteredSchools.map(school => (
                  <div className="school-card" key={school.id}>
                    <div className="school-logo">
                      <img src={school.logoUrl || '/images/default-school-logo.png'} alt={school.name} />
                    </div>
                    <div className="school-info">
                      <h3>{school.name}</h3>
                      <p>{school.profiles} Accepted Profiles</p>
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
          ) : (
            <div className="profiles-container">
              <div className="profile-navigation">
                <button className="nav-button">&lt; Previous</button>
                <span className="profile-counter">Profile 1 of 82</span>
                <button className="nav-button">Next &gt;</button>
              </div>
              
              <div className="profile-display">
                <ProfileCard 
                  type="biomedical"
                  showBookmark={true}
                  size="large"
                />
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