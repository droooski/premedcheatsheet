// src/pages/SchoolProfile/SchoolProfile.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import ProfileCard from '../../components/sections/ProfileCard/ProfileCard';
import { onAuthChange } from '../../firebase/authService';
import { 
  loadProfiles, 
  extractSchools, 
  getProfilesForSchool
  // Removed the unused import: normalizeSchoolName
} from '../../utils/profilesData';
import './SchoolProfilePage.scss';

const SchoolProfilePage = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();

  // State management
  const [school, setSchool] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
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
        setLoading(true);
        
        // Load all profiles
        const allProfiles = await loadProfiles();
        
        // Extract all schools with their stats
        const allSchools = extractSchools(allProfiles);
        console.log("allSchools", allSchools.map(s => s.id));
        console.log("Looking for:", schoolId);
        
        // Find the school by ID
        const foundSchool = allSchools.find(s => s.id === schoolId);
        
        if (foundSchool) {
          setSchool(foundSchool);
          
          // Get profiles for this school
          const schoolProfiles = getProfilesForSchool(allProfiles, schoolId, allSchools);
          setProfiles(schoolProfiles);
        } else {
          // If school not found, use a default (for development/testing)
          console.warn(`School with ID ${schoolId} not found, using default`);
          
          const defaultSchool = {
            id: schoolId,
            name: 'Harvard Medical School',
            logoUrl: '/images/default-school-logo.png',
            description: 'Harvard Medical School (HMS) is the graduate medical school of Harvard University and is located in the Longwood Medical Area of Boston, Massachusetts.',
            acceptanceRate: '3.7%',
            avgGPA: '3.9',
            avgMCAT: '520',
            website: 'https://hms.harvard.edu/',
            count: 3
          };
          
          setSchool(defaultSchool);
          
          // Just use first 3 profiles as a fallback
          setProfiles(allProfiles.slice(0, 3));
        }
        
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
              <div className="school-details">
                <h1>{school.name}</h1>
                <p className="school-description">{school.description || `View comprehensive information about ${school.name} and student profiles who were accepted.`}</p>
              </div>
            </div>
            
            <div className="school-stats">
              <div className="stat-item">
                <h3>Acceptance Rate</h3>
                <p>{school.acceptanceRate || 'N/A'}</p>
              </div>
              <div className="stat-item">
                <h3>Average GPA</h3>
                <p>{school.avgGPA || 'N/A'}</p>
              </div>
              <div className="stat-item">
                <h3>Average MCAT</h3>
                <p>{school.avgMCAT || 'N/A'}</p>
              </div>
              <div className="stat-item">
                <h3>Profiles Available</h3>
                <p>{profiles.length}</p>
              </div>
            </div>
            
            <div className="school-links">
              <a 
                href={school.website || `https://www.google.com/search?q=${encodeURIComponent(school.name)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="website-link"
              >
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
          
          {profiles.length > 0 ? (
            viewMode === 'card' ? (
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
                  {profiles[currentProfileIndex] && (
                    <ProfileCard profile={profiles[currentProfileIndex]} />
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
              </div>
            )
          ) : (
            <div className="no-profiles">
              <h3>No profiles found</h3>
              <p>We don't have any student profiles for this school yet. Check back later for updates.</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SchoolProfilePage;