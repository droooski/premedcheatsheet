// src/components/SchoolFilters/SchoolFilters.js
import React from 'react';
import './SchoolFilters.scss';

const SchoolFilters = ({ sortOption, handleSortChange, searchQuery, handleSearchChange }) => {
  return (
    <div className="filter-sort-bar">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search medical schools..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="sort-options">
        <label>Sort By:</label>
        <select value={sortOption} onChange={handleSortChange}>
          <option value="alphabetical">Alphabetical (A-Z)</option>
          <option value="alphabetical-reverse">Alphabetical (Z-A)</option>
          <option value="profiles-desc">Most Profiles</option>
          <option value="profiles-asc">Fewest Profiles</option>
          <option value="acceptance-desc">Highest Acceptance Rate</option>
          <option value="acceptance-asc">Lowest Acceptance Rate</option>
        </select>
      </div>
    </div>
  );
};

export default SchoolFilters;