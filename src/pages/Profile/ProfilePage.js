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
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { onAuthChange } from '../../firebase/authService';
import './ProfilePage.scss';

const ProfilePage = () => {
  // State management
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('schools');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('alphabetical');
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();
  const db = getFirestore();

  // Check authentication and load user data
  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // Redirect to home page if not authenticated
        navigate('/');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, db]);

  // Load school data
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        // Get schools from Firestore
        const schoolsSnapshot = await getDocs(collection(db, 'schools'));
        const schoolsData = schoolsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setSchools(schoolsData);
        setFilteredSchools(schoolsData);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };
    
    fetchSchools();
  }, [db]);

  // Load profile data
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Get profiles from Firestore
        const profilesSnapshot = await getDocs(collection(db, 'profiles'));
        const profilesData = profilesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
    
    fetchProfiles();
  }, [db]);

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
    } else if (sortOption === 'alphabetical-reverse') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === 'profiles-desc') {
      filtered.sort((a, b) => (b.profileCount || 0) - (a.profileCount || 0));
    } else if (sortOption === 'profiles-asc') {
      filtered.sort((a, b) => (a.profileCount || 0) - (b.profileCount || 0));
    } else if (sortOption === 'acceptance-desc') {
      filtered.sort((a, b) => {
        const aRate = parseFloat(a.acceptanceRate?.replace('%', '') || 0);
        const bRate = parseFloat(b.acceptanceRate?.replace('%', '') || 0);
        return bRate - aRate;
      });
    } else if (sortOption === 'acceptance-asc') {
      filtered.sort((a, b) => {
        const aRate = parseFloat(a.acceptanceRate?.replace('%', '') || 0);
        const bRate = parseFloat(b.acceptanceRate?.replace('%', '') || 0);
        return aRate - bRate;
      });
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

  // Navigate to next profile
  const goToNextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
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
    if (index >= 0 && index < profiles.length) {
      setCurrentProfileIndex(index);
    }
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
              <ProfileSearch 
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                filters={showFilters}
                setFilters={setShowFilters}
              />
              
              <ProfileNavigation 
                currentIndex={currentProfileIndex}
                totalProfiles={profiles.length}
                goToPrev={goToPrevProfile}
                goToNext={goToNextProfile}
                goToIndex={goToProfileIndex}
              />
              
              <div className="profile-display">
                {profiles.length > 0 ? (
                  <ProfileCard 
                    type={profiles[currentProfileIndex]?.type || "biomedical"}
                    profile={profiles[currentProfileIndex]}
                    showBookmark={true}
                    size="large"
                  />
                ) : (
                  <div className="no-profiles">
                    <p>No profiles available. Please check back later.</p>
                  </div>
                )}
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