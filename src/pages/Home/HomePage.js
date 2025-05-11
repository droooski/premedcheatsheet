// src/pages/Home/HomePage.js
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import Hero from '../../components/sections/Hero/Hero';
import Roadmap from '../../components/sections/Roadmap/Roadmap';
import MedSchoolCode from '../../components/sections/MedSchoolCode/MedSchoolCode';
import AllInOne from '../../components/sections/AllInOne/AllInOne';
import Features from '../../components/sections/Features/Features';
import Faq from '../../components/sections/Faq/Faq';
import Cta from '../../components/sections/Cta/Cta'; // Import the standalone Cta component

import './HomePage.scss';

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <Roadmap />
      <MedSchoolCode />
      <AllInOne />
      <Features />
      <Faq />
      <Cta /> {/* Using the standalone Cta component */}
      <Footer />
    </div>
  );
};

export default HomePage;