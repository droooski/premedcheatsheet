// src/components/sections/SneakPeek/SneakPeek.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SneakPeek.scss';

const SneakPeek = ({ onTimeExpired }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const navigate = useNavigate();

  // Timer effect that triggers callback when time expires
  useEffect(() => {
    if (timeLeft <= 0) {
      // Call the callback function when timer expires
      if (onTimeExpired) {
        onTimeExpired();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onTimeExpired]);

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  return (
    <div className="sneak-peek">
      {/* Timer notification */}
      <div className="timer-notification">
        <div className="timer-icon-container">
          <svg className="timer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-10a1 1 0 10-2 0v3.586l-1.707 1.707a1 1 0 001.414 1.414l2-2a1 1 0 00.293-.707V8z" clipRule="evenodd" />
          </svg>
          <span>Guest access expires in <span className="time-remaining">{timeLeft} seconds</span></span>
        </div>
        <button 
          className="upgrade-button" 
          onClick={handleUpgradeClick}
        >
          Upgrade Now
        </button>
      </div>

      {/* Header */}
      <div className="section-header">
        <h2>Sneak Peek</h2>
        <p>
          See what schools successful applicants got into and the stats it took to get them there. To see full 
          applicant profiles and reflections from successful applicants, purchase the Premed Cheatsheet.
        </p>
      </div>

      {/* Profile Cards */}
      <div className="profile-cards-grid">
        {/* Business Student Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Business Student</h3>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <div className="label">Gender</div>
              <div className="value">Male</div>
            </div>
            <div className="info-item">
              <div className="label">Race</div>
              <div className="value">Asian</div>
            </div>
            <div className="info-item">
              <div className="label">State</div>
              <div className="value">Virginia</div>
            </div>
            <div className="info-item">
              <div className="label">Matriculation Year</div>
              <div className="value">2025</div>
            </div>
          </div>
          
          <div className="scores-grid">
            <div className="score-item">
              <div className="label">GPA</div>
              <div className="value">4.00</div>
            </div>
            <div className="score-item">
              <div className="label">MCAT</div>
              <div className="value">520</div>
            </div>
          </div>
          
          <div className="accepted-schools">
            <div className="section-title">
              <div className="icon"></div>
              <h4>Accepted Schools</h4>
            </div>
            <div className="schools-list">
              <span className="school-badge">Johns Hopkins</span>
              <span className="school-badge">UVA School of Medicine</span>
              <span className="school-badge">Columbia University</span>
            </div>
          </div>
          
          <div className="background-section">
            <div className="section-title">
              <div className="icon"></div>
              <h4>Applicant Background</h4>
            </div>
            
            <div className="background-items">
              <div className="background-item">
                <div className="label">Major:</div>
                <div className="value">Economics major, Biology minor (PreHealth)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Research:</div>
                <div className="value">UTSW O'Donnell Lab (850 hrs), NIH NIDDK (450 hrs), Penn J. Mitchell Neurosci (250 hrs), Duke Surgery Lab</div>
              </div>
              
              <div className="background-item">
                <div className="label">Medical Volunteer Activities:</div>
                <div className="value">Hospital volunteer (150 hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Medical Paid Employment Activities:</div>
                <div className="value">None (student)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Leadership:</div>
                <div className="value">Sports Medicine Experience (apps: men's) (15 hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Non-medical Paid Employment Activities:</div>
                <div className="value">Marketing internship, Economics TA (800 hrs), Retail (400 hrs) Total: ~1,550 hrs paid work (300 hrs), President of Student Fan Club (10 hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Shadowing:</div>
                <div className="value">Multiple specialties (urology, oncology, cardiology) total:~100 hours</div>
              </div>
              
              <div className="background-item">
                <div className="label">Awards:</div>
                <div className="value">3 Dean's List Awards, Phi Beta Kappa, Phi Kappa Phi, Order of Omega, Society of Automation, Hack Virginia, and MSN Sports Scholarship (~$30k) Designated School Transition Grant</div>
              </div>
              
              <div className="background-item">
                <div className="label">Other Significant Activities:</div>
                <div className="value">NUAT (artists) (2,600 hours)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Hobbies:</div>
                <div className="value">Playing the Flute</div>
              </div>
            </div>
            
            <div className="reflections">
              <h4>Reflections</h4>
              <p>
                I focus on the uniquely different types of applicants I like. Can anyone else have inspiration from a peer?
              </p>
            </div>
          </div>
        </div>
        
        {/* Music Student Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Music Student</h3>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <div className="label">Gender</div>
              <div className="value">Male</div>
            </div>
            <div className="info-item">
              <div className="label">Race</div>
              <div className="value">White</div>
            </div>
            <div className="info-item">
              <div className="label">State</div>
              <div className="value">Maryland</div>
            </div>
            <div className="info-item">
              <div className="label">Matriculation Year</div>
              <div className="value">2024</div>
            </div>
          </div>
          
          <div className="scores-grid">
            <div className="score-item">
              <div className="label">GPA</div>
              <div className="value">3.801</div>
            </div>
            <div className="score-item">
              <div className="label">MCAT</div>
              <div className="value">523</div>
            </div>
          </div>
          
          <div className="accepted-schools">
            <div className="section-title">
              <div className="icon"></div>
              <h4>Accepted Schools</h4>
            </div>
            <div className="schools-list">
              <span className="school-badge">Ohio State</span>
              <span className="school-badge">Cincinnati College of Medicine</span>
              <span className="school-badge">Michigan (Waitlist)</span>
            </div>
          </div>
          
          <div className="background-section">
            <div className="section-title">
              <div className="icon"></div>
              <h4>Applicant Background</h4>
            </div>
            
            <div className="background-items">
              <div className="background-item">
                <div className="label">Research:</div>
                <div className="value">Neuropsychology lab (1000+ hrs) (Poster, ADRC), Neurophysiology lab (400 hrs), Developmental psychology lab (200 hrs), 3D Imaging and capture (300+ hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Medical Volunteer Activities:</div>
                <div className="value">Hospital volunteer (400+ hours), Hospital translator (100 hrs), Scribe in emergency room (50+ hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Medical Paid Employment Activities:</div>
                <div className="value">Medical scribe (500 hrs), Undergraduate course TA (biology, chemistry) (300+, freshman & sophomore level courses), Clinical research assistant (300+ hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Non-medical Paid Employment Activities:</div>
                <div className="value">Cafe job (100+ hrs), Restaurant server, Line cook (500+ hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Leadership:</div>
                <div className="value">Vice President of Neuroscience, Kappa Kappa Psi (VP), Symphony Orchestra section leader (400+ hrs)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Shadowing:</div>
                <div className="value">Plastic surgery (50+ hrs), Neurosurgery (50+ hrs), Family med (50+ hrs), Hospital medicine (50+ hrs) and Cardiology Health Clinic (50+)</div>
              </div>
              
              <div className="background-item">
                <div className="label">Awards:</div>
                <div className="value">Magna Cum Laude, Dean's list (8/8 sems), McPherson 1st Prize, Neuroscience Award, 3x ADRC Neuropsychology fellow, 3rd Place Undergraduate Conference of Health, May 2021</div>
              </div>
              
              <div className="background-item">
                <div className="label">Other Significant Activities:</div>
                <div className="value">1st Chair trombone in 2 ensembles (Symphony orchestra, all star band), 6 Music Ensembles (1500+ hours), Athletic Band (first chair), Triathlon Club, Endurance Sports, Outdoor, Art</div>
              </div>
              
              <div className="background-item">
                <div className="label">Hobbies:</div>
                <div className="value">Painting, Music, Trail running</div>
              </div>
            </div>
            
            <div className="reflections">
              <h4>Reflections</h4>
              <p>
                First apply to schools that match your stats! Applicants, I kill time between interviews playing video games. Others read. Some people do puzzles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <h3>Want to read more success stories?</h3>
        <p>
          Join for full access to dozens of student profiles.
        </p>
        <button 
          className="cta-button" 
          onClick={handleUpgradeClick}
        >
          Access the full cheat sheet
        </button>
      </div>
    </div>
  );
};

export default SneakPeek;