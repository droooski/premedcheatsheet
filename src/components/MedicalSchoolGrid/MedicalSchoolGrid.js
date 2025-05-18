// src/components/MedicalSchoolGrid/MedicalSchoolGrid.js - Updated with comprehensive school list
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicalSchoolGrid.scss';

const MedicalSchoolGrid = ({ schools, searchQuery }) => {
  const navigate = useNavigate();

  // Complete school images mapping - updated with all schools from the applicant profiles
  const schoolImages = {
    // Original schools
    'Albert Einstein College of Medicine': 'https://images.squarespace-cdn.com/content/v1/6797e072b9ef964e6416c4b8/2f8c7797-24e5-4bfe-9d41-2795109c96fc/einsteinpricecenter-blockpavilion1_resize.jpg?format=2500w',
    'A.T. Still University': 'https://images.squarespace-cdn.com/content/v1/6797e072b9ef964e6416c4b8/8b5e099d-c9bc-4a99-9224-2facdccbe9db/ATSU-SOMA-entrance-600x400.jpg?format=2500w',
    'Boston University': 'https://www.bu.edu/files/2020/03/social-bumc-aerial-1200x630.jpg',
    'Brown University': 'https://www.brown.edu/sites/default/files/styles/wide_med/public/2022-08/Warren-Alpert-Medical-School-evening_0.jpg',
    'Chicago College of Osteopathic Medicine': 'https://www.midwestern.edu/media/carousels/il-campus-carousel/main-campus-entrance-evening-2.jpg',
    'Cleveland Clinic': 'https://my.clevelandclinic.org/-/scassets/images/org/locations/regional-hospitals/ccf-main-campus.jpg',
    'Columbia': 'https://www.ps.columbia.edu/sites/default/files/styles/16_9_760w_425h/public/2018-08/Roy_and_Diana_Vagelos_Education_Center.jpg',
    'Cornell': 'https://med.weill.cornell.edu/sites/default/files/styles/journal_abstract_image/public/wmc_bt_1.jpg',
    'Dartmouth': 'https://geiselmed.dartmouth.edu/communications/wp-content/uploads/sites/3/2013/09/DMS.jpg',
    'Duke University': 'https://medschool.duke.edu/sites/default/files/styles/max_1300x1300_x2/public/2022-01/DAVISON%20BLDG%20%28002%29.jpg',
    'Emory University': 'https://www.emory.edu/home/assets/carousel-main/slide-7-som-gates.jpg',
    'Georgetown University': 'https://som.georgetown.edu/wp-content/uploads/2015/01/GUMC.jpg',
    'Harvard': 'https://hms.harvard.edu/sites/default/files/image/buildings.jpg',
    'Johns Hopkins': 'https://www.hopkinsmedicine.org/sebin/s/x/Johns%20Hopkins%20Medicine%20Campus%20(2)%20Dome.jpg',
    'Mayo Clinic': 'https://college.mayo.edu/media/mccms/content-assets/academics/school-of-medicine/md-program/about/mayo-clinic-school-of-medicine-campus-1375x775-02.jpg',
    'New York Medical College': 'https://thecustodianus.com/wp-content/uploads/2023/04/New-York-Medical-College-1.jpeg',
    'Northwestern University': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'Ohio State University': 'https://wexnermedical.osu.edu/-/media/images/wexnermedical/about-us/newsroom/our-new-hospital/new-hospital-tower-rendering.jpg',
    'University of Michigan': 'https://medicine.umich.edu/sites/default/files/styles/large/public/2021-05/UM%20North_01.jpg',
    'University of Pennsylvania': 'https://www.med.upenn.edu/psom/images/psom_main.jpg',
    'UCSF': 'https://www.ucsf.edu/sites/default/files/styles/2014_article_feature/public/2022-03/UCSF-Parnassus-Heights-buildings-2021-JP.jpg',
    'Stanford': 'https://medicine.stanford.edu/content/dam/sm-news/images/2018/01/building_old.jpg',
    'University of Washington': 'https://www.uwmedicine.org/sites/default/files/styles/media_hero_detail_1x/public/media/images/2021-04-01/Muilenburg-Tower-Spring-Blooms.jpg',
    'Vanderbilt': 'https://www.vumc.org/departments/sites/default/files/styles/general_hero_image/public/general-article-images/Vanderbilt%20Medical%20Center%20South.jpg',
    'Washington University': 'https://medicine.wustl.edu/wp-content/uploads/WUSM_Aerial-View-of-Medical-Campus-min.jpg',
    'Yale': 'https://medicine.yale.edu/news-article/yale-school-of-medicine-establishes-center-for-cannabis-research-in-behavioral-health/YSM%20Cedar%20Street%202022_400128_5_v3.jpg',
    'Mount Sinai': 'https://icahn.mssm.edu/files/ISMMS/Assets/About%20the%20School/HankLuisGardiner-2016-004.jpg',
    'University of Pittsburgh': 'https://www.medschool.pitt.edu/sites/default/files/styles/crop_header_large/public/2021-03/scaife-hall-crop-2.jpg',
    'CCOM': 'https://www.midwestern.edu/media/carousels/il-campus-carousel/main-campus-entrance-evening-2.jpg',
    'Case Western': 'https://case.edu/medicine/sites/case.edu.medicine/files/styles/subfeature_705x528/public/2019-08/som-building.jpg',
    
    // Additional schools from the applicant profiles
    'TouroCOM': 'https://tourocom.touro.edu/media/schools-and-colleges/tourocop/news-and-events/middletown-from-a-distance.jpg',
    'PCOM': 'https://www.pcom.edu/about/campuses/philadelphia/images/campus-philadelphia-main-building.jpg',
    'Feinberg School of Medicine': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'University of Virginia': 'https://medicine.virginia.edu/wp-content/uploads/sites/285/2022/06/School-of-medicine.jpg',
    'University of Rochester': 'https://www.urmc.rochester.edu/MediaLibraries/URMCMedia/education/md/admissions/images/school-of-medicine-and-dentistry.jpg',
    'University of North Carolina': 'https://www.med.unc.edu/wp-content/uploads/2019/06/unc-medicine-sign-aerial.jpg',
    'Wake Forest University School of Medicine': 'https://school.wakehealth.edu/-/media/WakeForest/School/Images/Buildings/Innovation-Quarter-Aerial-View-with-Buildings-Labeled-2022.jpg',
    'UMass': 'https://www.umassmed.edu/globalassets/umass-medical-school/style-assets/images/umw-web-home-umass-chan-exterior.jpg',
    'Boston U': 'https://www.bu.edu/files/2020/03/social-bumc-aerial-1200x630.jpg',
    'USC': 'https://keck.usc.edu/wp-content/uploads/2021/04/Healthcare-Center-4-1024x576.jpg',
    'SUNY Downstate': 'https://www.downstate.edu/images/shared/clarkson-entrance.png',
    'NYMC': 'https://www.nymc.edu/media/schools-and-colleges/nymc/img/news-and-events/BSB2.jpg',
    'UVA': 'https://medicine.virginia.edu/wp-content/uploads/sites/285/2022/06/School-of-medicine.jpg',
    'Ohio State': 'https://wexnermedical.osu.edu/-/media/images/wexnermedical/about-us/newsroom/our-new-hospital/new-hospital-tower-rendering.jpg',
    'Mayo Clinic Alix School of Medicine': 'https://college.mayo.edu/media/mccms/content-assets/academics/school-of-medicine/md-program/about/mayo-clinic-school-of-medicine-campus-1375x775-02.jpg',
    'Northwestern Feinberg': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'Wake Forest': 'https://school.wakehealth.edu/-/media/WakeForest/School/Images/Buildings/Innovation-Quarter-Aerial-View-with-Buildings-Labeled-2022.jpg',
    'AT Stills': 'https://www.atsu.edu/sites/default/files/styles/panopoly_image_original/public/2020-05/MesaSignMay2020.jpg',
    'DMUCOM': 'https://www.dmu.edu/wp-content/uploads/2021/06/DMU-New-campus-header-final-06.21.jpg',
    'MCW': 'https://www.mcw.edu/-/media/MCW/Departments/Anesthesiology/MCW-Campus.jpg',
    'SLU': 'https://www.slu.edu/medicine/images/education/campus-school-of-medicine.jpg',
    'UT Southwestern': 'https://www.utsouthwestern.edu/about-us/administrative-offices/university-police/images/UT-Southwestern-William-P.-Clements-Jr.-University-Hospital-and-Medical-School.jpg',
    'USUHS': 'https://www.usuhs.edu/sites/default/files/2020-06/building-new_0.png',
    'And Usuhs': 'https://money-assets.money.com/mcp/2024/243744.jpg',
    'WashU': 'https://medicine.wustl.edu/wp-content/uploads/WUSM_Aerial-View-of-Medical-Campus-min.jpg',
    'RWJMS': 'https://rwjms.rutgers.edu/images/default-source/home/robert-wood-johnson-medical-school-front.jpg',
    'Quinipiac': 'https://www.qu.edu/499098/globalassets/global/secondary-audiences/school/medicine/medicine-campus-aerial.jpg',
    'Perelman': 'https://www.med.upenn.edu/psom/images/psom_main.jpg',
    'UMiami': 'https://med.miami.edu/wp-content/uploads/2023/07/UMH_at_Coral_Gables.jpg',
    'Wayne State University School Of Medicine': 'https://today.wayne.edu/medicine/files/2018/11/school-of-medicine-900x500.jpg',
    'Wayne State School of Medicine': 'https://today.wayne.edu/medicine/files/2018/11/school-of-medicine-900x500.jpg',
    'NSUMD': 'https://www.nova.edu/about/university-news/2019/images/tampa-bay-regional-campus-ribbon-cutting-main.jpg',
    'NYITCOM': 'https://www.nyit.edu/files/communications_and_marketing/CM_Website_NYITCOM-OSP_1920x1093.jpg',
    'TOUROCOM': 'https://tourocom.touro.edu/media/schools-and-colleges/tourocop/news-and-events/middletown-from-a-distance.jpg',
    'LECOM': 'https://lecom.edu/content/uploads/2020/05/LECOM-Elmwood-Slider-June-2022.jpg',
    'Oakland School of Medicine': 'https://www.oakland.edu/Assets/Oakland/med/graphics/Headers/School-of-Medicine/3-Header-Ouwb-O-Riordan-Hall-02-11.jpg',
    'Case': 'https://case.edu/medicine/sites/case.edu.medicine/files/styles/subfeature_705x528/public/2019-08/som-building.jpg',
    'Pitt': 'https://www.medschool.pitt.edu/sites/default/files/styles/crop_header_large/public/2021-03/scaife-hall-crop-2.jpg',
    'Pittsburgh': 'https://www.medschool.pitt.edu/sites/default/files/styles/crop_header_large/public/2021-03/scaife-hall-crop-2.jpg',
    'And Mount Sinai': 'https://icahn.mssm.edu/files/ISMMS/Assets/About/Contacts-Directions/ISMMS-ContactDirections-IcahnBuilding-Carousel-768x307-v3.jpg',
    'UWSMPH': 'https://www.med.wisc.edu/media/_sizes/images/news-events/buildings/front-entrance-smph-h-426-960-c-90-q-81-1000x563.jpg',
    
    // Common abbreviations and alternate spellings
    'Feinberg': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'Weill Cornell': 'https://med.weill.cornell.edu/sites/default/files/styles/journal_abstract_image/public/wmc_bt_1.jpg',
    'Penn': 'https://www.med.upenn.edu/psom/images/psom_main.jpg',
    'UNC': 'https://www.med.unc.edu/wp-content/uploads/2019/06/unc-medicine-sign-aerial.jpg',
    'Michigan': 'https://medicine.umich.edu/sites/default/files/styles/large/public/2021-05/UM%20North_01.jpg'
  };

  // Get image URL for a school or use a placeholder
  const getSchoolImageUrl = (school) => {
    // First try exact match
    if (schoolImages[school.name]) {
      return schoolImages[school.name];
    }
    
    // Try to find a partial match
    const partialMatch = Object.keys(schoolImages).find(key => 
      school.name.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(school.name.toLowerCase())
    );
    
    if (partialMatch) {
      return schoolImages[partialMatch];
    }
    
    // Return a placeholder if no match is found
    return 'https://via.placeholder.com/400x300?text=Medical+School';
  };

  // Handle clicking on a school card
  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  // Check if there are no schools matching the search
  if (schools.length === 0) {
    return (
      <div className="no-results">
        <p>No medical schools found matching "{searchQuery}"</p>
        <button onClick={() => window.location.reload()}>Clear Search</button>
      </div>
    );
  }

  return (
    <div className="medical-schools-grid">
      {schools.map(school => (
        <div 
          key={school.id} 
          className="medical-school-card"
          onClick={() => handleSchoolClick(school.id)}
        >
          <div className="school-image-container">
            <img 
              src={getSchoolImageUrl(school)} 
              alt={school.name} 
              className="school-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
          </div>
          <h3 className="school-name">{school.name}</h3>
          <p className="profile-count">{school.count || 0} Accepted {school.count === 1 ? 'Profile' : 'Profiles'}</p>
        </div>
      ))}
    </div>
  );
};

export default MedicalSchoolGrid;