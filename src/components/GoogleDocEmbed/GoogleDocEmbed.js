// src/components/GoogleDocEmbed/GoogleDocEmbed.js
import React from 'react';
import './GoogleDocEmbed.scss';

const GoogleDocEmbed = ({ docId, title }) => {
  const docUrl = `https://docs.google.com/document/d/${docId}/preview`;
  
  return (
    <div className="google-doc-embed">
      <h3 className="doc-title">{title}</h3>
      <div className="doc-container">
        <iframe 
          src={docUrl} 
          title={title}
          width="100%" 
          height="600"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default GoogleDocEmbed;