// src/pages/ApplicationCheatsheet/InterviewCheatsheet.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import GoogleDocEmbed from '../../components/GoogleDocEmbed/GoogleDocEmbed';
import './InterviewCheatsheet.scss';

// Import local preview images
//TODO: fix the file paths
import file1Preview from '../../assets/images/interview_questions.png';
import file2Preview from '../../assets/images/school_specific.png';
import file3Preview from '../../assets/images/interview_question_list.png';
import file4Preview from '../../assets/images/during_interview.png';
import file5Preview from '../../assets/images/post_interview_advice.png';

const InterviewCheatsheet = () => {
  const [expandedDoc, setExpandedDoc] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // Collection of Google Doc resources with their actual IDs from your links
  // TODO: fix the google doc ids
  const documents = [
    {
      id: '1iOLjcYjeoGkJ8T0x1OpV4QJAGGBt3qVC',
      title: 'Premed Cheatsheet: Overall Interview Prep and Strategy',
      description: 'Learn how to become a confident, personable interviewee and avoid common mistakes.',
      previewImage: null // This one doesn't need preview as it's the featured document
    },
    {
      id: '1ZrNwSS3IrCa3PH402iqp-NqZOQB6N2e5',
      title: 'Premed Cheatsheet: Common Questions Strategy',
      description: 'Effective frameworks and examples for answering the most common interview questions.',
      previewImage: file1Preview
    },
    {
      id: '1NJQt4wt-cwQNWcooszmjcbKK41OFHcSa',
      title: 'Premed Cheatsheet: School Specific Interviews',
      description: 'Learn how to break down what specific medical schools are looking for and tailor your responses to stand out from the crowd.',
      previewImage: file2Preview
    },
    {
      id: '1HiGzoW2BmpWAE0agUQXjW7MEMO3uPDkr',
      title: 'Premed Cheatsheet: Common Questions',
      description: 'Curated list of questions to prepare for across a variety of categories.',
      previewImage: file3Preview
    },
    {
      id: '1U6ZKufJzmjgD2XaykBJZBAOdSRc0pmVn',
      title: 'Premed Cheatsheet: During the Interview',
      description: 'Tips on conducting yourself effectively during interviews and leaving a positive impression.',
      previewImage: file4Preview
    },
    {
      id: '1RLBgP5h45TCGJo23YdcxNuavEHw9EgGL',
      title: 'Premed Cheatsheet: Post Interview Advice',
      description: 'Advice on follow-up etiquette and reflection strategies to maximize your post-interview success.',
      previewImage: file5Preview
    }
  ];

  // Toggle document expansion
  const toggleExpandDoc = (docId) => {
    if (expandedDoc === docId) {
      setExpandedDoc(null);
    } else {
      setExpandedDoc(docId);
      
      // Scroll to the expanded doc with a slight delay to ensure DOM updates
      setTimeout(() => {
        const element = document.getElementById(`doc-expanded-${docId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Generate download link for a document
  const getDownloadLink = (docId) => {
    return `https://docs.google.com/document/d/${docId}/export?format=pdf`;
  };

  return (
    <div className="interview-cheatsheet-page">
      <Navbar />
      
      <div className="cheatsheet-content">
        <div className="container">
          <div className="header-container">
            <h1 className="page-title">Interview Cheatsheet</h1>
            <p className="page-subtitle">Feel free to copy and paste any templates!</p>
          </div>

          {/* Featured document - first one in fullscreen mode */}
          <div className="featured-document">
            <h2 className="section-title">Premed Cheatsheet: Overall Interview Prep and Strategy</h2>
            <div className="featured-document-container">
              <GoogleDocEmbed 
                docId={documents[0].id}
                title={documents[0].title}
              />
              <div className="document-actions">
                <a 
                  href={getDownloadLink(documents[0].id)} 
                  className="download-button"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>

          {/* Document Grid - Remaining documents */}
          <h2 className="section-title">Additional Interview Resources</h2>
          <div className="document-grid">
            {documents.slice(1).map((doc) => (
              <React.Fragment key={doc.id}>
                <div className="document-card">
                  <div className="document-preview">
                    <img src={doc.previewImage} alt={`Preview of ${doc.title}`} />
                    <div className="preview-overlay">
                      <button 
                        className="preview-button"
                        onClick={() => toggleExpandDoc(doc.id)}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                  <div className="document-info">
                    <h3>{doc.title}</h3>
                    <p>{doc.description}</p>
                    <div className="document-actions">
                      <button 
                        className="view-button"
                        onClick={() => toggleExpandDoc(doc.id)}
                      >
                        View Document
                      </button>
                      <a 
                        href={getDownloadLink(doc.id)} 
                        className="download-button"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>

                {/* Expanded document view */}
                {expandedDoc === doc.id && (
                  <div className="expanded-document" id={`doc-expanded-${doc.id}`}>
                    <div className="expanded-header">
                      <h2>{doc.title}</h2>
                      <button 
                        className="close-button"
                        onClick={() => setExpandedDoc(null)}
                      >
                        Close
                      </button>
                    </div>
                    <div className="google-doc-container">
                      <GoogleDocEmbed 
                        docId={doc.id}
                        title={doc.title}
                      />
                    </div>
                    <div className="expanded-actions">
                      <a 
                        href={getDownloadLink(doc.id)} 
                        className="download-button"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default InterviewCheatsheet;