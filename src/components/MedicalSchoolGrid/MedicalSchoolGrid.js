// src/components/MedicalSchoolGrid/MedicalSchoolGrid.js - Updated with comprehensive school list
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicalSchoolGrid.scss';

const MedicalSchoolGrid = ({ schools, searchQuery }) => {
  const navigate = useNavigate();
  /*
  // Complete school images mapping - updated with all schools from the applicant profiles
  const schoolImages = {
    // Original schools
    'Albert Einstein College of Medicine': 'https://images.squarespace-cdn.com/content/v1/6797e072b9ef964e6416c4b8/2f8c7797-24e5-4bfe-9d41-2795109c96fc/einsteinpricecenter-blockpavilion1_resize.jpg?format=2500w',
    'A.T. Still University': 'https://images.squarespace-cdn.com/content/v1/6797e072b9ef964e6416c4b8/8b5e099d-c9bc-4a99-9224-2facdccbe9db/ATSU-SOMA-entrance-600x400.jpg?format=2500w',
    'Brown University': 'https://media.tacdn.com/media/attractions-splice-spp-674x446/13/2c/54/54.jpg',
    'Chicago College of Osteopathic Medicine': 'https://www.midwestern.edu/media/carousels/il-campus-carousel/main-campus-entrance-evening-2.jpg',
    'Cleveland Clinic': 'https://www.prospectivedoctor.com/wp-content/uploads/2020/03/Cleveland-Clinic-Lerner-College-of-Medicine-Cleveland-Ohio.jpg',
    'Cornell': 'https://www.cornell.edu/about/img/main-Tower1.Still001-720x.jpg',
    'Columbia University': 'https://www.engineering.columbia.edu/sites/default/files/2024-03/7cwUcdpUayQ-HD.jpg',
    'Cooper/rowan Medical School': 'https://www.cooperhealth.org/sites/default/files/buildings/2017-11/med-school.jpg',
    'Dartmouth': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoReqVBLLHnrpAEaLOkCwTEjM3HBuDjVN9FO4bUt0xCgMhVLsQ0T7aZq1MmAXnUO0cePLIlftV38vg2WFqN6JG7RF__7aSWWDW94ZP5gdiNKlyBXSyVXXOWgVrijLNxFvRd52x6oAPZQsq/s1600/Dartmouth.jpg',
    'Duke University': 'https://medschool.duke.edu/sites/default/files/styles/max_1300x1300_x2/public/2022-01/DAVISON%20BLDG%20%28002%29.jpg',
    'Emory University': 'https://bunny-wp-pullzone-cjamrcljf0.b-cdn.net/wp-content/uploads/2021/02/candler_library_emory_university_001.jpg',
    'Georgetown University': 'https://som.georgetown.edu/wp-content/uploads/2015/01/GUMC.jpg',
    'Harvard': 'https://hms.harvard.edu/sites/default/files/image/buildings.jpg',
    'Johns Hopkins': 'https://www.hopkinsmedicine.org/sebin/s/x/Johns%20Hopkins%20Medicine%20Campus%20(2)%20Dome.jpg',
    'Mayo Clinic': 'https://cdn.britannica.com/10/244710-050-966C268E/Mayo-Clinic-Rochester-Minnesota-2020.jpg',
    'New York Medical College': 'https://thecustodianus.com/wp-content/uploads/2023/04/New-York-Medical-College-1.jpeg',
    'Northwestern University': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'Ohio State University': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npPBF-msWjzIzSl_gtCBgwdqyafVB8WC8GPOIjxuEAFtuICYBBBmDWXJDcde1heqIaMAeBk-16XY6tGlz5aEi5I4zWWpL-egKGk4HtsE4ZcrWkjHNtJmk7WBbLd6VLcqflXnlFPwQ=s1360-w1360-h1020-rw',
    'University of Michigan': 'https://images.shiksha.com/mediadata/images/1532951415phpyJx0mH_g.jpg',
    'University of Pennsylvania': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/9e/f1/7d/may-30-2022-old-main.jpg?w=1400&h=-1&s=1',
    'UCSF': 'https://www.ucsf.edu/sites/default/files/styles/2014_article_feature/public/2022-03/UCSF-Parnassus-Heights-buildings-2021-JP.jpg',
    'Stanford': 'https://medicine.stanford.edu/content/dam/sm-news/images/2018/01/building_old.jpg',
    'University of Washington': 'https://www.uwmedicine.org/sites/default/files/styles/media_hero_detail_1x/public/media/images/2021-04-01/Muilenburg-Tower-Spring-Blooms.jpg',
    'Vanderbilt': 'https://law.vanderbilt.edu/wp-content/uploads/sites/281/2025/05/04413dcb69a7bfe2ad51402bbd5fe69e-1200x900-c-default.png',
    'Washington University': 'https://medicine.wustl.edu/wp-content/uploads/WUSM_Aerial-View-of-Medical-Campus-min.jpg',
    'Yale': 'https://medicine.yale.edu/news-article/yale-school-of-medicine-establishes-center-for-cannabis-research-in-behavioral-health/YSM%20Cedar%20Street%202022_400128_5_v3.jpg',
    'Mount Sinai': 'https://images.shiksha.com/mediadata/images/1540557666php4bzbzD.jpeg',
    'University of Pittsburgh': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/CathedralfromFrick.jpg',
    'CCOM': 'https://www.drnajeeblectures.com/wp-content/uploads/2020/04/page12mwuglendalecampus-e1586548693116.jpg',
    'Chicago College of Osteopathic Medicine (CCOM)': 'https://www.drnajeeblectures.com/wp-content/uploads/2020/04/page12mwuglendalecampus-e1586548693116.jpg',
    'Case Western': 'https://www.thoughtco.com/thmb/-ViQ27niExYcDtzC0HM9bZzfdl0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/CoverPhoto-57124afc5f9b588cc2d735e2.JPG',
    
    // Additional schools from the applicant profiles
    'TouroCOM': 'https://www.studentdoctor.net/schools/assets/images/schools/TUCOM-MID.jpg?v=2022-06-08%2014:44:26',
    'PCOM': 'https://www.pcom.edu/_resources/images/history/2022-updates/pcom-expansion-01.jpg',
    'Feinberg School of Medicine': 'https://www.feinberg.northwestern.edu/gfx/ward-campus-550x310.jpg',
    'University of Virginia': 'https://www.appily.com/sites/default/files/styles/max_1200/public/images/hero/college/234076_hero.jpg?itok=UyfeftUE',
    'University of Rochester': 'https://wun.ac.uk/wp-content/uploads/university_rochester.jpg',
    'University of North Carolina': 'https://www.unc.edu/wp-content/uploads/2021/07/020419_old_well_summer004-scaled-e1625573140177.jpg',
    'Wake Forest University School of Medicine': 'https://media.bizj.us/view/img/12397779/img3191*900xx4032-2265-0-397.jpg',
    'UMass': 'https://assets.collegedunia.com/public/college_data/images/studyabroad/appImage/72148%20cover.jpg',
    'Boston U': 'https://www.bostonherald.com/wp-content/uploads/2022/05/bums003.jpg?w=978',
    'USC': 'https://images.shiksha.com/mediadata/images/1533291664phpRX4fuL.jpeg',
    'SUNY Downstate': 'https://www.gilbaneco.com/wp-content/uploads/2014/11/5187_SUNY-Downstate-New-Acad-Public-Health_01.jpg',
    'NYMC': 'https://www.nymc.edu/media/schools-and-colleges/nymc/img/news-and-events/BSB2.jpg',
    'UVA': 'https://www.appily.com/sites/default/files/styles/max_2400/public/images/hero/college/234076_hero.jpg?itok=5OgE0ke5',
    'Ohio State': 'https://wexnermedical.osu.edu/-/media/images/wexnermedical/about-us/newsroom/our-new-hospital/new-hospital-tower-rendering.jpg',
    'Mayo Clinic Alix School of Medicine': 'https://pxl-mayoedu.terminalfour.net/fit-in/720x480/filters:quality(75)/0x0:720x480/prod01/channel_2/media/mccms/content-assets/academics/residencies-and-fellowships/mayo-clinic-minnesota-MEYR6203-card.jpg',
    'Northwestern Feinberg': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'Wake Forest': 'https://school.wakehealth.edu/-/media/WakeForest/School/Images/Buildings/Innovation-Quarter-Aerial-View-with-Buildings-Labeled-2022.jpg',
    'AT Stills': 'https://i.ytimg.com/vi/Wk2Zq6gUADo/maxresdefault.jpg',
    'DMUCOM': 'https://www.dmu.edu/wp-content/uploads/2024/08/DMU-default-featured-social.jpg',
    'Des Moines University College Of Osteopathic Medicine': 'https://www.dmu.edu/wp-content/uploads/2024/08/DMU-default-featured-social.jpg',
    'MCW': 'https://www.mcw.edu/-/media/MCW/Image-Library/Aerial5_Intro-with-Three-Image-CTA-Component.jpg?w=1000&h=412&mode=crop&anchor=middlecenter&scale=both',
    'Medical College Of Wisconsin': 'https://www.mcw.edu/-/media/MCW/Image-Library/Aerial5_Intro-with-Three-Image-CTA-Component.jpg?w=1000&h=412&mode=crop&anchor=middlecenter&scale=both',
    'SLU': 'https://www.slu.edu/_ldp-images/.private_ldp/a337/production/master/6fa3119e-b9a8-4c79-a4c6-6b549bfccc41.jpg',
    'UT Southwestern': 'https://www.utsouthwestern.edu/newsroom/articles/year-2021/assets/cuh-exterior-landscapes.jpg',
    'USUHS': 'https://ohmyfacts.com/wp-content/uploads/2025/01/28-facts-about-uniformed-services-university-of-the-health-sciences-1737627171.jpg',
    'WashU': 'https://www.ivyscholars.com/wp-content/uploads/2022/04/danforth-aerial-768x473.jpeg',
    'RWJMS': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nr8vFP0OLiOECrCeA_eXqhToFN8qhxv7AiuxW8BhAB5Z2XlcFnZgdlY9F_O0RxPrloRYgdwIMhRYwaecX1HAXFG_u_om7jH7I-6lMlZU4Qr5weTPjL1eodEFFlPZ9ZeaUdsLlbHNQ=s1360-w1360-h1020-rw',
    'Quinipiac': 'https://www.appily.com/sites/default/files/styles/max_2400/public/images/hero/college/130226_hero.jpg?itok=wUYAXYTb',
    'Perelman': 'https://www.med.upenn.edu/psom/assets/image-cache/user-content/images/7.15.19%20Ben%20Franklin.83e224a8.webP',
    'UMiami': 'https://welcome.miami.edu/_assets/images/student-life/SAC_new_cmyk-1240x550.jpg',
    'Wayne State': 'https://publicagenda.org/wp-content/uploads/Wayne-State-Image-5_Resized-1024x683.jpg',
    'NSUMD': 'https://keystoneacademic-res.cloudinary.com/image/upload/c_fill,w_1920,h_636,g_auto/dpr_auto/f_auto/q_auto/v1/element/14/144548_Cover.jpg',
    'NYITCOM': 'https://www.prospectivedoctor.com/wp-content/uploads/2017/07/NYITCOM.jpg',
    'TOUROCOM': 'https://tourocom.touro.edu/media/schools-and-colleges/tourocop/news-and-events/middletown-from-a-distance.jpg',
    'LECOM': 'https://lecom.edu/content/uploads/2022/05/lecom-hero-image-header-erie-pa.jpg',
    'Oakland School of Medicine': 'https://www.oakland.edu/Assets/Oakland/med/graphics/Headers/School-of-Medicine/3-Header-Ouwb-O-Riordan-Hall-02-11.jpg',
    'Case': 'https://case.edu/medicine/sites/case.edu.medicine/files/styles/subfeature_705x528/public/2019-08/som-building.jpg',
    'Pitt': 'https://www.medschool.pitt.edu/sites/default/files/styles/crop_header_large/public/2021-03/scaife-hall-crop-2.jpg',
    'Pittsburgh': 'https://www.medschool.pitt.edu/sites/default/files/styles/crop_header_large/public/2021-03/scaife-hall-crop-2.jpg',
    'UWSMPH': 'https://www.drnajeeblectures.com/wp-content/uploads/2019/12/sssssss-e1577455387941.jpg',
    'Nyu' : 'https://meet.nyu.edu/wp-content/uploads/2019/10/nyu.jpg',
    
    // Common abbreviations and alternate spellings
    'Feinberg': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'Weill Cornell': 'https://med.weill.cornell.edu/sites/default/files/styles/journal_abstract_image/public/wmc_bt_1.jpg',
    'Penn': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/9e/f1/7d/may-30-2022-old-main.jpg?w=1400&h=-1&s=1',
    'UNC': 'https://www.med.unc.edu/wp-content/uploads/2019/06/unc-medicine-sign-aerial.jpg',
    'Michigan': 'https://medicine.umich.edu/sites/default/files/styles/large/public/2021-05/UM%20North_01.jpg',

    //newly added schools
    'Kaiser Permanente': 'https://images.squarespace-cdn.com/content/v1/5269fbd3e4b0eb2b76ccc1db/bcc4227b-4bb6-4999-b70e-44999c491c01/kaiser-permanente-medical-school_REV.jpg',
    'Keck School Of Medicine': 'https://keck.usc.edu/medical-education/wp-content/uploads/sites/18/2023/08/KSOM-Quad-IMG_4097-web.jpg',
    'Lake Erie College Of Osteopathic Medicine': 'https://lecom.edu/content/uploads/2022/05/lecom-hero-image-header-erie-pa.jpg',
    'Medical University Of South Carolina': 'https://web.musc.edu/-/media/images/social/icons/enterprise.jpg',
    'New York Institute Of Technology College Of Osteopathic Medicine': 'https://www.prospectivedoctor.com/wp-content/uploads/2017/07/NYITCOM.jpg',
    'Nova Southeastern University Md': 'https://www.nova.edu/patelgift/images/tbrc-rendering.jpg',
    'Oakland University William Beaumont School Of Medicine': 'https://oaklandpostonline.com/wp-content/uploads/2021/09/DSC_8615.jpg',
    'Renaissance School Of Medicine At Stony Brook University': 'https://renaissance.stonybrookmedicine.edu/sites/default/files/Stony%20HDR%20%281%29mobile_1240.jpg',
    'Rutgers New Jersey Medical School': 'https://njms.rutgers.edu/departments/medicine/images/hhospitalfromdoc.jpg',
    'Rutgers Robert Wood Johnson Medical School': 'https://www.mgedpc.net/wp-content/uploads/2022/01/RWJ-School-Public-Health-15-1030x584.jpg',
    'Saint Louis University': 'https://www.slu.edu/_ldp-images/.private_ldp/a337/production/master/242d174a-9ca9-4b75-b415-27ec75aa33ad.jpeg',
    'Sidney Kimmel Medical College At Thomas Jefferson University': 'https://www.healthcareitnews.com/sites/hitn/files/092622%20HIMSS%20Davies%20Jefferson%20Health%201200.jpg',
    'Uc Davis': 'https://health.ucdavis.edu/media-resources/welcome/images/Cards/health-home-cards-awards.jpg',
    'Ucsf': 'https://www.ucsf.edu/sites/default/files/fields/field_insert_file/news/ucsf-fresno_0.jpg',
    'Uniformed Services University': 'https://ohmyfacts.com/wp-content/uploads/2025/01/28-facts-about-uniformed-services-university-of-the-health-sciences-1737627171.jpg',
    'University Of Massachusetts': 'https://assets.collegedunia.com/public/college_data/images/studyabroad/appImage/72148%20cover.jpg',
    'University Of Miami Miller School Of Medicine': 'https://southfloridahospitalnews.com/wp-content/uploads/2023/03/Aerial-view-of-Leon-J-Simkins-Research-Tower_Email.png',
    'University Of Southern California': 'https://images.shiksha.com/mediadata/images/1533291664phpRX4fuL.jpeg',
    'University Of Wisconsin School Of Medicine And Public Health': 'https://www.drnajeeblectures.com/wp-content/uploads/2019/12/sssssss-e1577455387941.jpg',
    'Washington University School Of Medicine': 'https://www.mccarthy.com/sites/default/files/styles/open_graph/public/2024-09/WUSM-23330-FINAL-DESKTOP.jpg?h=9782657d&itok=lFg-hQDX',
    'Yale School Of Medicine': 'https://res.cloudinary.com/ysm/image/upload/yms/prod/e9f06bd3-4395-4aa9-ab62-f3e72eab722f',
  };
  */
  // Get image URL for a school or use a placeholder
  const getSchoolImageUrl = (school) => {
    
    //use customImageURL if its available
    if (school?.customImageUrl) {
    
      return school.customImageUrl;
    }

    //if no custom, check for imageURL
    if (school?.imageUrl) {
     
      return school.imageUrl;
    }

    // fallback imageURL
    console.warn('❌ No imageUrl found, using placeholder for:', school?.name);
    return "https://via.placeholder.com/400x300?text=Medical+School";
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
          {/* <p className="profile-count">{school.count || 0} Accepted {school.count === 1 ? 'Profile' : 'Profiles'}</p> */}
        </div>
      ))}
    </div>
  );
};

export default MedicalSchoolGrid;