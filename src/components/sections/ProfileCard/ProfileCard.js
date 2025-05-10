import React from 'react';
import './ProfileCard.scss';

const ProfileCard = ({ 
  type = "biomedical", 
  showBookmark = true,
  size = "large" // "large" or "small"
}) => {
  const isBiomedical = type === "biomedical";
  
  // Data based on type
  const data = {
    title: isBiomedical 
      ? "Biomedical Engineering Student" 
      : "Non-Trad Applicant with Research Focus",
    major: isBiomedical ? "Biomedical" : "Neuroscience",
    gpa: isBiomedical ? "3.94" : "3.84",
    backgroundItems: isBiomedical 
      ? [
          "Major: Biomedical Engineering",
          "Research: 1000+ hours (including 100+ per year)"
        ] 
      : [
          "Clinical Experience: Hospital volunteering (500+ hours)",
          "Research: 2000+ hours with multiple publications"
        ]
  };
  
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
          <div className="detail-item">
            <span className="label">Major</span>
            <span className="value">{data.major}</span>
          </div>
          <div className="detail-item">
            <span className="label">State</span>
            <span className="value">New Jersey</span>
          </div>
          <div className="detail-item">
            <span className="label">Year</span>
            <span className="value">2024</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-item">
            <span className="label">GPA</span>
            <span className="value">{data.gpa}</span>
          </div>
          <div className="detail-item">
            <span className="label">sGPA</span>
            <span className="value">3.91</span>
          </div>
          <div className="detail-item">
            <span className="label">MCAT</span>
            <span className="value">517, 129, 131, 129</span>
          </div>
        </div>

        <div className="highlight-section accepted">
          <div className="highlight-header">
            <div className="dot accepted-dot"></div>
            <span>Accepted Schools</span>
          </div>
          <p>Einstein School of Medicine (Accepted)</p>
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