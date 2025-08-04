// src/utils/profilesData.js
/**
 * Helper utility for loading and working with profile data from Firebase
 */

import { getFirestore, collection, getDocs } from 'firebase/firestore';

//populate the allSchools map with the actual school names instead of school-0, school-1, etc.
const createSchoolId = (schoolName) => {
  return schoolName
    .toLowerCase()
    .replace(/&/g, '-') // Use regular hyphen instead of ‑
    .replace(/\./g, '-') // Convert periods to hyphens 
    .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Map of variations of school names to standardized names
const schoolNameMap = {
  'pittsburgh': 'University of Pittsburgh',
  'pitt': 'University of Pittsburgh',
  'upmc': 'University of Pittsburgh',

  'at still': 'A.T. Still University',
  'at still university': 'A.T. Still University',
  'at stills': 'A.T. Still University',
  'at still university of health sciences': 'A.T. Still University',
  
  'columbia': 'Columbia University',

  'cornell': 'Cornell University',

  'dartmouth': 'Dartmouth College',

  'dmucom': 'Des Moines University College of Osteopathic Medicine (DMUCOM)',

  'emory': 'Emory University',

  'lecom': 'Lake Erie College of Osteopathic Medicine (LECOM)',

  'mayo clinic': 'Mayo Clinic Alix School of Medicine',

  'mcw': 'Medical College of Wisconsin (MCW)',

  'new york medical college': 'New York Medical College',

  'nymc': 'New York Medical College',

  'nyitcom': 'New York Institute of Technology College of Osteopathic Medicine (NYITCOM)',

  'nsumd': 'Nova Southeastern University (NSUMD)',

  'nyu': 'New York University (NYU)',

  'ohio state': 'Ohio State University',

  'pcom': 'Philadelphia College of Osteopathic Medicine (PCOM)',

  'penn': 'University of Pennsylvania',

  'perelman': 'Perelman School of Medicine',

  'rwjms': 'Rutgers Robert Wood Johnson Medical School (RWJMS)',

  'uva': 'University of Virginia (UVA)',
  'university of virginia': 'University of Virginia (UVA)',
  'university of virgnia': 'University of Virginia (UVA)',

  'quinipiac': 'Quinipiac University',
  
  'university of michigan': 'University of Michigan',
  'michigan': 'University of Michigan',
  
  'feinberg': 'Feinberg School of Medicine',
  'northwestern': 'Feinberg School of Medicine',
  'northwestern feinberg': 'Feinberg School of Medicine',
  
  'wake forest': 'Wake Forest University School of Medicine',
  'wake forest university': 'Wake Forest University School of Medicine',

  'slu': 'Saint Louis University (SLU)',

  'suny downstate': 'SUNY Downstate Health Sciences University',

  'tourocom': 'Touro College of Osteopathic Medicine (TouroCOM)',
  'touro': 'Touro College of Osteopathic Medicine (TouroCOM)',

  'umass': 'University of Massachusetts Amherst (UMass)',

  'umiami': 'University of Miami (UMiami)',

  'ccom': 'CCOM',

  'chicago college of osteopathic medicine': 'Chicago College of Osteopathic Medicine (CCOM)',
  'chicago college of osteopathic medicine of midwestern university': 'Chicago College of Osteopathic Medicine (CCOM)',

  'case western': 'Case Western Reserve University',

  'case': 'Case Western Reserve University',

  'brown': 'Brown University',

  'boston u': 'Boston University',

  'mount sinai': 'Icahn School of Medicine - Mount Sinai',

  'and usuhs. waitlisted: stanford': 'Uniformed Services University of the Health Sciences (USUHS)',

  'university Of north carolina': 'University of North Carolina',

  'university Of rochester': 'University Of Rochester',

  'usc': 'University of Southern California (USC)',

  'ut southwestern': 'UT Southwestern Medical Center',

  'uwsmph': 'University of Wisconsin School of Medicine and Public Health (UWSMPH)',

  'vanderbilt': 'Vanderbilt University School of Medicine',

  'washu': 'Washington University School of Medicine',

  'wayne state': 'Wayne State University School of Medicine',
};

// Normalize school name to ensure consistent naming
export const normalizeSchoolName = (schoolName) => {
  if (!schoolName) return '';
  
  const lowercaseName = schoolName.toLowerCase().trim();
  
  // Check for direct matches or partial matches in our mapping
  for (const [key, value] of Object.entries(schoolNameMap)) {
    if (lowercaseName === key || lowercaseName.includes(key)) {
      return value;
    }
  }
  
  // If no match, return properly capitalized original
  return schoolName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Load the profiles data from Firebase
export const loadProfiles = async () => {
  try {
    const db = getFirestore();
    const applicantsSnapshot = await getDocs(collection(db, 'applicants'));
    const profiles = applicantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Loaded ${profiles.length} profiles from Firebase`);
    return profiles;
  } catch (error) {
    console.error('Error loading profiles from Firebase:', error);
    // Return hardcoded data as fallback
    return getHardcodedProfiles();
  }
};

// Load schools data from Firebase
export const loadSchools = async () => {
  try {
    const db = getFirestore();
    const schoolsSnapshot = await getDocs(collection(db, 'schools'));
    const schools = schoolsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Loaded ${schools.length} schools from Firebase`);
    return schools;
  } catch (error) {
    console.error('Error loading schools from Firebase:', error);
    return [];
  }
};

// Alternative method: Load profiles and generate schools on the fly
export const loadProfilesAndGenerateSchools = async () => {
  try {
    const profiles = await loadProfiles();
    const schools = extractSchools(profiles);
    
    return { profiles, schools };
  } catch (error) {
    console.error('Error loading profiles and generating schools:', error);
    return { profiles: getHardcodedProfiles(), schools: [] };
  }
};

// Provide hardcoded profiles as a fallback
export const getHardcodedProfiles = () => {
  return [
    {
      id: "applicant-11",
      matriculationYear: "2028",
      stateOfResidency: "PA",
      gender: "Male",
      race: "White",
      major: "General Biology, Environmental Science and Tech",
      gpa: 3.62,
      mcat: 520,
      acceptedSchools: ["TouroCOM", "PCOM", "University of Michigan", "University of Pittsburgh"]
    },
    {
      id: "applicant-12",
      matriculationYear: "2021",
      stateOfResidency: "Pennsylvania",
      gender: "Male",
      race: "White",
      major: "Biology major, economic policy minor",
      gpa: 3.99,
      mcat: 518,
      acceptedSchools: ["Feinberg School of Medicine"]
    },
    {
      id: "applicant-13",
      matriculationYear: "2023",
      stateOfResidency: "VA",
      gender: null,
      race: null,
      major: "BA Neuroscience",
      gpa: 3.95,
      mcat: 516,
      acceptedSchools: ["Pittsburgh"]
    },
    {
      id: "applicant-14",
      matriculationYear: "2021",
      stateOfResidency: "Florida",
      gender: "Ciswoman",
      race: "Chinese-Jamaican",
      major: "Major in Geography, minor in Mandarin",
      gpa: 4.0,
      mcat: 512,
      acceptedSchools: ["University of Virginia"]
    },
    {
      id: "applicant-15",
      matriculationYear: "2023",
      stateOfResidency: "PA",
      gender: "Female",
      race: "White",
      major: "Psychology, Spanish Majors, Chemistry and Biology Minors",
      gpa: 4.0,
      mcat: 516,
      acceptedSchools: ["University of Pittsburgh", "University of Rochester", "University of North Carolina"]
    },
    {
      id: "applicant-16",
      matriculationYear: "2023",
      stateOfResidency: "Ohio",
      gender: "Male",
      race: "Asian",
      major: "Biomedical Engineering",
      gpa: 3.93,
      mcat: 510,
      acceptedSchools: ["Wake Forest University School of Medicine"]
    },
    {
      id: "applicant-17",
      matriculationYear: "2027",
      stateOfResidency: "ny",
      gender: "female",
      race: "white",
      major: "majors: german; molecular and cellular biology, no minors",
      gpa: 3.7,
      mcat: 521,
      acceptedSchools: ["Columbia", "Cornell", "UMass", "Boston U", "USC", "SUNY downstate", "New York Medical College"]
    },
    {
      id: "applicant-18",
      matriculationYear: "2025",
      stateOfResidency: "OH",
      gender: "Male",
      race: "Asian",
      major: "BME and CS majors, Chemistry minor",
      gpa: 4.0,
      mcat: 527,
      acceptedSchools: ["UVA", "Ohio State"]
    },
    {
      id: "applicant-19",
      matriculationYear: "2025",
      stateOfResidency: "Virginia",
      gender: "Female",
      race: "White",
      major: "Majors: Chemical Biology (BA), Chemistry (BA), Minors: Biology, Psychology",
      gpa: 3.94,
      mcat: 515,
      acceptedSchools: ["New York Medical College"]
    },
    {
      id: "applicant-20",
      matriculationYear: "2024",
      stateOfResidency: "NC",
      gender: "Male",
      race: "African American",
      major: "Major in biology",
      gpa: 3.9,
      mcat: 515,
      acceptedSchools: ["Mayo Clinic Alix School of Medicine (AZ/Fl)", "Northwestern Feinberg", "Wake Forest"]
    },
    {
      id: "applicant-21",
      matriculationYear: "2025",
      stateOfResidency: "Wisconsin",
      gender: "Female",
      race: "Mixed (Asian and white)",
      major: "Psychology and environmental studies double major, chemistry minor",
      gpa: 3.975,
      mcat: 510,
      acceptedSchools: ["AT Stills", "DMUCOM", "CCOM", "UWSMPH", "MCW", "SLU"]
    }
  ];
};

// Filter profiles based on search criteria
export const filterProfiles = (profiles, searchTerm = '') => {
  if (!searchTerm) return profiles;
  
  const term = searchTerm.toLowerCase();
  return profiles.filter(profile => {
    return (
      (profile.major && profile.major.toLowerCase().includes(term)) ||
      (profile.stateOfResidency && profile.stateOfResidency.toLowerCase().includes(term)) ||
      (profile.acceptedSchools && profile.acceptedSchools.some(
        school => school.toLowerCase().includes(term)
      )) ||
      (profile.type && profile.type.toLowerCase().includes(term)) ||
      (profile.reflections && profile.reflections.toLowerCase().includes(term))
    );
  });
};

// Extract all schools from profiles
export const extractSchools = (profiles) => {
  const schoolsMap = new Map();
  
  profiles.forEach(profile => {
    if (profile.acceptedSchools && Array.isArray(profile.acceptedSchools)) {
      profile.acceptedSchools.forEach(school => {
        const normalizedName = normalizeSchoolName(school);
        
        if (normalizedName) {
          const schoolId = createSchoolId(normalizedName);
          if (schoolsMap.has(normalizedName)) {
            const schoolData = schoolsMap.get(normalizedName);
            
            // Add profile to this school if not already included
            if (!schoolData.profiles.includes(profile.id)) {
              schoolData.profiles.push(profile.id);
              schoolData.count += 1;
              
              // Add GPA and MCAT for stats calculation
              if (profile.gpa) schoolData.gpas.push(parseFloat(profile.gpa));
              if (profile.mcat) schoolData.mcats.push(parseInt(profile.mcat));
            }
          } else {
            // Create new school entry
            schoolsMap.set(normalizedName, {
              id: schoolId,
              name: normalizedName,
              count: 1,
              profiles: [profile.id],
              gpas: profile.gpa ? [parseFloat(profile.gpa)] : [],
              mcats: profile.mcat ? [parseInt(profile.mcat)] : []
            });
          }
        }
      });
    }
  });
  
  // Calculate statistics for each school
  const schools = Array.from(schoolsMap.values()).map(school => {
    // Calculate average GPA
    const avgGPA = school.gpas.length > 0 
      ? (school.gpas.reduce((sum, gpa) => sum + gpa, 0) / school.gpas.length).toFixed(2)
      : "N/A";
    
    // Calculate average MCAT
    const avgMCAT = school.mcats.length > 0
      ? Math.round(school.mcats.reduce((sum, mcat) => sum + mcat, 0) / school.mcats.length)
      : "N/A";
    
    // Use static acceptance rate for now (would need real data)
    const acceptanceRate = "3.7%";
    
    // Remove calculation arrays from final object
    const { gpas, mcats, ...schoolData } = school;
    
    return {
      ...schoolData,
      avgGPA,
      avgMCAT,
      acceptanceRate
    };
  });
  
  return schools;
};

// Get profiles for a specific school
export const getProfilesForSchool = (profiles, schoolId, schools) => {
  // Find the school by ID
  const school = schools.find(s => s.id === schoolId);
  
  if (!school) return [];
  
  // Get the normalized school name
  const schoolName = school.name;
  
  // Find all profiles accepted to this school
  return profiles.filter(profile => 
    profile.acceptedSchools && 
    profile.acceptedSchools.some(acceptedSchool => {
      const normalizedAcceptedSchool = normalizeSchoolName(acceptedSchool);
      return normalizedAcceptedSchool === schoolName;
    })
  );
};

// Group profiles by type (biomedical, non-trad, etc.)
export const groupProfilesByType = (profiles) => {
  const groups = {};
  
  profiles.forEach(profile => {
    const type = profile.type || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(profile);
  });
  
  return groups;
};

const profileDataUtils = {
  loadProfiles,
  loadSchools,
  loadProfilesAndGenerateSchools,
  filterProfiles,
  groupProfilesByType,
  extractSchools,
  getProfilesForSchool,
  normalizeSchoolName
};

export default profileDataUtils;