import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import ApplicantProfileSubmission from '../../components/ApplicantProfileSubmission/ApplicantProfileSubmission';
import './AboutPage.scss';

const AboutPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
    newsletter: false
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
    console.log('Form submitted:', formData);
    
    // Here you would typically send the data to your backend
    // For now, just simulate a successful submission
    setFormSubmitted(true);
    
    // Reset form after submission
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: '',
      newsletter: false
    });
    
    // Reset submission state after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };
  
  return (
    <div className="about-page">
      <Navbar />
      
      <div className="about-content">
        <div className="container">
          <h1 className="about-header">About</h1>
          
          <div className="about-text-container">
            <p className="about-paragraph">
              We have gone through the pre-med process and understand how hard it is to know what extra-curriculars are worth pursuing, how many hours of shadowing are needed, and how much focus should be put on academics.
            </p>
            
            <p className="about-paragraph">
              That's why we created the Premed Cheatsheet.
            </p>
            
            <p className="about-paragraph">
              The Cheatsheet is your big bro who has gone through the process. It's a role model that shows the many flavors of students that make up a medical school.
            </p>
            
            <p className="about-paragraph">
              We hope the Premed Cheatsheet can help many of you on the journey towards becoming a physician.
            </p>
          </div>
          
          {/* Contact section with social media links */}
          <div className="contact-section">
            <h2 className="contact-header">CONTACT</h2>
            <div className="contact-links">
              <a href="mailto:staff@premedcheatsheet.com" className="contact-link">
                <span className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <span className="contact-text">staff@premedcheatsheet.com</span>
              </a>
              
              <a href="https://www.instagram.com/orthrobro/" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </span>
                <span className="contact-text">@orthrobro</span>
              </a>
              
              <a href="https://www.tiktok.com/@orthrobro?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                    <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                    <path d="M15 8v8a4 4 0 1 1-4-4"></path>
                  </svg>
                </span>
                <span className="contact-text">@orthrobro</span>
              </a>
            </div>
          </div>
          
          {/* Two-column layout for forms */}
          <div className="forms-container">
            {/* Left column - Creator Team Form */}
            <div className="form-column">
              <div className="profile-submission">
                <h2 className="submission-header">Join the Premed<br />Creator Team</h2>
                
                <p className="submission-description">
                  Are you a premed interested in making engaging, helpful, and relatable content for TikTok and Instagram reels? Help spread our mission through short, viral videos and get PAID for it.
                </p>
                
                <div className="payment-info">
                  <p>We are currently paying $15 for each 5-10 second video you make on a new account.</p>
                </div>
                
                <p className="form-instruction">Send us an email below.</p>
                
                <div className="contact-form">
                  {formSubmitted ? (
                    <div className="success-message">
                      <p>Thank you for your submission! We will get back to you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="form-field-group">
                        <label>Name <span className="required">*</span></label>
                        <div className="name-inputs">
                          <div className="form-group">
                            <input
                              type="text"
                              name="firstName"
                              placeholder="First Name"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <input
                              type="text"
                              name="lastName"
                              placeholder="Last Name"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          name="newsletter"
                          id="newsletter"
                          checked={formData.newsletter}
                          onChange={handleChange}
                        />
                        <label htmlFor="newsletter">Sign up for news and updates</label>
                      </div>
                      
                      <div className="form-group">
                        <label>Subject <span className="required">*</span></label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Message <span className="required">*</span></label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                      
                      <button type="submit" className="submit-button">
                        Submit
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Applicant Profile */}
            <div className="form-column">
              {/* Use the ApplicantProfileSubmission component without adding additional headers */}
              <ApplicantProfileSubmission />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;