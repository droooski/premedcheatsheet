import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  updateDoc,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable 
} from 'firebase/storage';
import { onAuthChange } from '../../firebase/authService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/sections/Footer/Footer';
import { extractSchools, normalizeSchoolName } from '../../utils/profilesData';
import './AdminPanel.scss';

// Import the complete applicant profiles data
import applicantProfilesData from './applicant-profiles.json';

const AdminPanel = () => {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('applicants');
  const [applicants, setApplicants] = useState([]);
  const [schools, setSchools] = useState([]);
  const [products, setProducts] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  
  const navigate = useNavigate();
  
  // Firestore database and Storage
  const db = getFirestore();
  const storage = getStorage();

  // Authorized admin emails
  const ADMIN_EMAILS = [
    'staff@premedcheatsheet.com',
    'muratorigabriele1@gmail.com',
    'muratorigabriele5@gmail.com'
  ];

  // Form state for products
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    type: 'digital', // 'digital' or 'physical'
    category: 'cheatsheet', // 'cheatsheet', 'application', 'bundle'
    features: [''],
    file: null,
    fileName: '',
    fileUrl: '',
    isActive: true,
    sortOrder: 0
  });

  // Form state for applicants - Complete with all fields
  const [newApplicant, setNewApplicant] = useState({
    matriculationYear: '',
    stateOfResidency: '',
    gender: '',
    race: '',
    major: '',
    gpa: '',
    mcat: '',
    mcatBreakdown: '',
    medicalVolunteering: '',
    nonMedicalVolunteering: '',
    leadership: '',
    nonMedicalEmployment: '',
    medicalEmployment: '',
    shadowing: '',
    awardsHonors: '',
    research: '',
    hobbies: '',
    otherActivities: '',
    reflections: '',
    acceptedSchools: [''],
    gapYears: '',
    clinicalExperience: ''
  });

  // Generate next applicant ID
  const generateNextApplicantId = async () => {
    try {
      const applicantsSnapshot = await getDocs(collection(db, 'applicants'));
      const existingIds = applicantsSnapshot.docs.map(doc => doc.id);
      
      console.log('Existing IDs:', existingIds); // Debug log
      
      // Extract numbers from existing IDs and find the highest
      const existingNumbers = existingIds
        .filter(id => id.startsWith('applicant-'))
        .map(id => parseInt(id.replace('applicant-', '')))
        .filter(num => !isNaN(num));
      
      console.log('Existing numbers:', existingNumbers); // Debug log
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const newId = `applicant-${nextNumber}`;
      
      console.log('Generated new ID:', newId); // Debug log
      
      return newId;
    } catch (error) {
      console.error('Error generating ID:', error);
      // Fallback to timestamp-based ID
      return `applicant-${Date.now()}`;
    }
  };

  // Authentication check with proper admin restriction
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (currentUser) {
        // Check if user is authorized admin
        if (ADMIN_EMAILS.includes(currentUser.email)) {
          setUser(currentUser);
          setError('');
        } else {
          // User is authenticated but not authorized - redirect immediately
          navigate('/profile');
          return;
        }
      } else {
        // User is not authenticated - redirect to home
        navigate('/');
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // School images mapping from MedicalSchoolGrid
  const schoolImages = {
    'Albert Einstein College of Medicine': 'https://images.squarespace-cdn.com/content/v1/6797e072b9ef964e6416c4b8/2f8c7797-24e5-4bfe-9d41-2795109c96fc/einsteinpricecenter-blockpavilion1_resize.jpg?format=2500w',
    'A.T. Still University': 'https://images.squarespace-cdn.com/content/v1/6797e072b9ef964e6416c4b8/8b5e099d-c9bc-4a99-9224-2facdccbe9db/ATSU-SOMA-entrance-600x400.jpg?format=2500w',
    'Brown University': 'https://media.tacdn.com/media/attractions-splice-spp-674x446/13/2c/54/54.jpg',
    'Chicago College of Osteopathic Medicine (CCOM)': 'https://www.midwestern.edu/media/carousels/il-campus-carousel/main-campus-entrance-evening-2.jpg',
    'Cleveland Clinic Lerner College of Medicine': 'https://www.prospectivedoctor.com/wp-content/uploads/2020/03/Cleveland-Clinic-Lerner-College-of-Medicine-Cleveland-Ohio.jpg',
    'Cornell University': 'https://www.cornell.edu/about/img/main-Tower1.Still001-720x.jpg',
    'Columbia University': 'https://www.engineering.columbia.edu/sites/default/files/2024-03/7cwUcdpUayQ-HD.jpg',
    'Dartmouth College': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoReqVBLLHnrpAEaLOkCwTEjM3HBuDjVN9FO4bUt0xCgMhVLsQ0T7aZq1MmAXnUO0cePLIlftV38vg2WFqN6JG7RF__7aSWWDW94ZP5gdiNKlyBXSyVXXOWgVrijLNxFvRd52x6oAPZQsq/s1600/Dartmouth.jpg',
    'Duke University': 'https://medschool.duke.edu/sites/default/files/styles/max_1300x1300_x2/public/2022-01/DAVISON%20BLDG%20%28002%29.jpg',
    'Emory University': 'https://bunny-wp-pullzone-cjamrcljf0.b-cdn.net/wp-content/uploads/2021/02/candler_library_emory_university_001.jpg',
    'Harvard Medical School': 'https://hms.harvard.edu/sites/default/files/image/buildings.jpg',
    'Johns Hopkins University School of Medicine': 'https://www.hopkinsmedicine.org/sebin/s/x/Johns%20Hopkins%20Medicine%20Campus%20(2)%20Dome.jpg',
    'Mayo Clinic Alix School of Medicine': 'https://cdn.britannica.com/10/244710-050-966C268E/Mayo-Clinic-Rochester-Minnesota-2020.jpg',
    'New York Medical College': 'https://thecustodianus.com/wp-content/uploads/2023/04/New-York-Medical-College-1.jpeg',
    'Feinberg School of Medicine': 'https://www.feinberg.northwestern.edu/about/campus/facilities/buildings/images/simpson-querey-biomedical-research-center.jpg',
    'Ohio State University': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npPBF-msWjzIzSl_gtCBgwdqyafVB8WC8GPOIjxuEAFtuICYBBBmDWXJDcde1heqIaMAeBk-16XY6tGlz5aEi5I4zWWpL-egKGk4HtsE4ZcrWkjHNtJmk7WBbLd6VLcqflXnlFPwQ=s1360-w1360-h1020-rw',
    'University of Michigan': 'https://images.shiksha.com/mediadata/images/1532951415phpyJx0mH_g.jpg',
    'University of Pennsylvania': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/9e/f1/7d/may-30-2022-old-main.jpg?w=1400&h=-1&s=1',
    'University of California, San Francisco': 'https://www.ucsf.edu/sites/default/files/styles/2014_article_feature/public/2022-03/UCSF-Parnassus-Heights-buildings-2021-JP.jpg',
    'Stanford University School of Medicine': 'https://medicine.stanford.edu/content/dam/sm-news/images/2018/01/building_old.jpg',
    'Vanderbilt University School of Medicine': 'https://law.vanderbilt.edu/wp-content/uploads/sites/281/2025/05/04413dcb69a7bfe2ad51402bbd5fe69e-1200x900-c-default.png',
    'Washington University School of Medicine': 'https://medicine.wustl.edu/wp-content/uploads/WUSM_Aerial-View-of-Medical-Campus-min.jpg',
    'Yale School of Medicine': 'https://medicine.yale.edu/news-article/yale-school-of-medicine-establishes-center-for-cannabis-research-in-behavioral-health/YSM%20Cedar%20Street%202022_400128_5_v3.jpg',
    'Icahn School of Medicine - Mount Sinai': 'https://images.shiksha.com/mediadata/images/1540557666php4bzbzD.jpeg',
    'University of Pittsburgh': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/CathedralfromFrick.jpg',
    'Touro College of Osteopathic Medicine (TouroCOM)': 'https://www.studentdoctor.net/schools/assets/images/schools/TUCOM-MID.jpg?v=2022-06-08%2014:44:26',
    'Philadelphia College of Osteopathic Medicine (PCOM)': 'https://www.pcom.edu/_resources/images/history/2022-updates/pcom-expansion-01.jpg',
    'University of Virginia (UVA)': 'https://www.appily.com/sites/default/files/styles/max_1200/public/images/hero/college/234076_hero.jpg?itok=UyfeftUE',
    'University Of Rochester': 'https://wun.ac.uk/wp-content/uploads/university_rochester.jpg',
    'University of North Carolina': 'https://www.unc.edu/wp-content/uploads/2021/07/020419_old_well_summer004-scaled-e1625573140177.jpg',
    'Wake Forest University School of Medicine': 'https://media.bizj.us/view/img/12397779/img3191*900xx4032-2265-0-397.jpg',
    'University of Massachusetts Amherst (UMass)': 'https://assets.collegedunia.com/public/college_data/images/studyabroad/appImage/72148%20cover.jpg',
    'Boston University': 'https://www.bostonherald.com/wp-content/uploads/2022/05/bums003.jpg?w=978',
    'University of Southern California (USC)': 'https://images.shiksha.com/mediadata/images/1533291664phpRX4fuL.jpeg',
    'SUNY Downstate Health Sciences University': 'https://www.gilbaneco.com/wp-content/uploads/2014/11/5187_SUNY-Downstate-New-Acad-Public-Health_01.jpg',
    'Case Western Reserve University': 'https://www.thoughtco.com/thmb/-ViQ27niExYcDtzC0HM9bZzfdl0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/CoverPhoto-57124afc5f9b588cc2d735e2.JPG',
    'Des Moines University College of Osteopathic Medicine (DMUCOM)': 'https://www.dmu.edu/wp-content/uploads/2024/08/DMU-default-featured-social.jpg',
    'Medical College of Wisconsin (MCW)': 'https://www.mcw.edu/-/media/MCW/Image-Library/Aerial5_Intro-with-Three-Image-CTA-Component.jpg?w=1000&h=412&mode=crop&anchor=middlecenter&scale=both',
    'Saint Louis University (SLU)': 'https://www.slu.edu/_ldp-images/.private_ldp/a337/production/master/6fa3119e-b9a8-4c79-a4c6-6b549bfccc41.jpg',
    'UT Southwestern Medical Center': 'https://www.utsouthwestern.edu/newsroom/articles/year-2021/assets/cuh-exterior-landscapes.jpg',
    'Uniformed Services University of the Health Sciences (USUHS)': 'https://ohmyfacts.com/wp-content/uploads/2025/01/28-facts-about-uniformed-services-university-of-the-health-sciences-1737627171.jpg',
    'Rutgers Robert Wood Johnson Medical School (RWJMS)': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nr8vFP0OLiOECrCeA_eXqhToFN8qhxv7AiuxW8BhAB5Z2XlcFnZgdlY9F_O0RxPrloRYgdwIMhRYwaecX1HAXFG_u_om7jH7I-6lMlZU4Qr5weTPjL1eodEFFlPZ9ZeaUdsLlbHNQ=s1360-w1360-h1020-rw',
    'Quinipiac University': 'https://www.appily.com/sites/default/files/styles/max_2400/public/images/hero/college/130226_hero.jpg?itok=wUYAXYTb',
    'Perelman School of Medicine': 'https://www.med.upenn.edu/psom/assets/image-cache/user-content/images/7.15.19%20Ben%20Franklin.83e224a8.webP',
    'University of Miami (UMiami)': 'https://welcome.miami.edu/_assets/images/student-life/SAC_new_cmyk-1240x550.jpg',
    'Wayne State University School of Medicine': 'https://publicagenda.org/wp-content/uploads/Wayne-State-Image-5_Resized-1024x683.jpg',
    'Nova Southeastern University (NSUMD)': 'https://keystoneacademic-res.cloudinary.com/image/upload/c_fill,w_1920,h_636,g_auto/dpr_auto/f_auto/q_auto/v1/element/14/144548_Cover.jpg',
    'New York Institute of Technology College of Osteopathic Medicine (NYITCOM)': 'https://www.prospectivedoctor.com/wp-content/uploads/2017/07/NYITCOM.jpg',
    'Lake Erie College of Osteopathic Medicine (LECOM)': 'https://lecom.edu/content/uploads/2022/05/lecom-hero-image-header-erie-pa.jpg',
    'Oakland University William Beaumont School of Medicine': 'https://www.oakland.edu/Assets/Oakland/med/graphics/Headers/School-of-Medicine/3-Header-Ouwb-O-Riordan-Hall-02-11.jpg',
    'University of Wisconsin School of Medicine and Public Health (UWSMPH)': 'https://www.drnajeeblectures.com/wp-content/uploads/2019/12/sssssss-e1577455387941.jpg',
    'New York University (NYU)': 'https://meet.nyu.edu/wp-content/uploads/2019/10/nyu.jpg',
    'Weill Cornell Medicine': 'https://med.weill.cornell.edu/sites/default/files/styles/journal_abstract_image/public/wmc_bt_1.jpg',
    'Kaiser Permanente': 'https://images.squarespace-cdn.com/content/v1/5269fbd3e4b0eb2b76ccc1db/bcc4227b-4bb6-4999-b70e-44999c491c01/kaiser-permanente-medical-school_REV.jpg',
    'Keck School of Medicine': 'https://keck.usc.edu/medical-education/wp-content/uploads/sites/18/2023/08/KSOM-Quad-IMG_4097-web.jpg',
    'Medical University of South Carolina': 'https://web.musc.edu/-/media/images/social/icons/enterprise.jpg',
    'Renaissance School of Medicine at Stony Brook University': 'https://renaissance.stonybrookmedicine.edu/sites/default/files/Stony%20HDR%20%281%29mobile_1240.jpg',
    'Rutgers New Jersey Medical School': 'https://njms.rutgers.edu/departments/medicine/images/hhospitalfromdoc.jpg',
    'Sidney Kimmel Medical College at Thomas Jefferson University': 'https://www.healthcareitnews.com/sites/hitn/files/092622%20HIMSS%20Davies%20Jefferson%20Health%201200.jpg',
    'UC Davis': 'https://health.ucdavis.edu/media-resources/welcome/images/Cards/health-home-cards-awards.jpg',
    'University of Miami Miller School of Medicine': 'https://southfloridahospitalnews.com/wp-content/uploads/2023/03/Aerial-view-of-Leon-J-Simkins-Research-Tower_Email.png',
    'Penn State': 'https://www.pennstatehealth.org/-/media/images/hero-images/penn-state-health-hero-image.jpg'
  };

  // Get image URL for a school or use a placeholder
  const getSchoolImageUrl = (schoolName) => {
    // First try exact match
    if (schoolImages[schoolName]) {
      return schoolImages[schoolName];
    }
    
    // Try to find a partial match
    const partialMatch = Object.keys(schoolImages).find(key => 
      schoolName.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(schoolName.toLowerCase())
    );
    
    if (partialMatch) {
      return schoolImages[partialMatch];
    }
    
    // Return a placeholder if no match is found
    return 'https://via.placeholder.com/400x300?text=Medical+School';
  };

  // Sync schools to Firebase whenever applicants change
  const syncSchoolsToFirebase = async (generatedSchools) => {
    try {
      // Get existing schools from Firebase
      const schoolsSnapshot = await getDocs(collection(db, 'schools'));
      const existingSchools = new Map();
      schoolsSnapshot.docs.forEach(doc => {
        existingSchools.set(doc.data().name, doc.id);
      });

      const batch = writeBatch(db);
      const schoolsRef = collection(db, 'schools');

      // Process each generated school
      generatedSchools.forEach(school => {
        const schoolData = {
          name: school.name,
          count: school.count,
          avgGPA: school.avgGPA,
          avgMCAT: school.avgMCAT,
          acceptanceRate: school.acceptanceRate,
          imageUrl: getSchoolImageUrl(school.name),
          profileIds: school.profiles || [],
          lastUpdated: new Date().toISOString(),
          updatedBy: user?.email || 'system'
        };

        if (existingSchools.has(school.name)) {
          // Update existing school
          const docId = existingSchools.get(school.name);
          batch.update(doc(db, 'schools', docId), schoolData);
        } else {
          // Create new school
          const newDocRef = doc(schoolsRef);
          batch.set(newDocRef, {
            ...schoolData,
            id: school.id,
            createdAt: new Date().toISOString(),
            createdBy: user?.email || 'system'
          });
        }
      });

      await batch.commit();
      console.log('Schools synced to Firebase successfully');
    } catch (error) {
      console.error('Error syncing schools to Firebase:', error);
    }
  };

  // Fetch applicants, generate schools, and sync to Firebase
  const fetchAllData = async () => {
    try {
      // Fetch applicants
      const applicantsSnap = await getDocs(collection(db, 'applicants'));
      const applicantsData = applicantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplicants(applicantsData);

      // Generate schools from applicants data
      const generatedSchools = extractSchools(applicantsData);
      
      // Sync schools to Firebase
      await syncSchoolsToFirebase(generatedSchools);
      
      // Fetch updated schools from Firebase
      const schoolsSnap = await getDocs(collection(db, 'schools'));
      const schoolsData = schoolsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setSchools(schoolsData);

      // Fetch products
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsData = productsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      // Sort by sortOrder and then by name
      productsData.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return a.name.localeCompare(b.name);
      });
      setProducts(productsData);
      
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error fetching data: ${error.message}`);
    }
  };

  // Load data when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      fetchAllData();
    }
  }, [user, loading]);

  // Add this migration function to your AdminPanel.js (after the existing functions, before the render section)

// Migrate default products to Firestore
const migrateDefaultProducts = async () => {
  try {
    setDataLoading(true);
    setUploadStatus('Migrating default products to Firestore...');
    
    const defaultProducts = [
      {
        id: 'cheatsheet',
        name: 'The Cheatsheet',
        description: 'New full applicant profile added every couple days.',
        price: 14.99,
        type: 'digital',
        category: 'cheatsheet',
        features: [
          'Advice and reflections from successful applicants',
          'Which medical schools an applicant was accepted',
          'Extra-curriculars that got them in',
          'MCAT and GPA that got them in',
          'Gap years they took'
        ],
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'application',
        name: 'Application Cheatsheet',
        description: '',
        price: 19.99,
        type: 'digital',
        category: 'application',
        features: [
          'Personal statement writing guide',
          'Activity section description guide',
          'Insider advice on what admissions committees want',
          'General writing strategy guide',
          'Letter of recommendation email template'
        ],
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'cheatsheet-plus',
        name: 'The Cheatsheet +',
        description: 'Get everything in the Premed Cheatsheet + extra resources. New full applicant profile added every couple days.',
        price: 29.99,
        type: 'digital',
        category: 'cheatsheet',
        features: [
          'The Premed Cheatsheet',
          'Proven cold emailing templates',
          'Polished CV template',
          'Pre-med summer program database',
          'MCAT-Optimized Course Schedules & Study Plan'
        ],
        isActive: true,
        sortOrder: 3
      },
      {
        id: 'application-plus',
        name: 'Application Cheatsheet +',
        description: 'Get everything in the Premed Cheatsheet + Application Cheatsheet. New full applicant profile added every couple days.',
        price: 34.99,
        type: 'digital',
        category: 'application',
        features: [
          'The Premed Cheatsheet',
          'The Application Cheatsheet'
        ],
        isActive: true,
        sortOrder: 4
      }
    ];

    const batch = writeBatch(db);
    
    for (const product of defaultProducts) {
      const productData = {
        ...product,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      };
      
      const docRef = doc(db, 'products', product.id);
      batch.set(docRef, productData);
    }
    
    await batch.commit();
    
    setUploadStatus(`Successfully migrated ${defaultProducts.length} default products to Firestore!`);
    await fetchAllData();
    setTimeout(() => setUploadStatus(''), 5000);
    
  } catch (error) {
    console.error('Error migrating default products:', error);
    setUploadStatus(`Error migrating products: ${error.message}`);
    setTimeout(() => setUploadStatus(''), 5000);
  } finally {
    setDataLoading(false);
  }
};
  // Upload applicant profiles from JSON
  const uploadApplicantProfiles = async () => {
    try {
      setDataLoading(true);
      setUploadStatus('Uploading applicant profiles...');
      
      const batch = writeBatch(db);
      const applicantsRef = collection(db, 'applicants');
      
      applicantProfilesData.forEach((applicant) => {
        const docRef = doc(applicantsRef, applicant.id);
        batch.set(docRef, {
          ...applicant,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.email || 'unknown'
        });
      });
      
      await batch.commit();
      setUploadStatus(`Successfully uploaded ${applicantProfilesData.length} applicant profiles!`);
      await fetchAllData();
      setTimeout(() => setUploadStatus(''), 5000);
      
    } catch (error) {
      console.error('Error uploading applicant profiles:', error);
      setUploadStatus(`Error uploading data: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setDataLoading(false);
    }
  };

  // Generic handlers for array fields
  const handleArrayChange = (setter, field, index, value) => {
    setter(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddArrayItem = (setter, field) => {
    setter(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleRemoveArrayItem = (setter, field, index) => {
    setter(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // Applicant CRUD operations
  const handleAddApplicant = async (e) => {
    e.preventDefault();
    try {
      setDataLoading(true);
      
      const processedData = {
        ...newApplicant,
        acceptedSchools: newApplicant.acceptedSchools.filter(school => school.trim() !== ''),
        gpa: newApplicant.gpa ? parseFloat(newApplicant.gpa) : null,
        mcat: newApplicant.mcat ? parseInt(newApplicant.mcat) : null,
        gapYears: newApplicant.gapYears ? parseInt(newApplicant.gapYears) : null,
        createdAt: new Date().toISOString(),
        createdBy: user.email
      };
      
      if (editingItem) {
        await updateDoc(doc(db, 'applicants', editingItem.id), processedData);
        setUploadStatus('Applicant updated successfully!');
      } else {
        // Generate proper ID for new applicant
        const newId = await generateNextApplicantId();
        await setDoc(doc(db, 'applicants', newId), processedData);
        setUploadStatus('Applicant added successfully!');
      }
      
      resetApplicantForm();
      await fetchAllData();
      setTimeout(() => setUploadStatus(''), 3000);
      
    } catch (error) {
      console.error('Error saving applicant:', error);
      setUploadStatus(`Error: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setDataLoading(false);
    }
  };

  const resetApplicantForm = () => {
    setNewApplicant({
      matriculationYear: '',
      stateOfResidency: '',
      gender: '',
      race: '',
      major: '',
      gpa: '',
      mcat: '',
      mcatBreakdown: '',
      medicalVolunteering: '',
      nonMedicalVolunteering: '',
      leadership: '',
      nonMedicalEmployment: '',
      medicalEmployment: '',
      shadowing: '',
      awardsHonors: '',
      research: '',
      hobbies: '',
      otherActivities: '',
      reflections: '',
      acceptedSchools: [''],
      gapYears: '',
      clinicalExperience: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEditApplicant = (applicant) => {
    setNewApplicant({
      ...applicant,
      acceptedSchools: Array.isArray(applicant.acceptedSchools) ? applicant.acceptedSchools : [''],
      gpa: applicant.gpa?.toString() || '',
      mcat: applicant.mcat?.toString() || '',
      gapYears: applicant.gapYears?.toString() || ''
    });
    setEditingItem(applicant);
    setShowForm(true);
  };

  const handleDeleteApplicant = async (id) => {
    if (window.confirm('Are you sure you want to delete this applicant?')) {
      try {
        await deleteDoc(doc(db, 'applicants', id));
        await fetchAllData();
        setUploadStatus('Applicant deleted successfully!');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        console.error('Error deleting applicant:', error);
        setError(`Error deleting applicant: ${error.message}`);
      }
    }
  };

  // Clear all applicants and schools
  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to delete ALL applicants and schools? This cannot be undone!')) {
      try {
        setDataLoading(true);
        
        // Clear applicants
        const applicantsSnapshot = await getDocs(collection(db, 'applicants'));
        const applicantsBatch = writeBatch(db);
        applicantsSnapshot.docs.forEach((doc) => {
          applicantsBatch.delete(doc.ref);
        });
        await applicantsBatch.commit();
        
        // Clear schools
        const schoolsSnapshot = await getDocs(collection(db, 'schools'));
        const schoolsBatch = writeBatch(db);
        schoolsSnapshot.docs.forEach((doc) => {
          schoolsBatch.delete(doc.ref);
        });
        await schoolsBatch.commit();
        
        await fetchAllData();
        setUploadStatus('All applicants and schools deleted successfully!');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        console.error('Error clearing data:', error);
        setError(`Error clearing data: ${error.message}`);
      } finally {
        setDataLoading(false);
      }
    }
  };

  // Navigate to school profile
  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  // PRODUCT MANAGEMENT FUNCTIONS

  // Generate next product ID
  const generateNextProductId = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const existingIds = productsSnapshot.docs.map(doc => doc.id);
      
      // Extract numbers from existing IDs and find the highest
      const existingNumbers = existingIds
        .filter(id => id.startsWith('product-'))
        .map(id => parseInt(id.replace('product-', '')))
        .filter(num => !isNaN(num));
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      const newId = `product-${nextNumber}`;
      
      console.log('Generated new product ID:', newId);
      return newId;
    } catch (error) {
      console.error('Error generating product ID:', error);
      return `product-${Date.now()}`;
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return null;
    
    try {
      setUploadingFile(true);
      setFileUploadProgress(0);
      
      // Create a unique filename
      const fileName = `products/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Create upload task with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFileUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('File upload error:', error);
            setUploadingFile(false);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploadingFile(false);
              setFileUploadProgress(0);
              resolve({
                url: downloadURL,
                fileName: fileName,
                originalName: file.name,
                size: file.size,
                type: file.type
              });
            } catch (error) {
              setUploadingFile(false);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setUploadingFile(false);
      setFileUploadProgress(0);
      throw error;
    }
  };

  // Handle product file selection
  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setNewProduct(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
      setError('');
    }
  };

  // Add/Update product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setDataLoading(true);
      setError('');
      
      // Validate required fields
      if (!newProduct.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!newProduct.price || parseFloat(newProduct.price) < 0) {
        throw new Error('Valid price is required');
      }
      
      let fileData = null;
      
      // Handle file upload if there's a new file
      if (newProduct.file) {
        try {
          fileData = await handleFileUpload(newProduct.file);
        } catch (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      }
      
      const processedData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: parseFloat(newProduct.price),
        type: newProduct.type,
        category: newProduct.category,
        features: newProduct.features.filter(feature => feature.trim() !== ''),
        isActive: newProduct.isActive,
        sortOrder: parseInt(newProduct.sortOrder) || 0,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      };
      
      // Add file data if uploaded
      if (fileData) {
        processedData.fileUrl = fileData.url;
        processedData.fileName = fileData.originalName;
        processedData.fileStoragePath = fileData.fileName;
        processedData.fileSize = fileData.size;
        processedData.fileType = fileData.type;
      }
      
      if (editingItem) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingItem.id), processedData);
        setUploadStatus('Product updated successfully!');
      } else {
        // Create new product
        const newId = await generateNextProductId();
        await setDoc(doc(db, 'products', newId), {
          ...processedData,
          createdAt: new Date().toISOString(),
          createdBy: user.email
        });
        setUploadStatus('Product added successfully!');
      }
      
      resetProductForm();
      await fetchAllData();
      setTimeout(() => setUploadStatus(''), 3000);
      
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setDataLoading(false);
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      type: 'digital',
      category: 'cheatsheet',
      features: [''],
      file: null,
      fileName: '',
      fileUrl: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingItem(null);
    setShowForm(false);
    
    // Reset file input
    const fileInput = document.getElementById('productFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Edit product
  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      type: product.type || 'digital',
      category: product.category || 'cheatsheet',
      features: Array.isArray(product.features) ? product.features : [''],
      file: null,
      fileName: product.fileName || '',
      fileUrl: product.fileUrl || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      sortOrder: product.sortOrder?.toString() || '0'
    });
    setEditingItem(product);
    setShowForm(true);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This will also delete any associated files.')) {
      try {
        setDataLoading(true);
        
        // Get product data to find file path
        const productDoc = await doc(db, 'products', id);
        const productData = (await getDocs(collection(db, 'products'))).docs
          .find(doc => doc.id === id)?.data();
        
        // Delete file from storage if it exists
        if (productData?.fileStoragePath) {
          try {
            const fileRef = ref(storage, productData.fileStoragePath);
            await deleteObject(fileRef);
            console.log('File deleted from storage');
          } catch (fileError) {
            console.warn('Could not delete file from storage:', fileError);
          }
        }
        
        // Delete product document
        await deleteDoc(doc(db, 'products', id));
        
        await fetchAllData();
        setUploadStatus('Product deleted successfully!');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(`Error deleting product: ${error.message}`);
      } finally {
        setDataLoading(false);
      }
    }
  };

  // Toggle product active status
  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      });
      
      await fetchAllData();
      setUploadStatus(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error updating product status:', error);
      setError(`Error updating product: ${error.message}`);
    }
  };

  // Get product category display name
  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'cheatsheet': 'Cheatsheet',
      'application': 'Application',
      'bundle': 'Bundle',
      'resource': 'Resource',
      'guide': 'Guide'
    };
    return categoryNames[category] || category;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="admin-panel">
        <Navbar />
        <div className="admin-content">
          <div className="container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading admin panel...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // This should never show since we redirect unauthorized users
  if (!user) {
    return null;
  }

  return (
    <div className="admin-panel">
      <Navbar />
      
      <div className="admin-content">
        <div className="container">
          <div className="admin-header">
            <h1>🛠️ Admin Control Panel</h1>
            <p>Welcome, <strong>{user.email}</strong> | Manage applicant profiles and medical school data</p>
            
            {uploadStatus && (
              <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
                {uploadStatus}
              </div>
            )}
            
            {error && (
              <div className="upload-status error">
                {error}
              </div>
            )}
            
            {dataLoading && (
              <div className="data-loading">
                <div className="spinner"></div>
                <span>Processing data...</span>
              </div>
            )}
          </div>
          
          <div className="admin-tabs">
            <button 
              className={`tab-button ${activeTab === 'applicants' ? 'active' : ''}`}
              onClick={() => {setActiveTab('applicants'); setShowForm(false); setEditingItem(null);}}
            >
              👥 Applicants ({applicants.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'schools' ? 'active' : ''}`}
              onClick={() => {setActiveTab('schools'); setShowForm(false); setEditingItem(null);}}
            >
              🏫 Schools ({schools.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => {setActiveTab('products'); setShowForm(false); setEditingItem(null);}}
            >
              🛍️ Products ({products.length})
            </button>
          </div>
          {/* PRODUCTS TAB - Updated with better visibility */}
{activeTab === 'products' && (
  <div className="tab-content">
    <div className="tab-header">
      <h2>🛍️ Manage Products</h2>
      <div className="tab-actions">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="action-button primary"
          style={{
            fontSize: '1.1rem',
            padding: '12px 24px',
            fontWeight: 'bold'
          }}
        >
          {showForm ? '❌ Cancel' : '➕ Add New Product'}
        </button>
        {products.length === 0 && (
          <button 
            onClick={migrateDefaultProducts}
            className="action-button secondary"
            disabled={dataLoading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white'
            }}
          >
            📦 Migrate Default Products
          </button>
        )}
        <button 
          onClick={() => fetchAllData()}
          className="action-button secondary"
          disabled={dataLoading}
        >
          🔄 Refresh
        </button>
      </div>
    </div>

    {/* Show migration prompt if no products exist */}
    {products.length === 0 && !showForm && (
      <div className="migration-prompt" style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '2rem',
        margin: '2rem 0',
        textAlign: 'center'
      }}>
        <h3>🚀 Get Started with Products</h3>
        <p>No products found in your database. You can either:</p>
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem'}}>
          <button 
            onClick={migrateDefaultProducts}
            className="action-button primary"
            disabled={dataLoading}
            style={{
              backgroundColor: '#3b82f6',
              padding: '12px 24px'
            }}
          >
            📦 Import Default Products
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="action-button primary"
            style={{
              padding: '12px 24px'
            }}
          >
            ➕ Create New Product
          </button>
        </div>
        <p style={{marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280'}}>
          Import the 4 default products (Cheatsheet, Application, Cheatsheet+, Application+) or start fresh by creating your own.
        </p>
      </div>
    )}

    {showForm && (
      <div className="form-section">
        <h3>{editingItem ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
        <form onSubmit={handleAddProduct} className="admin-form">
          
          {/* Basic Product Information */}
          <div className="form-section-header">
            <h4>📦 Basic Information</h4>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input 
                type="text" 
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="e.g., The Ultimate Cheatsheet, Application Guide Pro"
                required
              />
            </div>
            <div className="form-group">
              <label>Price (USD) *</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                placeholder="14.99"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              rows="3"
              placeholder="Detailed description of the product and what it includes"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option value="cheatsheet">Cheatsheet</option>
                <option value="application">Application</option>
                <option value="bundle">Bundle</option>
                <option value="resource">Resource</option>
                <option value="guide">Guide</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                value={newProduct.type}
                onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
              >
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sort Order</label>
              <input 
                type="number" 
                value={newProduct.sortOrder}
                onChange={(e) => setNewProduct({...newProduct, sortOrder: e.target.value})}
                placeholder="0"
              />
              <small>Lower numbers appear first in product listings</small>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select 
                value={newProduct.isActive}
                onChange={(e) => setNewProduct({...newProduct, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Product Features */}
          <div className="form-section-header">
            <h4>✨ Product Features</h4>
          </div>

          <div className="form-group">
            <label>Features List</label>
            {newProduct.features.map((feature, index) => (
              <div key={index} className="array-item">
                <input 
                  type="text" 
                  value={feature}
                  onChange={(e) => handleArrayChange(setNewProduct, 'features', index, e.target.value)}
                  placeholder="Enter a feature or benefit"
                />
                {index > 0 && (
                  <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => handleRemoveArrayItem(setNewProduct, 'features', index)}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              className="add-button"
              onClick={() => handleAddArrayItem(setNewProduct, 'features')}
            >
              ➕ Add Feature
            </button>
          </div>

          {/* File Upload */}
          <div className="form-section-header">
            <h4>📁 Product File</h4>
          </div>

          <div className="form-group">
            <label>Upload Product File</label>
            <input 
              type="file" 
              id="productFile"
              onChange={handleProductFileChange}
              accept=".pdf,.doc,.docx,.zip,.rar,.txt,.ppt,.pptx,.xls,.xlsx"
              disabled={uploadingFile || dataLoading}
            />
            <small>Supported formats: PDF, DOC, DOCX, ZIP, RAR, TXT, PPT, PPTX, XLS, XLSX (Max 50MB)</small>
            
            {/* Show current file info if editing */}
            {editingItem && editingItem.fileName && !newProduct.file && (
              <div className="current-file-info">
                <p><strong>Current file:</strong> {editingItem.fileName}</p>
                {editingItem.fileSize && (
                  <p><strong>Size:</strong> {formatFileSize(editingItem.fileSize)}</p>
                )}
                <p><em>Upload a new file to replace the current one</em></p>
              </div>
            )}

            {/* Show selected file info */}
            {newProduct.file && (
              <div className="selected-file-info">
                <p><strong>Selected file:</strong> {newProduct.file.name}</p>
                <p><strong>Size:</strong> {formatFileSize(newProduct.file.size)}</p>
              </div>
            )}

            {/* Upload progress */}
            {uploadingFile && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${fileUploadProgress}%`}}
                  ></div>
                </div>
                <p>Uploading... {fileUploadProgress}%</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button" 
              disabled={dataLoading || uploadingFile}
            >
              {uploadingFile ? `Uploading... ${fileUploadProgress}%` : 
               dataLoading ? 'Saving...' :
               editingItem ? '💾 Update Product' : '➕ Add Product'}
            </button>
            <button type="button" onClick={resetProductForm} className="cancel-button">
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    )}

    <div className="data-section">
      <h3>📊 Existing Products</h3>
      {products.length === 0 ? (
        <div className="no-data">
          <p>📦 No products found.</p>
          <p>Click "Add New Product" above or import default products to get started.</p>
        </div>
      ) : (
        <div className="data-grid">
          {products.map(product => (
            <div key={product.id} className={`data-card product-card ${!product.isActive ? 'inactive' : ''}`}>
              <div className="card-header">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <div className="product-badges">
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="category-badge">
                      {getCategoryDisplayName(product.category)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="card-details">
                <p className="product-price"><strong>${product.price?.toFixed(2) || '0.00'}</strong></p>
                
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                
                <div className="product-meta">
                  <p><strong>Type:</strong> {product.type || 'Digital'}</p>
                  <p><strong>Sort Order:</strong> {product.sortOrder || 0}</p>
                  
                  {product.fileName && (
                    <div className="file-info">
                      <p><strong>File:</strong> {product.fileName}</p>
                      {product.fileSize && (
                        <p><strong>Size:</strong> {formatFileSize(product.fileSize)}</p>
                      )}
                      {product.fileUrl && (
                        <a 
                          href={product.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="download-link"
                        >
                          📥 Download File
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="product-features">
                    <strong>Features:</strong>
                    <ul>
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                      {product.features.length > 3 && (
                        <li><em>+{product.features.length - 3} more...</em></li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="product-timestamps">
                  <p><strong>Created:</strong> {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</p>
                  {product.updatedAt && (
                    <p><strong>Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="action-button edit"
                  onClick={() => handleEditProduct(product)}
                  disabled={dataLoading}
                  title="Edit Product"
                >
                  ✏️
                </button>
                <button 
                  className={`action-button ${product.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                  disabled={dataLoading}
                  title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                >
                  {product.isActive ? '⏸️' : '▶️'}
                </button>
                <button 
                  className="action-button delete"
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={dataLoading}
                  title="Delete Product"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
          {/* APPLICANTS TAB */}
          {activeTab === 'applicants' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>📋 Manage Applicants</h2>
                <div className="tab-actions">
                  <button 
                    onClick={() => setShowForm(!showForm)}
                    className="action-button primary"
                  >
                    {showForm ? '❌ Cancel' : '➕ Add New Applicant'}
                  </button>
                  <button 
                    onClick={uploadApplicantProfiles}
                    className="action-button secondary"
                    disabled={dataLoading}
                  >
                    📤 Upload JSON Data
                  </button>
                  <button 
                    onClick={() => fetchAllData()}
                    className="action-button secondary"
                    disabled={dataLoading}
                  >
                    🔄 Refresh
                  </button>
                  <button 
                    onClick={clearAllData}
                    className="action-button danger"
                    disabled={dataLoading}
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </div>

              {showForm && (
                <div className="form-section">
                  <h3>{editingItem ? '✏️ Edit Applicant' : '➕ Add New Applicant'}</h3>
                  <form onSubmit={handleAddApplicant} className="admin-form">
                    
                    {/* Basic Information */}
                    <div className="form-section-header">
                      <h4>📋 Basic Information</h4>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Major *</label>
                        <input 
                          type="text" 
                          value={newApplicant.major}
                          onChange={(e) => setNewApplicant({...newApplicant, major: e.target.value})}
                          placeholder="e.g., Biology, Chemistry, Biomedical Engineering"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Matriculation Year</label>
                        <input 
                          type="text" 
                          value={newApplicant.matriculationYear}
                          onChange={(e) => setNewApplicant({...newApplicant, matriculationYear: e.target.value})}
                          placeholder="e.g., 2025"
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>State of Residency</label>
                        <input 
                          type="text" 
                          value={newApplicant.stateOfResidency}
                          onChange={(e) => setNewApplicant({...newApplicant, stateOfResidency: e.target.value})}
                          placeholder="e.g., CA, NY, TX"
                        />
                      </div>
                      <div className="form-group">
                        <label>Gender</label>
                        <select 
                          value={newApplicant.gender}
                          onChange={(e) => setNewApplicant({...newApplicant, gender: e.target.value})}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Race/Ethnicity</label>
                        <input 
                          type="text" 
                          value={newApplicant.race}
                          onChange={(e) => setNewApplicant({...newApplicant, race: e.target.value})}
                          placeholder="e.g., White, Asian, African American, Hispanic"
                        />
                      </div>
                      <div className="form-group">
                        <label>Gap Years</label>
                        <input 
                          type="number"
                          min="0"
                          value={newApplicant.gapYears}
                          onChange={(e) => setNewApplicant({...newApplicant, gapYears: e.target.value})}
                          placeholder="e.g., 1"
                        />
                      </div>
                    </div>

                    {/* Academic Stats */}
                    <div className="form-section-header">
                      <h4>📊 Academic Statistics</h4>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>GPA *</label>
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          max="4.0"
                          value={newApplicant.gpa}
                          onChange={(e) => setNewApplicant({...newApplicant, gpa: e.target.value})}
                          placeholder="e.g., 3.85"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>MCAT *</label>
                        <input 
                          type="number"
                          min="472"
                          max="528"
                          value={newApplicant.mcat}
                          onChange={(e) => setNewApplicant({...newApplicant, mcat: e.target.value})}
                          placeholder="e.g., 515"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>MCAT Breakdown</label>
                      <input 
                        type="text" 
                        value={newApplicant.mcatBreakdown}
                        onChange={(e) => setNewApplicant({...newApplicant, mcatBreakdown: e.target.value})}
                        placeholder="e.g., C/P: 128, CARS: 129, B/B: 130, P/S: 128"
                      />
                    </div>

                    {/* Accepted Schools */}
                    <div className="form-section-header">
                      <h4>🏥 Accepted Schools</h4>
                    </div>

                    <div className="form-group">
                      <label>Accepted Schools * (Use exact school names from your mapping)</label>
                      <small style={{color: '#6c757d', display: 'block', marginBottom: '0.5rem'}}>
                        Examples: Harvard Medical School, Johns Hopkins, Stanford, UCSF, Mayo Clinic, etc.
                      </small>
                      {newApplicant.acceptedSchools.map((school, index) => (
                        <div key={index} className="array-item">
                          <input 
                            type="text" 
                            value={school}
                            onChange={(e) => handleArrayChange(setNewApplicant, 'acceptedSchools', index, e.target.value)}
                            placeholder="Enter full school name (e.g., Harvard Medical School)"
                            required={index === 0}
                          />
                          {index > 0 && (
                            <button 
                              type="button" 
                              className="remove-button"
                              onClick={() => handleRemoveArrayItem(setNewApplicant, 'acceptedSchools', index)}
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="add-button"
                        onClick={() => handleAddArrayItem(setNewApplicant, 'acceptedSchools')}
                      >
                        ➕ Add School
                      </button>
                    </div>

                    {/* Clinical Experience */}
                    <div className="form-section-header">
                      <h4>🏥 Clinical & Medical Experience</h4>
                    </div>

                    <div className="form-group">
                      <label>Clinical Experience</label>
                      <textarea 
                        value={newApplicant.clinicalExperience}
                        onChange={(e) => setNewApplicant({...newApplicant, clinicalExperience: e.target.value})}
                        rows="3"
                        placeholder="Describe clinical experience with hours (e.g., Medical scribe - 500 hours)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Medical Volunteering</label>
                      <textarea 
                        value={newApplicant.medicalVolunteering}
                        onChange={(e) => setNewApplicant({...newApplicant, medicalVolunteering: e.target.value})}
                        rows="3"
                        placeholder="Describe medical volunteering experience with hours"
                      />
                    </div>

                    <div className="form-group">
                      <label>Medical Employment</label>
                      <textarea 
                        value={newApplicant.medicalEmployment}
                        onChange={(e) => setNewApplicant({...newApplicant, medicalEmployment: e.target.value})}
                        rows="3"
                        placeholder="Describe paid medical employment experiences"
                      />
                    </div>

                    <div className="form-group">
                      <label>Shadowing Experience</label>
                      <textarea 
                        value={newApplicant.shadowing}
                        onChange={(e) => setNewApplicant({...newApplicant, shadowing: e.target.value})}
                        rows="3"
                        placeholder="Describe physician shadowing experiences with hours"
                      />
                    </div>

                    {/* Research & Leadership */}
                    <div className="form-section-header">
                      <h4>🔬 Research & Leadership</h4>
                    </div>

                    <div className="form-group">
                      <label>Research Experience</label>
                      <textarea 
                        value={newApplicant.research}
                        onChange={(e) => setNewApplicant({...newApplicant, research: e.target.value})}
                        rows="3"
                        placeholder="Describe research experience with hours, publications, presentations"
                      />
                    </div>

                    <div className="form-group">
                      <label>Leadership Experience</label>
                      <textarea 
                        value={newApplicant.leadership}
                        onChange={(e) => setNewApplicant({...newApplicant, leadership: e.target.value})}
                        rows="3"
                        placeholder="Describe leadership roles and experiences"
                      />
                    </div>

                    {/* Volunteering & Employment */}
                    <div className="form-section-header">
                      <h4>🤝 Volunteering & Employment</h4>
                    </div>

                    <div className="form-group">
                      <label>Non-Medical Volunteering</label>
                      <textarea 
                        value={newApplicant.nonMedicalVolunteering}
                        onChange={(e) => setNewApplicant({...newApplicant, nonMedicalVolunteering: e.target.value})}
                        rows="3"
                        placeholder="Describe non-medical volunteering experiences with hours"
                      />
                    </div>

                    <div className="form-group">
                      <label>Non-Medical Employment</label>
                      <textarea 
                        value={newApplicant.nonMedicalEmployment}
                        onChange={(e) => setNewApplicant({...newApplicant, nonMedicalEmployment: e.target.value})}
                        rows="3"
                        placeholder="Describe paid non-medical employment experiences"
                      />
                    </div>

                    {/* Achievements & Personal */}
                    <div className="form-section-header">
                      <h4>🏆 Achievements & Personal</h4>
                    </div>

                    <div className="form-group">
                      <label>Awards & Honors</label>
                      <textarea 
                        value={newApplicant.awardsHonors}
                        onChange={(e) => setNewApplicant({...newApplicant, awardsHonors: e.target.value})}
                        rows="3"
                        placeholder="List academic awards, honors, scholarships, recognitions"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hobbies & Interests</label>
                      <textarea 
                        value={newApplicant.hobbies}
                        onChange={(e) => setNewApplicant({...newApplicant, hobbies: e.target.value})}
                        rows="3"
                        placeholder="Describe personal hobbies and interests"
                      />
                    </div>

                    <div className="form-group">
                      <label>Other Significant Activities</label>
                      <textarea 
                        value={newApplicant.otherActivities}
                        onChange={(e) => setNewApplicant({...newApplicant, otherActivities: e.target.value})}
                        rows="3"
                        placeholder="Any other significant extracurricular activities or experiences"
                      />
                    </div>

                    {/* Reflections */}
                    <div className="form-section-header">
                      <h4>💭 Reflections & Advice</h4>
                    </div>

                    <div className="form-group">
                      <label>Reflections & Advice</label>
                      <textarea 
                        value={newApplicant.reflections}
                        onChange={(e) => setNewApplicant({...newApplicant, reflections: e.target.value})}
                        rows="4"
                        placeholder="Share advice and reflections on the application process, what worked, what didn't, tips for future applicants"
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="submit-button" disabled={dataLoading}>
                        {editingItem ? '💾 Update Applicant' : '➕ Add Applicant'}
                      </button>
                      <button type="button" onClick={resetApplicantForm} className="cancel-button">
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="data-section">
                <h3>📊 Existing Applicants</h3>
                {applicants.length === 0 ? (
                  <div className="no-data">
                    <p>📭 No applicants found.</p>
                    <p>Click "Add New Applicant" or "Upload JSON Data" to get started.</p>
                  </div>
                ) : (
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Major</th>
                          <th>GPA</th>
                          <th>MCAT</th>
                          <th>State</th>
                          <th>Schools</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map(applicant => (
                          <tr key={applicant.id}>
                            <td className="id-cell">{applicant.id}</td>
                            <td>{applicant.major || 'N/A'}</td>
                            <td><span className="metric-badge">{applicant.gpa || 'N/A'}</span></td>
                            <td><span className="metric-badge">{applicant.mcat || 'N/A'}</span></td>
                            <td>{applicant.stateOfResidency || 'N/A'}</td>
                            <td className="schools-cell">
                              {Array.isArray(applicant.acceptedSchools) 
                                ? applicant.acceptedSchools.slice(0, 2).join(', ') + 
                                  (applicant.acceptedSchools.length > 2 ? '...' : '')
                                : applicant.acceptedSchools || 'N/A'}
                            </td>
                            <td className="actions-cell">
                              <button 
                                className="action-button edit"
                                onClick={() => handleEditApplicant(applicant)}
                                disabled={dataLoading}
                              >
                                ✏️
                              </button>
                              <button 
                                className="action-button delete"
                                onClick={() => handleDeleteApplicant(applicant.id)}
                                disabled={dataLoading}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SCHOOLS TAB */}
          {activeTab === 'schools' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>🏫 Medical Schools</h2>
                <div className="tab-actions">
                  <button 
                    onClick={() => fetchAllData()}
                    className="action-button secondary"
                    disabled={dataLoading}
                  >
                    🔄 Refresh Schools
                  </button>
                </div>
              </div>
              
              <div className="data-section">
                <h3>🏛️ Schools Generated from Applicant Data</h3>
                <p style={{marginBottom: '1.5rem', color: '#6c757d'}}>
                  Schools are automatically generated from applicant acceptance data. Each school shows statistics based on accepted applicants.
                  School names are normalized using your existing school mapping system.
                </p>
                
                {schools.length === 0 ? (
                  <div className="no-data">
                    <p>🏫 No schools found.</p>
                    <p>Add applicants with accepted schools to generate the schools list.</p>
                  </div>
                ) : (
                  <div className="data-grid">
                    {schools.map(school => (
                      <div 
                        key={school.id} 
                        className="data-card school-card"
                        onClick={() => handleSchoolClick(school.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {school.imageUrl && (
                              <img 
                                src={school.imageUrl} 
                                alt={school.name}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '2px solid #e9ecef'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <h3>{school.name}</h3>
                              <span className="profile-badge">{school.count} profiles</span>
                            </div>
                          </div>
                        </div>
                        <div className="card-details">
                          <p><strong>📊 Acceptance Rate:</strong> {school.acceptanceRate || 'N/A'}</p>
                          <p><strong>📈 Avg GPA:</strong> {school.avgGPA || 'N/A'}</p>
                          <p><strong>🎯 Avg MCAT:</strong> {school.avgMCAT || 'N/A'}</p>
                          <p><strong>👥 Accepted Profiles:</strong> {school.count}</p>
                        </div>
                        <div className="card-actions">
                          <button 
                            className="action-button primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSchoolClick(school.id);
                            }}
                          >
                            👁️ View Profiles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;