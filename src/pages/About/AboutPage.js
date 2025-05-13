import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import './AboutPage.scss';

// Make sure BIZ UDPMincho font is properly imported
// Note: This font should already be imported in public/index.html or src/styles/main.scss

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
          
          {/* <div className="contact-section">
            <h2 className="contact-header">CONTACT</h2>
            <div className="contact-links">
              <a href="mailto:staff@premedcheatsheet.com" className="contact-link">EMAIL</a>
              <a href="https://instagram.com/premedcheatsheet" target="_blank" rel="noopener noreferrer" className="contact-link">INSTAGRAM</a>
              <a href="https://tiktok.com/@premedcheatsheet" target="_blank" rel="noopener noreferrer" className="contact-link">TIKTOK</a>
            </div>
          </div> */}
          
          <div className="profile-submission">
            <h2 className="submission-header">Join the Premed Creator Team</h2>
            
            <p className="submission-description">
              Are you a premed interested in making engaging, helpful, and relatable content for TikTok and Instagram reels? Help spread our mission through short, viral videos and get PAID for it.
            </p>
            
            <div className="payment-info">
              <p>We are currently paying $15 for each 5-10 second video you make on a new account.</p>
            </div>
            
            <div className="contact-form">
              <h3>Applicant Profile Intake</h3>
              
              {formSubmitted ? (
                <div className="success-message">
                  <p>Thank you for your submission! We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="name-inputs">
                    <div className="form-group">
                      <label>First Name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Last Name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
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
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;