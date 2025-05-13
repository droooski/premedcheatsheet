import React, { useState } from 'react';
import './ApplicantProfileSubmission.scss';

const ApplicantProfileSubmission = () => {
  const [formData, setFormData] = useState({
    matriculationYear: '',
    gapYears: '',
    stateOfResidency: '',
    gender: '',
    race: '',
    majors: '',
    gpa: '',
    mcat: '',
    medicalVolunteering: '',
    nonMedicalVolunteering: '',
    leadership: '',
    nonMedicalEmployment: '',
    medicalEmployment: '',
    shadowing: '',
    awards: '',
    research: '',
    hobbies: '',
    otherActivities: '',
    reflections: '',
    acceptedSchools: '',
    referredBy: '',
    terms: false
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile submission:', formData);
    
    // Simulate successful submission
    setFormSubmitted(true);
    
    // Reset form
    setFormData({
      matriculationYear: '',
      gapYears: '',
      stateOfResidency: '',
      gender: '',
      race: '',
      majors: '',
      gpa: '',
      mcat: '',
      medicalVolunteering: '',
      nonMedicalVolunteering: '',
      leadership: '',
      nonMedicalEmployment: '',
      medicalEmployment: '',
      shadowing: '',
      awards: '',
      research: '',
      hobbies: '',
      otherActivities: '',
      reflections: '',
      acceptedSchools: '',
      referredBy: '',
      terms: false
    });
    
    // Reset submission status after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };

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
      
      <div className="contact-form">
        <h3>Applicant Profile Intake</h3>
        
        <div className="form-description">
          <p>
            Hey! We are building a website with the sole purpose of helping people 
            following in our footsteps: undergraduate pre-med students. Your information, 
            <strong> anonymously</strong> gathered, will be used to help guide pre-med applicants 
            who are either in the process of applying or are still on their journey. We found 
            that during the time leading up to applying, we often felt lost and without certain 
            guidance on whether or not the activities we were doing were right or if our scores 
            were enough. By having a centralized database of accepted medical students' stats, 
            extracurricular activities, and reflections, we hope to give all pre-med students 
            the opportunity to be just like us!
          </p>
        </div>
        
        {formSubmitted ? (
          <div className="success-message">
            <p>Thank you for your profile submission! We will review and get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Medical school matriculation year <span className="required">*</span></label>
              <input
                type="text"
                name="matriculationYear"
                value={formData.matriculationYear}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>How many gap years? <span className="required">*</span></label>
              <input
                type="text"
                name="gapYears"
                value={formData.gapYears}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>State of residency during application process <span className="required">*</span></label>
              <input
                type="text"
                name="stateOfResidency"
                value={formData.stateOfResidency}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Gender</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Racial Self-Identification</label>
              <input
                type="text"
                name="race"
                value={formData.race}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Majors and minors during college <span className="required">*</span></label>
              <input
                type="text"
                name="majors"
                value={formData.majors}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Undergraduate GPA <span className="required">*</span></label>
              <input
                type="text"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Cumulative MCAT Score <span className="required">*</span></label>
              <input
                type="text"
                name="mcat"
                value={formData.mcat}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>List medical volunteer activities and approximate hours <span className="required">*</span></label>
              <textarea
                name="medicalVolunteering"
                value={formData.medicalVolunteering}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List non-medical volunteer activities and approximate hours <span className="required">*</span></label>
              <textarea
                name="nonMedicalVolunteering"
                value={formData.nonMedicalVolunteering}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List leadership activities and approximate hours <span className="required">*</span></label>
              <textarea
                name="leadership"
                value={formData.leadership}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List paid non-medical employment activities and approximate hours <span className="required">*</span></label>
              <textarea
                name="nonMedicalEmployment"
                value={formData.nonMedicalEmployment}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List paid medical employment activities and approximate hours <span className="required">*</span></label>
              <textarea
                name="medicalEmployment"
                value={formData.medicalEmployment}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List shadowing experiences and approximate hours <span className="required">*</span></label>
              <textarea
                name="shadowing"
                value={formData.shadowing}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List any awards/honors/scholarships/publications earned in UG</label>
              <textarea
                name="awards"
                value={formData.awards}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List any research experiences and approximate hours <span className="required">*</span></label>
              <textarea
                name="research"
                value={formData.research}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List any significant hobbies</label>
              <textarea
                name="hobbies"
                value={formData.hobbies}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>List any other significant extracurricular activities not mentioned above</label>
              <textarea
                name="otherActivities"
                value={formData.otherActivities}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Reflections during the pre-med process and things you learned <span className="required">*</span></label>
              <textarea
                name="reflections"
                value={formData.reflections}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Medical school(s) accepted into <span className="required">*</span></label>
              <textarea
                name="acceptedSchools"
                value={formData.acceptedSchools}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Were you referred to fill out the form, and if so, please put down the first and last name</label>
              <input
                type="text"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
              />
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <label htmlFor="terms">
                By completing and submitting this form, you agree to the Terms and Conditions <span className="required">*</span>
              </label>
            </div>
            
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicantProfileSubmission;