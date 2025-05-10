import React from 'react';
import './Features.scss';

// Feature Item Component
const FeatureItem = ({ icon, title, description }) => (
  <div className="feature-item">
    <img src={icon} alt={title} />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const Features = () => {
  // Primary features
  const primaryFeatures = [
    {
      icon: "/images/icon-trusted.svg", // Public directory reference maintained
      title: "Trusted by thousands",
      description: "Data vetted by med students and admissions experts"
    },
    {
      icon: "/images/icon-updated.svg", // Public directory reference maintained
      title: "Updated regularly",
      description: "New applicant profiles added weekly"
    },
    {
      icon: "/images/icon-easy.svg", // Public directory reference maintained
      title: "Easy to use",
      description: "Intuitive interface to find the data you need"
    }
  ];

  // Secondary features
  const secondaryFeatures = [
    {
      icon: "/images/icon-data.svg", // Public directory reference maintained
      title: "Data-driven insights",
      description: "Make decisions based on real acceptance data"
    },
    {
      icon: "/images/icon-secure.svg", // Public directory reference maintained
      title: "Secure and private",
      description: "Your data is protected with industry-standard security"
    },
    {
      icon: "/images/icon-community.svg", // Public directory reference maintained
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