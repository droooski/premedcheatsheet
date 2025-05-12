// src/components/sections/ProfileCard/ProfileCard.js
import React from 'react';
import './ProfileCard.scss';

const ProfileCard = ({ 
  profile,
  showBookmark = true,
  size = "large",
  onClick = null
}) => {
  if (!profile) {
    return null;
  }

  // Extract data from the profile
  const {
    id,
    type,
    gender,
    race,
    stateOfResidency,
    matriculationYear,
    gpa,
    mcat,
    mcatBreakdown,
    acceptedSchools = [],
    medicalVolunteering,
    nonMedicalVolunteering,
    research,
    medicalEmployment,
    shadowing,
    leadership,
    hobbies,
    major,
    reflections
  } = profile;

  // Format the title based on the type or major
  const title = type === "non-trad" 
    ? "Non-Traditional Applicant with Research Focus"
    : type === "biomedical" || (major && major.toLowerCase().includes("biomed"))
      ? "Biomedical Engineering Student"
      : `${major ? major.split(',')[0].trim() : type} Student`;

  // Background items
  const backgroundItems = [];
  
  if (major) {
    backgroundItems.push(`Major: ${major}`);
  }
  
  if (research) {
    backgroundItems.push(`Research: ${research}`);
  }
  
  if (leadership) {
    backgroundItems.push(`Leadership: ${leadership}`);
  }
  
  if (medicalEmployment) {
    backgroundItems.push(`Medical Employment: ${medicalEmployment}`);
  }
  
  if (medicalVolunteering) {
    backgroundItems.push(`Medical Volunteering: ${medicalVolunteering}`);
  }
  
  if (nonMedicalVolunteering) {
    backgroundItems.push(`Non-Medical Volunteering: ${nonMedicalVolunteering}`);
  }
  
  if (shadowing) {
    backgroundItems.push(`Shadowing: ${shadowing}`);
  }
  
  if (hobbies) {
    backgroundItems.push(`Hobbies: ${hobbies}`);
  }
  
  return (
    <div className={`profile-card ${size}`} onClick={onClick}>
      <div className="profile-header">
        <h3>{title}</h3>
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
          <div className="detail-item">
            <span className="label">Gender</span>
            <span className="value">{gender || 'Not specified'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Ethnicity</span>
            <span className="value">{race || 'Not specified'}</span>
          </div>
          <div className="detail-item">
            <span className="label">State</span>
            <span className="value">{stateOfResidency || 'Not specified'}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-item">
            <span className="label">Year</span>
            <span className="value">{matriculationYear || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">GPA</span>
            <span className="value">{gpa || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">MCAT</span>
            <span className="value">{mcat || 'N/A'}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-item">
            <span className="label">MCAT Breakdown</span>
            <span className="value">{mcatBreakdown || 'Not specified'}</span>
          </div>
        </div>

        <div className="highlight-section accepted">
          <div className="highlight-header">
            <div className="dot accepted-dot"></div>
            <span>Accepted Schools</span>
          </div>
          {acceptedSchools && acceptedSchools.length > 0 ? (
            acceptedSchools.map((school, index) => (
              <p key={index}>{school}</p>
            ))
          ) : (
            <p>No schools specified</p>
          )}
        </div>

        <div className="highlight-section background">
          <div className="highlight-header">
            <div className="dot background-dot"></div>
            <span>Applicant Background</span>
          </div>
          {backgroundItems.length > 0 ? (
            backgroundItems.map((item, index) => (
              <p key={index}>{item}</p>
            ))
          ) : (
            <p>No background information available</p>
          )}
        </div>

        {reflections && (
          <div className="highlight-section reflections">
            <div className="highlight-header">
              <div className="dot reflections-dot"></div>
              <span>Reflections</span>
            </div>
            <p>{reflections}</p>
          </div>
        )}

        <div className="profile-footer">
          <a href="/profile">View Full Profile</a>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;