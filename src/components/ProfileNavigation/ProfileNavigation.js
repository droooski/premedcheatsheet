// src/components/ProfileNavigation/ProfileNavigation.js
import React from 'react';
import './ProfileNavigation.scss';

const ProfileNavigation = ({ currentIndex, totalProfiles, goToPrev, goToNext, goToIndex }) => {
  return (
    <div className="profile-navigation">
      <div className="nav-controls">
        <button 
          className="nav-button prev-button" 
          onClick={goToPrev}
          disabled={currentIndex === 0}
        >
          &lt; Previous
        </button>
        
        <span className="profile-counter">
          Profile {currentIndex + 1} of {totalProfiles}
        </span>
        
        <button 
          className="nav-button next-button" 
          onClick={goToNext}
          disabled={currentIndex === totalProfiles - 1}
        >
          Next &gt;
        </button>
      </div>
      
      <div className="profile-dots">
        {Array.from({ length: totalProfiles }).map((_, index) => (
          <span 
            key={index} 
            className={`profile-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProfileNavigation;