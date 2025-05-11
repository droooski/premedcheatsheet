import React from 'react';
import group1Image from '../../../assets/images/Group-1.png';
import group2Image from '../../../assets/images/Group-2.png';
import './AllInOne.scss';

// Simplified component for the profile cards with images
const ProfileCardWithImage = ({ image }) => {
  return (
    <div className="profile-card-with-image">
      <div className="image-container">
        <img src={image} alt="Profile example" />
      </div>
    </div>
  );
};

const AllInOne = () => {
  return (
    <section className="all-in-one">
      <div className="container">
        <h2>All in one place</h2>
        <p className="section-subheading">Access comprehensive stats from accepted medical students.</p>
        
        <div className="profile-cards-grid">
          {/* First card using Group-1.png */}
          <ProfileCardWithImage image={group1Image} />
          
          {/* Second card using Group-2.png */}
          <ProfileCardWithImage image={group2Image} />
        </div>
      </div>
    </section>
  );
};

export default AllInOne;