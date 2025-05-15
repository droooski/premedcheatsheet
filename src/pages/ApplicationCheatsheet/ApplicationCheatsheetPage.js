// src/pages/ApplicationCheatsheet/ApplicationCheatsheetPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import GoogleDocEmbed from '../../components/GoogleDocEmbed/GoogleDocEmbed';
import './ApplicationCheatsheetPage.scss';

// Import local preview images
import file1Preview from '../../assets/images/File1.png';
import file2Preview from '../../assets/images/File2.png';
import file3Preview from '../../assets/images/File3.png';
import file4Preview from '../../assets/images/File4.png';

const ApplicationCheatsheetPage = () => {
  const [expandedDoc, setExpandedDoc] = useState(null);
  const navigate = useNavigate();

  // Collection of Google Doc resources with their actual IDs from your links
  const documents = [
    {
      id: '1KcAa5d05lxioTnne3551QmRwLYdzT8ZT',
      title: 'Premed Cheatsheet: Crafting Your Personal Statement',
      description: 'Learn how to craft a compelling personal statement that showcases your unique story and motivation for medicine.',
      previewImage: null // This one doesn't need preview as it's the featured document
    },
    {
      id: '1UPGlV5VJL4Bx_Y7K9GTl4JfBv4OgGmVB',
      title: 'Premed Cheatsheet: Crafting Your Activity Descriptions',
      description: 'Tips and templates for writing impactful activity descriptions that highlight your accomplishments and skills.',
      previewImage: file1Preview
    },
    {
      id: '1JgzI5edmE8p0LYxAqdwiHPuASQ9MgNjA',
      title: 'Premed Cheatsheet: Editing, Streamlined',
      description: 'Learn efficient editing techniques to polish your application materials to perfection.',
      previewImage: file2Preview
    },
    {
      id: '1Td6lS6cj0N2OR6g7oFit2LObcqvIupHs',
      title: 'Premed Cheatsheet: Recommended Writing Resources',
      description: 'Curated list of books, articles, and tools to help improve your writing skills for medical school applications.',
      previewImage: file3Preview
    },
    {
      id: '1QQVT6VCbNCkGuLVoB961ix9AkJ4VNyH8',
      title: 'Premed Cheatsheet: Requesting Strong Letters of Recommendation',
      description: 'Professional templates and strategies for securing compelling letters of recommendation from professors and mentors.',
      previewImage: file4Preview
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
    <div className="application-cheatsheet-page">
      <Navbar />
      
      <div className="cheatsheet-content">
        <div className="container">
          <div className="header-container">
            <h1 className="page-title">Application Cheatsheet</h1>
            <p className="page-subtitle">Feel free to copy and paste any templates!</p>
          </div>

          {/* Featured document - first one in fullscreen mode */}
          <div className="featured-document">
            <h2 className="section-title">Premed Cheatsheet: Crafting Your Personal Statement</h2>
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
          <h2 className="section-title">Additional Application Resources</h2>
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

export default ApplicationCheatsheetPage;