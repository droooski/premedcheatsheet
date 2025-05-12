// src/components/sections/ProfileCard/ProfileCard.js
import React from 'react';
import './ProfileCard.scss';

const ProfileCard = ({ 
  profile,
  type = "biomedical", 
  showBookmark = true,
  size = "large"
}) => {
  // If a profile object is provided, use its data
  // Otherwise, use default data based on the type
  
  // Default data based on type
  const defaultData = {
    title: type === "biomedical" 
      ? "Biomedical Engineering Student" 
      : "Non-Trad Applicant with Research Focus",
    gender: "Male",
    ethnicity: "Taiwanese",
    state: "New Jersey",
    year: "2024",
    gpa: type === "biomedical" ? "3.94" : "3.84",
    sgpa: "3.91",
    mcat: "513",
    mcatBreakdown: "127, 129, 131, 129",
    acceptedSchools: type === "biomedical" 
      ? ["Einstein School of Medicine (Accepted)", "Rutgers New Jersey Medical School"] 
      : ["Stanford Medical School", "UCSF Medical School"],
    backgroundItems: type === "biomedical" 
      ? [
          "Major: Biomedical Engineering",
          "Research: 1000+ hours (including 100+ per year)"
        ] 
      : [
          "Clinical Experience: Hospital volunteering (500+ hours)",
          "Research: 2000+ hours with multiple publications"
        ]
  };
  
  // Combine provided profile data with defaults
  const data = profile ? {
    title: profile.type === "biomedical" 
      ? "Biomedical Engineering Student" 
      : profile.type === "non-trad"
        ? "Non-Traditional Applicant"
        : `${profile.type.charAt(0).toUpperCase() + profile.type.slice(1)} Major`,
    gender: profile.gender,
    ethnicity: profile.ethnicity,
    state: profile.state,
    year: profile.year,
    gpa: profile.gpa,
    sgpa: profile.sgpa,
    mcat: profile.mcat,
    mcatBreakdown: profile.mcatBreakdown,
    acceptedSchools: profile.acceptedSchools,
    backgroundItems: profile.backgroundItems
  } : defaultData;
  
  return (
    <div className={`profile-card ${size}`}>
      <div className="profile-header">
        <h3>{data.title}</h3>
        {showBookmark && (
          <div className="bookmark-icon">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 14L1 19V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H13C13.5304 1 14.0391 1.21071 14.4142 1.58579C14.7893 1.96086 15 2.46957 15 3V19Z" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className="profile-details">
        <div className="detail-row">
          <div className="detail-group">
            <span className="label">Gender</span>
            <span className="value">{data.gender}</span>
          </div>
          <div className="detail-group">
            <span className="label">Ethnicity</span>
            <span className="value">{data.ethnicity}</span>
          </div>
          <div className="detail-group">
            <span className="label">State</span>
            <span className="value">{data.state}</span>
          </div>
          <div className="detail-group">
            <span className="label">Application Year</span>
            <span className="value">{data.year}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-group">
            <span className="label">GPA</span>
            <span className="value">{data.gpa}</span>
          </div>
          <div className="detail-group">
            <span className="label">Science GPA</span>
            <span className="value">{data.sgpa}</span>
          </div>
          <div className="detail-group">
            <span className="label">MCAT</span>
            <span className="value">{data.mcat}</span>
          </div>
          <div className="detail-group">
            <span className="label">MCAT Breakdown</span>
            <span className="value">{data.mcatBreakdown}</span>
          </div>
        </div>

        <div className="highlight-section accepted">
          <div className="highlight-header">
            <div className="dot accepted-dot"></div>
            <span>Accepted Schools</span>
          </div>
          {data.acceptedSchools.map((school, index) => (
            <p key={index}>{school}</p>
          ))}
        </div>

        <div className="highlight-section background">
          <div className="highlight-header">
            <div className="dot background-dot"></div>
            <span>Applicant Background</span>
          </div>
          {data.backgroundItems.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>

        <div className="profile-footer">
          <a href="/profile">View Full Profile</a>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;