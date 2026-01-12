// src/components/sections/Faq/Faq.js
import React, { useState } from "react";
import "./Faq.scss";

// Internal FaqItem component
const FaqItem = ({ question, answer, isExpanded, toggleExpand }) => {
  return (
    <div className={`faq-item ${isExpanded ? "expanded" : ""}`}>
      <div className="faq-question" onClick={toggleExpand}>
        <h3>{question}</h3>
        <div className="arrow-icon">
          <svg
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L7 7L13 1"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="faq-answer">
        <p>{answer}</p>
      </div>
    </div>
  );
};

// Main FAQ Component
const Faq = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "Why do I need the Premed Profiles?",
      answer:
        "The Premed Profiles can give you inspiration on what extracurriculars to do to get into medical school. It will also help you evaluate which medical school you fit in with the best.",
    },
    {
      question: "What makes this different from Reddit or SDN forums?",
      answer:
        "These forums only have 10-20 responses a year, whereas our database already gives you access to over 50 applications with 25 added each month. Forums are also biased because only a certain type of student likes to write about their stats online.",
    },
    {
      question: "Isn't this toxic?",
      answer:
        "No! We hope these applicant profiles give you inspiration on how to craft your own applications. This is solely a database to help applicants, not to say which applicant is better than another.",
    },
    {
      question: "Got any trials?",
      answer:
        "We offer a limited preview of our database. Sign up to access sample profiles and see the value before committing to a subscription.",
    },
  ];

  return (
    <section className="faq">
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
    </section>
  );
};

export default Faq;
