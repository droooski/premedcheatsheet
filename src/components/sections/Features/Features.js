// src/components/sections/Features/Features.js
import React from 'react';
import './Features.scss';
import icon1 from '../../../assets/icons/Icon-6.png'; // Trusted by thousands
import icon2 from '../../../assets/icons/Icon-1.png'; // Updated regularly
import icon3 from '../../../assets/icons/Icon-5.png'; // Easy to use
import icon4 from '../../../assets/icons/Icon-2.png'; // Data-driven insights
import icon5 from '../../../assets/icons/Icon-3.png'; // Secure and private
import icon6 from '../../../assets/icons/Icon-4.png'; // Community support

// Simplified Feature Item Component
const FeatureItem = ({ icon, title }) => (
  <div className="feature-item">
    <img src={icon} alt={title} />
    <h3>{title}</h3>
  </div>
);

const Features = () => {
  // Arranged in 3-2-1 responsive layout
  return (
    <section className="features">
      <div className="container">
        {/* First row - 3/2/1 features depending on screen size */}
        <div className="features-grid">
          <FeatureItem icon={icon1} title="Trusted by thousands" />
          <FeatureItem icon={icon2} title="Updated regularly" />
          <FeatureItem icon={icon4} title="Easy to use" />
        </div>
        
        {/* Second row - 3/2/1 features depending on screen size */}
        <div className="features-grid secondary">
          <FeatureItem icon={icon5} title="Data-driven insights" />
          <FeatureItem icon={icon6} title="Secure and private" />
          <FeatureItem icon={icon3} title="Community support" />
        </div>
      </div>
    </section>
  );
};

export default Features;