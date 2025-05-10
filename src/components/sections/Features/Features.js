// src/components/sections/Features/Features.js
import React from 'react';
import './Features.scss';
import icon1 from '../../../assets/icons/Icon-6.png';
import icon2 from '../../../assets/icons/Icon-1.png';
import icon3 from '../../../assets/icons/Icon-5.png';
import icon4 from '../../../assets/icons/Icon-2.png';
import icon5 from '../../../assets/icons/Icon-3.png';
import icon6 from '../../../assets/icons/Icon-4.png';

// Feature Item Component
const FeatureItem = ({ icon, title, description }) => (
  <div className="feature-item">
    <img src={icon} alt={title} />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const Features = () => {
  // Primary features with corrected icon paths
  const primaryFeatures = [
    {
      icon: icon1,
      title: "Trusted by thousands",
      description: "Data vetted by med students and admissions experts"
    },
    {
      icon: icon2,
      title: "Updated regularly",
      description: "New applicant profiles added weekly"
    },
    {
      icon: icon3,
      title: "Easy to use",
      description: "Intuitive interface to find the data you need"
    }
  ];

  // Secondary features
  const secondaryFeatures = [
    {
      icon: icon4,
      title: "Data-driven insights",
      description: "Make decisions based on real acceptance data"
    },
    {
      icon: icon5,
      title: "Secure and private",
      description: "Your data is protected with industry-standard security"
    },
    {
      icon: icon6,
      title: "Community support",
      description: "Connect with others on the same journey"
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <div className="features-grid">
          {primaryFeatures.map((feature, index) => (
            <FeatureItem
              key={`primary-${index}`}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
        
        <div className="features-grid secondary">
          {secondaryFeatures.map((feature, index) => (
            <FeatureItem
              key={`secondary-${index}`}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;