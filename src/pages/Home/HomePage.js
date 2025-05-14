// Here's how to update your HomePage.js file
// Copy this entire code and replace your current HomePage.js file

// src/pages/Home/HomePage.js
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import Hero from '../../components/sections/Hero/Hero';
import Roadmap from '../../components/sections/Roadmap/Roadmap';
import MedSchoolCode from '../../components/sections/MedSchoolCode/MedSchoolCode';
import AllInOne from '../../components/sections/AllInOne/AllInOne';
import Testimonials from '../../components/sections/Testimonials/Testimonials'; // Import the new Testimonials component
import Features from '../../components/sections/Features/Features';
import Faq from '../../components/sections/Faq/Faq';
import Cta from '../../components/sections/Cta/Cta';

import './HomePage.scss';

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <Roadmap />
      <MedSchoolCode />
      <AllInOne />
      <Testimonials /> {/* Add the Testimonials component here, after AllInOne */}
      <Features />
      <Faq />
      <Cta />
      <Footer />
    </div>
  );
};

export default HomePage;