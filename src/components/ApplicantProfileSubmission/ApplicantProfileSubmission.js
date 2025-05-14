import React from 'react';
import './ApplicantProfileSubmission.scss';

const ApplicantProfileSubmission = () => {
  return (
    <div className="profile-submission-section">
      <h2 className="submission-header">Submit Your Applicant Profile</h2>
      
      <p className="submission-description">
        Are you a medical student or incoming medical student with a passion to help 
        premeds? Help spread our mission by submitting your applicant profile below.
      </p>
      
      <div className="payment-info">
        <p>We are currently paying $2 for your profile and any profiles you refer.</p>
      </div>
      
      <p className="form-instruction">Fill out the form below.</p>
      
      <div className="google-form-container">
        {/* Replace the URL below with your actual Google Form embed URL */}
        <iframe 
          src="https://docs.google.com/forms/d/e/1FAIpQLScYaGZ6VoTX57f5k6F5edMdNXZFaiWTmHUnlsV4Y4TAiCfp7Q/viewform?pli=1&embedded=true" 
          frameBorder="0" 
          marginHeight="0" 
          marginWidth="0"
          title="Applicant Profile Submission Form"
          className="google-form-iframe"
        >
          Loading form...
        </iframe>
      </div>
    </div>
  );
};

export default ApplicantProfileSubmission;