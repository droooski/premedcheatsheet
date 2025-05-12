// src/components/ViewToggle/ViewToggle.js
import React from 'react';
import './ViewToggle.scss';

const ViewToggle = ({ activeView, setActiveView }) => {
  return (
    <div className="view-toggle">
      <button 
        className={`toggle-button ${activeView === 'schools' ? 'active' : ''}`}
        onClick={() => setActiveView('schools')}
      >
        Medical Schools
      </button>
      <button 
        className={`toggle-button ${activeView === 'profiles' ? 'active' : ''}`}
        onClick={() => setActiveView('profiles')}
      >
        All Profiles
      </button>
    </div>
  );
};

export default ViewToggle;