// src/pages/About/AboutPage.js
import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // eslint-disable-next-line no-unused-vars
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create the form data to be sent
      const mailData = {
        to: 'staff@premedcheatsheet.com',
        from: formData.email,
        subject: `Contact Form: ${formData.subject}`,
        text: `
          Name: ${formData.firstName} ${formData.lastName}
          Email: ${formData.email}
          Newsletter: ${formData.newsletter ? 'Yes' : 'No'}
          
          Message:
          ${formData.message}
        `,
        html: `
          <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Newsletter:</strong> ${formData.newsletter ? 'Yes' : 'No'}</p>
          <p><strong>Message:</strong></p>
          <p>${formData.message.replace(/\n/g, '<br>')}</p>
        `
      };

      // Option 1: Use a simple server-side endpoint if you have one
      // Replace this URL with your actual email sending endpoint
      const response = await fetch('https://api.premedcheatsheet.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      // Success! Show feedback to the user
      setFormSubmitted(true);
      setLoading(false);
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
        newsletter: false
      });
      
      // Reset the success message after 3 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending email:', error);
      setError('There was a problem sending your message. Please try again or email us directly at staff@premedcheatsheet.com');
      setLoading(false);
    }
  };
  
  return (
    <div className="about-page">
      <Navbar />
      
      <div className="about-content">
        <div className="container">
          {/* Two-column layout for About and Contact sections */}
          <div className="about-contact-container">
            {/* Left column - About section */}
            <div className="about-column">
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
            </div>
            
            {/* Right column - Contact section */}
            <div className="contact-column">
              <h2 className="contact-header">Contact</h2>
              <div className="social-media-row">
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
                    <div className="tiktok-icon-placeholder"></div>
                  </span>
                  <span className="contact-text">@orthrobro</span>
                </a>
              </div>
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
                    <form action="https://formsubmit.co/staff@premedcheatsheet.com" method="POST">
                      {error && <div className="error-message"><p>{error}</p></div>}
                      
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
                      
                      <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Sending...' : 'Submit'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Applicant Profile */}
            <div className="form-column">
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