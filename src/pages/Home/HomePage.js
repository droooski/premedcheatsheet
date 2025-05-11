import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import Hero from '../../components/sections/Hero/Hero';
import Roadmap from '../../components/sections/Roadmap/Roadmap';
import MedSchoolCode from '../../components/sections/MedSchoolCode/MedSchoolCode';
import AllInOne from '../../components/sections/AllInOne/AllInOne';
import Features from '../../components/sections/Features/Features';
import FaqItem from '../../components/sections/FaqItem/FaqItem';
import './HomePage.scss';

const FaqSection = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "Why do I need the Premed Cheatsheet?",
      answer: "Our database provides valuable insights from successful applicants who made it to medical school, helping you understand acceptance patterns and strategies that actually work."
    },
    {
      question: "What makes this different from Reddit or SDN forums?",
      answer: "Unlike forums with scattered advice, we provide structured, verified data from accepted students with complete profiles including GPA, MCAT scores, and experiences."
    },
    {
      question: "Got any trials?",
      answer: "We offer a limited preview of our database. Sign up to access sample profiles and see the value before committing to a subscription."
    }
  ];

  return (
    <section className="faq">
      <div className="container">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-items">
          {faqItems.map((faq, index) => (
            <FaqItem 
              key={index} 
              question={faq.question}
              answer={faq.answer}
              isExpanded={expandedFaq === index}
              toggleExpand={() => toggleFaq(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const CtaSection = () => {
  const navigate = useNavigate();

  const navigateToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <section className="cta">
      <div className="container">
        <h2>Ready to start your journey?</h2>
        <p>Join for access to exclusive content including video consultations with those who've been accepted.</p>
        <button className="cta-button" onClick={navigateToCheckout}>
          Access The Full Story Now
        </button>
      </div>
    </section>
  );
};

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <Roadmap />
      <MedSchoolCode />
      <AllInOne />
      <Features />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default HomePage;