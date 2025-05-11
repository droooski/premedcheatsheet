import React from 'react';
import layoutImage2 from '../../../assets/images/layoutImage-2.png';
import './MedSchoolCode.scss';

const MedSchoolCode = () => {
  return (
    <section className="med-school-code">
      <div className="container">
        <div className="code-content">
          <div className="text-content">
            <h2>Crack the med school code</h2>
            <p>
              Gain access to entire profiles of successful medical school applicants and discover the schools they got into. 
              Analyze application patterns and learn how to strengthen your application.
            </p>
          </div>
          <div className="image-container">
            <img src={layoutImage2} alt="Medical school insights" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MedSchoolCode;