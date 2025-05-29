import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import './PremedCheatsheetPlusPage.scss';

const PremedCheatsheetPlusPage = () => {
  const [downloadStatus, setDownloadStatus] = useState({});

  const handleDownload = (fileName, displayName) => {
    // Create download link
    const link = document.createElement('a');
    link.href = `/docs/${fileName}`;
    link.download = fileName;
    link.click();
    
    // Update download status
    setDownloadStatus(prev => ({
      ...prev,
      [fileName]: 'downloaded'
    }));
    
    setTimeout(() => {
      setDownloadStatus(prev => ({
        ...prev,
        [fileName]: 'ready'
      }));
    }, 2000);
  };

  const openSummerPrograms = () => {
    window.open('https://docs.google.com/spreadsheets/d/15WblooRULO-pl0pEVThNzD_3tBN0YMb6o7wksIgd_7M/edit?usp=drive_link', '_blank');
  };

  const resources = [
    {
      title: "Cold Emailing Templates",
      description: "Proven templates for reaching out to research labs, doctors for shadowing, and networking opportunities.",
      items: [
        "Cold Emailing Template for Research #1",
        "Cold Emailing Template for Research #2", 
        "Cold Emailing Template for Shadowing #1",
        "Cold Emailing Template for Shadowing #2"
      ],
      icon: "📧"
    },
    {
      title: "Professional CV Template",
      description: "Polished, ATS-friendly CV template optimized specifically for medical school applications.",
      downloadable: true,
      fileName: "CV_Template_PremedCheatsheet.docx",
      icon: "📄"
    },
    {
      title: "Pre-med Summer Program Database",
      description: "Comprehensive database of summer programs, research opportunities, and their requirements.",
      external: true,
      action: openSummerPrograms,
      icon: "🏫"
    },
    {
      title: "MCAT-Optimized Course Schedules & Study Plan",
      description: "Strategic course planning and study schedules designed to maximize your MCAT preparation.",
      comingSoon: true,
      icon: "📚"
    }
  ];

  return (
    <div className="premed-cheatsheet-plus-page">
      <Navbar />
      <div className="container">
        <div className="header-section">
          <h1 className="page-title">Premed Cheatsheet+</h1>
          <p className="page-subtitle">
            Feel free to copy and paste any templates!
          </p>
        </div>

        <div className="resources-grid">
          {resources.map((resource, index) => (
            <div key={index} className="resource-card">
              <div className="resource-header">
                <span className="resource-icon">{resource.icon}</span>
                <h2>{resource.title}</h2>
              </div>
              
              <p className="resource-description">{resource.description}</p>
              
              {resource.items && (
                <div className="resource-content">
                  <div className="templates-grid">
                    {resource.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="template-item">
                        <h3>{item}</h3>
                        <div className="template-content">
                          {/* Template content would be displayed here */}
                          <div className="template-preview">
                            <p>Template content preview...</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {resource.downloadable && (
                <div className="resource-actions">
                  <button 
                    className={`download-button ${downloadStatus[resource.fileName] || 'ready'}`}
                    onClick={() => handleDownload(resource.fileName, resource.title)}
                    disabled={downloadStatus[resource.fileName] === 'downloaded'}
                  >
                    {downloadStatus[resource.fileName] === 'downloaded' 
                      ? '✓ Downloaded' 
                      : '⬇ Download Template'}
                  </button>
                </div>
              )}
              
              {resource.external && (
                <div className="resource-actions">
                  <button 
                    className="external-button"
                    onClick={resource.action}
                  >
                    🔗 Open Database
                  </button>
                </div>
              )}
              
              {resource.comingSoon && (
                <div className="resource-actions">
                  <div className="coming-soon-badge">
                    🚀 Coming Soon
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="additional-content">
          <div className="cold-email-templates-section">
            <h2>Cold Emailing Templates</h2>
            
            <div className="template-card">
              <h3>Cold Emailing Template for Research #1</h3>
              <div className="template-box">
                <p><strong>Dr. ______,</strong></p>
                <br />
                <p>My name is _____, and I'm a ______ student at ______ University. I'm also a jumper on the track and field team at ______, and that is one of the reasons that has led to my interest in orthopedics and specifically foot and ankle. I have been following the work you have done on ________ and found it extremely interesting. I was wondering if you had any open positions to work with you this summer?</p>
                <br />
                <p>I currently conduct orthopedic research under _____ at ______. I am involved with two projects: one investigating the phosphocreatine recovery in the lower extremity of heart-failure patients and one involving characterization of fixation times of knee cartilage and meniscus by ultra-high resolution 7T MRI segmentations. I have finished a retrospective pathological femur fixation project with Dr. _____ at University Hospitals in the past.</p>
                <br />
                <p>This past summer I was awarded the NIH Director's Award, and I have a couple abstract publications and several poster presentations with one at the Regeneron International Science and Engineering Fair.</p>
                <br />
                <p>I have attached my CV below. If you are available, would it be possible to discuss possible research opportunities? Feel free to contact me through this email, my phone number: ______, or an online meeting. It would be a wonderful opportunity to contribute to research with you.</p>
                <br />
                <p>Thanks,</p>
                <p>_____</p>
              </div>
            </div>

            <div className="template-card">
              <h3>Cold Emailing Template for Research #2</h3>
              <div className="template-box">
                <p><strong>Dear Dr. _____ and the _____ Lab,</strong></p>
                <br />
                <p>Hello! I hope you are doing well! My name is _____, and I am a current _____ undergraduate studying at ______ University. I am majoring in biomedical engineering with an intended specialty in biomaterials. I have attached my CV to this email for reference. I am highly interested in the field of tissue regeneration and engineering.</p>
                <br />
                <p>Reading your paper titled "____________" has solidified my fascination for tissue engineering. I was amazed at how your lab, despite the native resistance in the experimental cells, was able to successfully herd cell populations into complex maneuvers using a programmable electro-bioreactor. As mentioned in the paper, the applications of this research extend into areas such as wound healing and morphogenesis, and I am very interested to learn more.</p>
                <br />
                <p>I understand that you are extremely busy, but would it be possible for you to take some time to talk with me about your research and to answer some questions I have in regards to your work?</p>
                <br />
                <p>PS: I never knew the history of rhinoplasty could be so morbid yet so intriguing until I listened to your _____ Talk.</p>
                <br />
                <p>Thank you for your time and I hope to hear from you soon!</p>
                <br />
                <p>Sincerely,</p>
                <p>________</p>
              </div>
            </div>

            <div className="template-card">
              <h3>Cold Emailing Template for Shadowing #1</h3>
              <div className="template-box">
                <p><strong>Dr. _____,</strong></p>
                <br />
                <p>My name is _____, and I'm a _____ student at ____ University. I've worked in musculoskeletal radiology research with Dr. ___ and Dr. __ in the past, and as medical school approaches, I was wondering if I could shadow you sometime? I am very interested in shadowing you, as you have years of experience in musculoskeletal radiology, and I'm interested in this field. I have my clinical research onboarding at ______ completed, so hopefully the paperwork to shadow will be quick. Let me know if this can be set up, and what the next steps are. Thanks!</p>
                <br />
                <p><strong>Name</strong></p>
              </div>
            </div>

            <div className="template-card">
              <h3>Cold Emailing Template for Shadowing #2</h3>
              <div className="template-box">
                <p><strong>Hello Dr. ____,</strong></p>
                <br />
                <p>My name is _____, and I am currently a _____ year undergraduate student at _______ University studying _____ on the pre-med track. We are currently exploring the digestive system in my anatomy and physiology class, and I wanted to understand what general surgery as a career looks like day-to-day. I would love to shadow you if there is any opportunity available!</p>
                <br />
                <p>Please let me know if this would be a possibility. Thank you and looking forward to hearing from you!</p>
                <br />
                <p>Sincerely,</p>
                <p>______</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PremedCheatsheetPlusPage;