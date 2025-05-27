// src/components/sections/ProfileCard/ProfileCard.js
import React from 'react';
import './ProfileCard.scss';

const ProfileCard = ({ profile }) => {
  if (!profile) {
    return null;
  }

  const {
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
    clinicalExperience,
    research,
    leadership,
    nonMedicalEmployment,
    medicalEmployment,
    shadowing,
    awardsHonors,
    hobbies,
    otherActivities,
    major,
    reflections
  } = profile;

  // REMOVED: title generation code and card-header section

  return (
    <div className="profile-card">
      {/* REMOVED: card-header div with title */}
      
      <div className="info-section">
        <div className="info-grid">
          <div className="info-item">
            <div className="label">Gender</div>
            <div className="value">{gender || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="label">Ethnicity</div>
            <div className="value">{race || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="label">State</div>
            <div className="value">{stateOfResidency || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="label">ApplicationYear</div>
            <div className="value">{matriculationYear || 'N/A'}</div>
          </div>
        </div>
        
        <div className="scores-grid">
          <div className="score-item">
            <div className="label">GPA</div>
            <div className="value">{gpa || 'N/A'}</div>
          </div>
          <div className="score-item">
            <div className="label">MCAT</div>
            <div className="value">{mcat || 'N/A'}</div>
          </div>
          <div className="score-item">
            <div className="label">MCAT Subsections</div>
            <div className="value">{mcatBreakdown || 'N/A'}</div>
          </div>
        </div>
      </div>
      
      <div className="section-header">
        <div className="icon accepted"></div>
        <h4>Accepted Schools</h4>
      </div>
      
      <div className="accepted-schools">
        <div className="schools-list">
          {acceptedSchools && acceptedSchools.length > 0 ? (
            acceptedSchools.map((school, index) => (
              <div key={index} className="school-badge">{school}</div>
            ))
          ) : (
            <div className="empty-data">No schools specified</div>
          )}
        </div>
      </div>
      
      <div className="section-header">
        <div className="icon background"></div>
        <h4>Applicant Background</h4>
      </div>
      
      <div className="background-section">
        {major && (
          <div className="background-item">
            <div className="label">Major:</div>
            <div className="value">{major}</div>
          </div>
        )}
        
        {research && (
          <div className="background-item">
            <div className="label">Research:</div>
            <div className="value">{research}</div>
          </div>
        )}
        
        {clinicalExperience && (
          <div className="background-item">
            <div className="label">Clinical Experience:</div>
            <div className="value">{clinicalExperience}</div>
          </div>
        )}
        
        {medicalVolunteering && (
          <div className="background-item">
            <div className="label">Medical Volunteering Experience:</div>
            <div className="value">{medicalVolunteering}</div>
          </div>
        )}
        
        {nonMedicalVolunteering && (
          <div className="background-item">
            <div className="label">Non-medical Volunteering Experience:</div>
            <div className="value">{nonMedicalVolunteering}</div>
          </div>
        )}
        
        {leadership && (
          <div className="background-item">
            <div className="label">Leadership:</div>
            <div className="value">{leadership}</div>
          </div>
        )}
        
        {nonMedicalEmployment && (
          <div className="background-item">
            <div className="label">Paid Non-medical Employment Activities:</div>
            <div className="value">{nonMedicalEmployment}</div>
          </div>
        )}
        
        {medicalEmployment && (
          <div className="background-item">
            <div className="label">Paid Medical Employment Activities:</div>
            <div className="value">{medicalEmployment}</div>
          </div>
        )}
        
        {shadowing && (
          <div className="background-item">
            <div className="label">Shadowing Experience:</div>
            <div className="value">{shadowing}</div>
          </div>
        )}
        
        {awardsHonors && (
          <div className="background-item">
            <div className="label">Awards:</div>
            <div className="value">{awardsHonors}</div>
          </div>
        )}
        
        {hobbies && (
          <div className="background-item">
            <div className="label">Hobbies:</div>
            <div className="value">{hobbies}</div>
          </div>
        )}
        
        {otherActivities && (
          <div className="background-item">
            <div className="label">Other Significant Activities:</div>
            <div className="value">{otherActivities}</div>
          </div>
        )}
      </div>
      
      {reflections && (
        <>
          <div className="section-header">
            <div className="icon background"></div>
            <h4>Reflections</h4>
          </div>
          <div className="reflections-section">
            <div className="reflections-content">
              <p>{reflections}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileCard;