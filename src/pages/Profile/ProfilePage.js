// src/pages/Profile/ProfilePage.js - Updated with Firebase integration
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import ProfileCard from '../../components/sections/ProfileCard/ProfileCard';
import MedicalSchoolGrid from '../../components/MedicalSchoolGrid/MedicalSchoolGrid';
import { onAuthChange } from '../../firebase/authService';
import { loadProfiles, loadSchools, extractSchools } from '../../utils/profilesData'; // Updated import
import './ProfilePage.scss';

const ProfilePage = () => {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false); // Separate loading for data
  const [error, setError] = useState(''); // Add error state
  const [activeView, setActiveView] = useState('schools'); // 'schools' or 'profiles'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('alphabetical');
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState({
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
      } else {
        // Redirect to home page if not authenticated
        navigate('/');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Don't load data if not authenticated
      
      try {
        setDataLoading(true);
        setError('');
        
        console.log('Loading profiles and schools from Firebase...');
        
        // Load both profiles and schools from Firebase
        const [profilesData, schoolsData] = await Promise.all([
          loadProfiles(),
          loadSchools()
        ]);
        
        console.log('📊 Raw data loaded:');
        console.log('  - Profiles:', profilesData.length);
        console.log('  - Schools from Firebase:', schoolsData.length);
        // Check if pennsylvania-state-university is in the schools data
        const pennStateFromFirebase = schoolsData.find(school => school.id === 'pennsylvania-state-university');
        console.log('🎯 Penn State from Firebase:', pennStateFromFirebase);
        if (pennStateFromFirebase) {
          console.log('🖼️ Penn State imageUrl from Firebase:', pennStateFromFirebase.imageUrl);
        }

  
        
        // Set profiles
        setProfiles(profilesData);
        setFilteredProfiles(profilesData);
        
        // Use schools from Firebase if available, otherwise generate from profiles
        let finalSchools;
        if (schoolsData.length > 0) {
          console.log('✅ Using schools from Firebase');
          finalSchools = schoolsData;

          // Double-check Penn State in final schools
          const pennStateInFinal = finalSchools.find(s => s.id === 'pennsylvania-state-university');
          console.log('🎯 Penn State in final schools array:', pennStateInFinal);
          if (pennStateInFinal) {
            console.log('🖼️ Penn State imageUrl in final array:', pennStateInFinal.imageUrl);
          }
        } else {
          console.log('⚠️ Generating schools from profiles');
          finalSchools = extractSchools(profilesData);

          // Check if extractSchools is overwriting your data
          const pennStateFromExtract = finalSchools.find(s => s.id === 'pennsylvania-state-university');
          console.log('🎯 Penn State from extractSchools:', pennStateFromExtract);
          if (pennStateFromExtract) {
            console.log('🖼️ Penn State imageUrl from extractSchools:', pennStateFromExtract.imageUrl);
          }
        }

        console.log('🔍 Setting schools state with:', finalSchools.length, 'schools');
        
        setSchools(finalSchools);
        setFilteredSchools(finalSchools);
        
        // Calculate total pages for pagination
        setTotalPages(Math.ceil(finalSchools.length / 10));
        
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
        setError(`Failed to load data: ${error.message}`);
        
        // Try to fall back to hardcoded data
        try {
          console.log('⚠️ Attempting to load fallback data...');
          const fallbackProfiles = await loadProfiles(); // This should use the fallback
          if (fallbackProfiles.length > 0) {
            setProfiles(fallbackProfiles);
            setFilteredProfiles(fallbackProfiles);
            
            const fallbackSchools = extractSchools(fallbackProfiles);
            setSchools(fallbackSchools);
            setFilteredSchools(fallbackSchools);
            setTotalPages(Math.ceil(fallbackSchools.length / 10));
            
            setError('Using cached data. Some information may not be current.');
          }
        } catch (fallbackError) {
          console.error('Fallback data loading failed:', fallbackError);
          setError('Failed to load data. Please try refreshing the page.');
        }
      } finally {
        setDataLoading(false);
      }
    };
    
    if (user && !loading) {
      fetchData();
    }
  }, [user, loading]);

  // Retry loading data
  const retryLoadData = async () => {
    if (!user) return;
    
    try {
      setDataLoading(true);
      setError('');
      
      const [profilesData, schoolsData] = await Promise.all([
        loadProfiles(),
        loadSchools()
      ]);
      
      setProfiles(profilesData);
      setFilteredProfiles(profilesData);
      
      const finalSchools = schoolsData.length > 0 ? schoolsData : extractSchools(profilesData);
      setSchools(finalSchools);
      setFilteredSchools(finalSchools);
      setTotalPages(Math.ceil(finalSchools.length / 10));
      
    } catch (error) {
      console.error('Retry failed:', error);
      setError(`Retry failed: ${error.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  // Filter and sort schools
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
      filtered.sort((a, b) => (b.count || 0) - (a.count || 0));
    } else if (sortOption === 'profiles-asc') {
      filtered.sort((a, b) => (a.count || 0) - (b.count || 0));
    }
    
    setFilteredSchools(filtered);
    
    // Reset current page on filter/sort change
    setCurrentPage(1);
    
    // Calculate total pages
    setTotalPages(Math.ceil(filtered.length / 10));
  }, [searchQuery, sortOption, schools]);

  // Filter profiles based on filters
  useEffect(() => {
    if (profiles.length === 0) return;
    
    let filtered = [...profiles];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(profile => {
        return (
          (profile.type && profile.type.toLowerCase().includes(query)) ||
          (profile.major && profile.major.toLowerCase().includes(query)) ||
          (profile.stateOfResidency && profile.stateOfResidency.toLowerCase().includes(query)) ||
          (profile.acceptedSchools && profile.acceptedSchools.some(school => 
            school.toLowerCase().includes(query)
          ))
        );
      });
    }
    
    // Apply major filters
    if (selectedFilters.majors.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.major) return false;
        const profileMajor = profile.major.toLowerCase();
        return selectedFilters.majors.some(major => 
          profileMajor.includes(major.toLowerCase())
        );
      });
    }
    
    // Apply GPA filters
    if (selectedFilters.gpaRanges.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.gpa) return false;
        const gpa = parseFloat(profile.gpa);
        
        return selectedFilters.gpaRanges.some(range => {
          if (range === '3.9-4.0') return gpa >= 3.9 && gpa <= 4.0;
          if (range === '3.7-3.89') return gpa >= 3.7 && gpa < 3.9;
          if (range === '3.5-3.69') return gpa >= 3.5 && gpa < 3.7;
          if (range === 'Below3.5') return gpa < 3.5;
          return false;
        });
      });
    }
    
    // Apply MCAT filters
    if (selectedFilters.mcatRanges.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.mcat) return false;
        const mcat = parseInt(profile.mcat);
        
        return selectedFilters.mcatRanges.some(range => {
          if (range === '520+') return mcat >= 520;
          if (range === '515-519') return mcat >= 515 && mcat <= 519;
          if (range === '510-514') return mcat >= 510 && mcat <= 514;
          if (range === 'Below510') return mcat < 510;
          return false;
        });
      });
    }
    
    setFilteredProfiles(filtered);
  }, [searchQuery, selectedFilters, profiles]);

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Handle filter checkbox change
  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => {
      const newFilters = {...prev};
      const index = newFilters[category].indexOf(value);
      
      if (index === -1) {
        // Add the filter
        newFilters[category] = [...newFilters[category], value];
      } else {
        // Remove the filter
        newFilters[category] = newFilters[category].filter(item => item !== value);
      }
      
      return newFilters;
    });
  };

  // Apply filters
  const applyFilters = () => {
    // Filters are applied automatically via useEffect
    setShowFilters(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({
      majors: [],
      gpaRanges: [],
      mcatRanges: []
    });
    setSearchQuery('');
  };

  // Go to page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-content">
          <div className="container">
            <div className="loading-spinner">Checking authentication...</div>
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
          <h1 className="page-title">The Cheatsheet</h1>
          <p className="page-subtitle">Look at patterns. What works? What doesn't? Take inspiration from the profiles of successful applicants.</p>
          
          {/* Show error message if there's an error */}
          {error && (
            <div className="error-banner">
              <p className="error-message">⚠️ {error}</p>
              <button onClick={retryLoadData} className="retry-button" disabled={dataLoading}>
                {dataLoading ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          )}
          
          {/* Show loading indicator for data */}
          {dataLoading && (
            <div className="data-loading">
              <div className="loading-spinner">Loading data from Firebase...</div>
            </div>
          )}
          
          <div className="view-toggle-container">
            <button 
              className={`toggle-button ${activeView === 'schools' ? 'active' : ''}`}
              onClick={() => setActiveView('schools')}
            >
              Medical Schools ({filteredSchools.length})
            </button>
            <button 
              className={`toggle-button ${activeView === 'profiles' ? 'active' : ''}`}
              onClick={() => setActiveView('profiles')}
            >
              All Profiles ({filteredProfiles.length})
            </button>
          </div>
          
          <div className="search-sort-container">
            <div className="search-box">
              <input
                type="text"
                placeholder={activeView === 'schools' ? "Search medical schools..." : "Search profiles..."}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            {activeView === 'schools' && (
              <div className="sort-options">
                <label>Sort By:</label>
                <select value={sortOption} onChange={handleSortChange}>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                  <option value="alphabetical-reverse">Alphabetical (Z-A)</option>
                  <option value="profiles-desc">Most Profiles</option>
                  <option value="profiles-asc">Fewest Profiles</option>
                </select>
              </div>
            )}
            
            {activeView === 'profiles' && (
              <button 
                className="filter-button"
                onClick={toggleFilters}
              >
                Filter
              </button>
            )}
          </div>
          
          {activeView === 'profiles' && showFilters && (
            <div className="filter-panel">
              <div className="filter-categories">
                <div className="filter-category">
                  <h3>Major</h3>
                  <div className="filter-options">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.majors.includes('Biology')}
                        onChange={() => handleFilterChange('majors', 'Biology')}
                      />
                      Biology
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.majors.includes('Chemistry')}
                        onChange={() => handleFilterChange('majors', 'Chemistry')}
                      />
                      Chemistry
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.majors.includes('Biochemistry')}
                        onChange={() => handleFilterChange('majors', 'Biochemistry')}
                      />
                      Biochemistry
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.majors.includes('Neuroscience')}
                        onChange={() => handleFilterChange('majors', 'Neuroscience')}
                      />
                      Neuroscience
                    </label>
                  </div>
                </div>
                
                <div className="filter-category">
                  <h3>GPA Range</h3>
                  <div className="filter-options">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.gpaRanges.includes('3.9-4.0')}
                        onChange={() => handleFilterChange('gpaRanges', '3.9-4.0')}
                      />
                      3.9 - 4.0
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.gpaRanges.includes('3.7-3.89')}
                        onChange={() => handleFilterChange('gpaRanges', '3.7-3.89')}
                      />
                      3.7 - 3.89
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.gpaRanges.includes('3.5-3.69')}
                        onChange={() => handleFilterChange('gpaRanges', '3.5-3.69')}
                      />
                      3.5 - 3.69
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.gpaRanges.includes('Below3.5')}
                        onChange={() => handleFilterChange('gpaRanges', 'Below3.5')}
                      />
                      Below 3.5
                    </label>
                  </div>
                </div>
                
                <div className="filter-category">
                  <h3>MCAT Range</h3>
                  <div className="filter-options">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.mcatRanges.includes('520+')}
                        onChange={() => handleFilterChange('mcatRanges', '520+')}
                      />
                      520+
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.mcatRanges.includes('515-519')}
                        onChange={() => handleFilterChange('mcatRanges', '515-519')}
                      />
                      515-519
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.mcatRanges.includes('510-514')}
                        onChange={() => handleFilterChange('mcatRanges', '510-514')}
                      />
                      510-514
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={selectedFilters.mcatRanges.includes('Below510')}
                        onChange={() => handleFilterChange('mcatRanges', 'Below510')}
                      />
                      Below 510
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="filter-actions">
                <button className="apply-button" onClick={applyFilters}>Apply Filters</button>
                <button className="clear-button" onClick={clearAllFilters}>Clear All</button>
              </div>
            </div>
          )}
          
          {activeView === 'schools' ? (
            // MedicalSchoolGrid now gets Firebase data
            <MedicalSchoolGrid schools={filteredSchools} searchQuery={searchQuery} />
          ) : (
            <>
              <div className="profiles-grid">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles
                    .slice((currentPage - 1) * 10, currentPage * 10)
                    .map((profile, index) => (
                    <div className="profile-item" key={profile.id || index}>
                      <ProfileCard profile={profile} />
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No profiles match your search criteria.</p>
                    <button onClick={clearAllFilters}>Clear All Filters</button>
                  </div>
                )}
              </div>
              
              {filteredProfiles.length > 0 && (
                <div className="pagination">
                  <button 
                    className="page-button prev"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  <span className="page-info">
                    Page {currentPage} of {Math.max(1, Math.ceil(filteredProfiles.length / 10))}
                  </span>
                  
                  <button 
                    className="page-button next"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(filteredProfiles.length / 10)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;