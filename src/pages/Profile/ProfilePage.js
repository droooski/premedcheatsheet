// src/pages/Profile/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import { onAuthChange, getUserProfile } from '../../firebase/authService';
import './ProfilePage.scss';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for authenticated user on component mount
  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile
        const result = await getUserProfile(currentUser.uid);
        if (result.success) {
          setProfile(result.profile);
        }
      } else {
        // If not logged in, redirect to home page
        navigate('/');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="container">
          <div className="loading-spinner">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-content">
        <div className="container">
          <h1>Welcome to your Profile</h1>
          
          <div className="profile-section">
            <h2>Your Information</h2>
            {profile ? (
              <div className="profile-info">
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>Email:</strong> {profile.email}</p>
              </div>
            ) : (
              <p>No profile information found.</p>
            )}
          </div>
          
          <div className="profile-section">
            <h2>Your Subscription</h2>
            {profile?.subscriptions?.length > 0 ? (
              <div className="subscription-info">
                <p><strong>Plan:</strong> {profile.subscriptions[0].plan}</p>
                <p><strong>Status:</strong> {profile.subscriptions[0].active ? 'Active' : 'Inactive'}</p>
                <p><strong>Start Date:</strong> {new Date(profile.subscriptions[0].startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(profile.subscriptions[0].endDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p>No active subscriptions found.</p>
            )}
          </div>
          
          {/* Placeholder for medical school data */}
          <div className="profile-section">
            <h2>Medical School Profiles</h2>
            <p>This section will show the list of medical schools with available profiles.</p>
            
            {/* Example school list - replace with actual data */}
            <div className="school-list">
              <div className="school-item">
                <h3>Harvard Medical School</h3>
                <button className="view-profiles-btn">View Profiles</button>
              </div>
              
              <div className="school-item">
                <h3>Stanford School of Medicine</h3>
                <button className="view-profiles-btn">View Profiles</button>
              </div>
              
              <div className="school-item">
                <h3>Johns Hopkins University School of Medicine</h3>
                <button className="view-profiles-btn">View Profiles</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;