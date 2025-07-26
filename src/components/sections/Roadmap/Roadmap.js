import React from 'react';
import roadmapImage from '../../../assets/images/layoutImage-1.png';
import './Roadmap.scss';

const Roadmap = () => {
  return (
    <section className="roadmap">
      <div className="container">
        <div className="roadmap-content">
          {/* On desktop, image is on left and text on right */}
          {/* On mobile, the CSS `flex-direction: column-reverse` will put text first, image second */}
          <div className="image-container">
            <img src={roadmapImage} alt="Medical student equipment" />
          </div>
          <div className="text-content">
            <h2>Your roadmap to med school, built by those who made it</h2>
            <p>
              Wondering if you're on track for med school? Our database gives you exactly what we wished we had: 
              detailed stats, successful strategies, and honest insights from accepted students.
            </p>
            <p>
              Browse dozens of real acceptance profiles, complete with GPAs, MCAT scores, and the extracurriculars that 
              actually worked. Created by med students who remember exactly what you're going through.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;