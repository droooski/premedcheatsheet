// src/pages/SchoolProfile/SchoolProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import ProfileCard from '../../components/sections/ProfileCard/ProfileCard';
import { onAuthChange } from '../../firebase/authService';
import { loadProfiles } from '../../utils/profilesData';
import './SchoolProfilePage.scss';

const SchoolProfilePage = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();

  // State management
  const [school, setSchool] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to home page if not authenticated
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load school and profile data
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        // Load all profiles
        const allProfiles = await loadProfiles();
        
        // Find the school by ID
        const schools = await fetch('/data/schools.json')
          .then(res => res.json())
          .catch(() => []);
        
        const foundSchool = schools.find(s => s.id === schoolId) || {
          id: schoolId,
          name: 'Harvard Medical School',
          logoUrl: '/images/harvard.png',
          description: 'Harvard Medical School (HMS) is the graduate medical school of Harvard University and is located in the Longwood Medical Area of Boston, Massachusetts.',
          acceptanceRate: '3.7%',
          avgGPA: '3.9',
          avgMCAT: '520',
          website: 'https://hms.harvard.edu/'
        };
        
        // Filter profiles that got accepted to this school
        const schoolProfiles = allProfiles.filter(profile => 
          profile.acceptedSchools && 
          profile.acceptedSchools.some(school => 
            school.toLowerCase().includes(foundSchool.name.toLowerCase())
          )
        );
        
        // Update school with correct profile count
        const profileCount = schoolProfiles.length > 0 ? schoolProfiles.length : 3;
        setSchool({
          ...foundSchool,
          profileCount: profileCount
        });
        
        setProfiles(schoolProfiles.length > 0 ? schoolProfiles : allProfiles.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    fetchSchoolData();
  }, [schoolId]);

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

  // Toggle between card and list view
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  if (loading) {
    return (
      <div className="school-profile-page">
        <Navbar />
        <div className="school-profile-content">
          <div className="container">
            <div className="loading-spinner">Loading school profiles...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="school-profile-page">
      <Navbar />
      
      <div className="school-profile-content">
        <div className="container">
          <div className="back-link" onClick={() => navigate('/profile')}>
            &larr; Back to Dashboard
          </div>
          
          <div className="school-info-card">
            <div className="school-header">
              <div className="school-logo">
                <img src={school.logoUrl || '/images/default-school-logo.png'} alt={school.name} />
              </div>
              <div className="school-details">
                <h1>{school.name}</h1>
                <p className="school-description">{school.description}</p>
              </div>
            </div>
            
            <div className="school-stats">
              <div className="stat-item">
                <h3>Acceptance Rate</h3>
                <p>{school.acceptanceRate}</p>
              </div>
              <div className="stat-item">
                <h3>Average GPA</h3>
                <p>{school.avgGPA}</p>
              </div>
              <div className="stat-item">
                <h3>Average MCAT</h3>
                <p>{school.avgMCAT}</p>
              </div>
              <div className="stat-item">
                <h3>Profiles Available</h3>
                <p>{profiles.length}</p>
              </div>
            </div>
            
            <div className="school-links">
              <a href={school.website} target="_blank" rel="noopener noreferrer" className="website-link">
                Visit Official Website
              </a>
            </div>
          </div>
          
          <div className="profile-controls">
            <h2>Accepted Student Profiles</h2>
            
            <div className="view-options">
              <button 
                className={`view-toggle-button ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => toggleViewMode('card')}
              >
                Card View
              </button>
              <button 
                className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => toggleViewMode('list')}
              >
                List View
              </button>
            </div>
          </div>
          
          {viewMode === 'card' ? (
            <div className="profile-card-view">
              <div className="profile-navigation">
                <button 
                  className="nav-button"
                  onClick={goToPrevProfile}
                  disabled={currentProfileIndex === 0}
                >
                  &lt; Previous
                </button>
                <span className="profile-counter">
                  Profile {currentProfileIndex + 1} of {profiles.length}
                </span>
                <button 
                  className="nav-button"
                  onClick={goToNextProfile}
                  disabled={currentProfileIndex === profiles.length - 1}
                >
                  Next &gt;
                </button>
              </div>
              
              <div className="profile-display">
                {profiles.length > 0 && profiles[currentProfileIndex] ? (
                  <ProfileCard profile={profiles[currentProfileIndex]} />
                ) : (
                  <div className="no-profile">No profile data available</div>
                )}
              </div>
            </div>
          ) : (
            <div className="profile-list-view">
              {profiles.map((profile, index) => (
                <div 
                  key={profile.id || index} 
                  className={`profile-list-item ${index === currentProfileIndex ? 'active' : ''}`}
                  onClick={() => setCurrentProfileIndex(index)}
                >
                  <ProfileCard profile={profile} />
                </div>
              ))}
              
              {profiles.length === 0 && (
                <div className="no-profiles">No profiles found for this school</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SchoolProfilePage;