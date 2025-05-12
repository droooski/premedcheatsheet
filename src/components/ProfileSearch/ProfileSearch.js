// src/components/ProfileSearch/ProfileSearch.js
import React from 'react';
import './ProfileSearch.scss';

const ProfileSearch = ({ searchQuery, handleSearchChange, filters, setFilters }) => {
  return (
    <div className="profile-search">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search profiles (e.g., major, school, GPA)..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="filter-toggle" onClick={() => setFilters(prev => !prev)}>
        <span>Filters</span>
        <span className="toggle-icon">{filters ? '▲' : '▼'}</span>
      </div>
      
      {filters && (
        <div className="filter-panel">
          <div className="filter-group">
            <h4>Major</h4>
            <div className="filter-options">
              <label><input type="checkbox" /> Biology</label>
              <label><input type="checkbox" /> Chemistry</label>
              <label><input type="checkbox" /> Biochemistry</label>
              <label><input type="checkbox" /> Neuroscience</label>
              <label><input type="checkbox" /> Psychology</label>
              <label><input type="checkbox" /> Non-Science</label>
            </div>
          </div>
          
          <div className="filter-group">
            <h4>GPA Range</h4>
            <div className="filter-options">
              <label><input type="checkbox" /> 3.9 - 4.0</label>
              <label><input type="checkbox" /> 3.7 - 3.89</label>
              <label><input type="checkbox" /> 3.5 - 3.69</label>
              <label><input type="checkbox" /> 3.0 - 3.49</label>
              <label><input type="checkbox" /> Below 3.0</label>
            </div>
          </div>
          
          <div className="filter-group">
            <h4>MCAT Range</h4>
            <div className="filter-options">
              <label><input type="checkbox" /> 520+</label>
              <label><input type="checkbox" /> 515 - 519</label>
              <label><input type="checkbox" /> 510 - 514</label>
              <label><input type="checkbox" /> 505 - 509</label>
              <label><input type="checkbox" /> Below 505</label>
            </div>
          </div>
          
          <button className="apply-filters">Apply Filters</button>
        </div>
      )}
    </div>
  );
};

export default ProfileSearch;