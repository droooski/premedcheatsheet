// src/utils/csvParser.js
import Papa from 'papaparse';

/**
 * Parse the CSV data from the uploaded file
 * @param {File} file - The CSV file to parse
 * @returns {Promise<Array>} - Array of profile objects
 */
export const parseProfilesFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const profiles = processProfileData(results.data);
          resolve(profiles);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Process the raw CSV data into formatted profile objects
 * @param {Array} rawData - The raw data from Papa Parse
 * @returns {Array} - Formatted profile objects
 */
export const processProfileData = (rawData) => {
  return rawData.map((row, index) => {
    // Extract accepted schools into an array
    const acceptedSchools = [];
    if (row['Medical school(s) accepted into']) {
      const schoolsText = row['Medical school(s) accepted into'];
      // Split by commas or line breaks
      const schools = schoolsText.split(/,|\n/).map(s => s.trim()).filter(s => s);
      acceptedSchools.push(...schools);
    }

    // Determine major
    const major = row['Majors and minors during college'] || 'Not specified';
    
    // Determine profile type based on major
    let type = 'other';
    if (major) {
      const majorLower = major.toLowerCase();
      if (majorLower.includes('biomed')) type = 'biomedical';
      else if (majorLower.includes('bio')) type = 'biology';
      else if (majorLower.includes('chem')) type = 'chemistry';
      else if (majorLower.includes('neuro')) type = 'neuroscience';
      else if (majorLower.includes('psych')) type = 'psychology';
      // For non-trad, check how many gap years they had
      else if (row['How many gap years?'] && parseInt(row['How many gap years?']) > 0) type = 'non-trad';
    }
    
    // Build background items
    const backgroundItems = [];
    if (major) backgroundItems.push(`Major: ${major}`);
    
    if (row['List research experiences and approximate hours']) {
      backgroundItems.push(`Research: ${row['List research experiences and approximate hours']}`);
    }
    
    if (row['List paid medical employment activities and approximate hours']) {
      backgroundItems.push(`Clinical Experience: ${row['List paid medical employment activities and approximate hours']}`);
    }
    
    if (row['List shadowing experiences and approximate hours']) {
      backgroundItems.push(`Shadowing: ${row['List shadowing experiences and approximate hours']}`);
    }
    
    if (row['List medical volunteer activities and approximate hours']) {
      backgroundItems.push(`Medical Volunteering: ${row['List medical volunteer activities and approximate hours']}`);
    }
    
    if (row['List non-medical volunteer activities and approximate hours']) {
      backgroundItems.push(`Non-Medical Volunteering: ${row['List non-medical volunteer activities and approximate hours']}`);
    }
    
    if (row['List leadership activities and approximate hours']) {
      backgroundItems.push(`Leadership: ${row['List leadership activities and approximate hours']}`);
    }
    
    if (row['List any awards/honors/scholarships/publications earned in UG']) {
      backgroundItems.push(`Awards: ${row['List any awards/honors/scholarships/publications earned in UG']}`);
    }
    
    // Extract reflections
    const reflections = [];
    if (row['Reflections during the pre-med process and things you learned']) {
      reflections.push(row['Reflections during the pre-med process and things you learned']);
    }
    
    // Create the profile object
    return {
      id: `profile-${index}`,
      type,
      title: type === 'non-trad' ? 'Non-Traditional Applicant' : `${major} Student`,
      gender: row['Gender'] || 'Not specified',
      ethnicity: row['Racial Self-Identification'] || 'Not specified',
      state: row['State of residency during application process'] || 'Not specified',
      year: row['Medical school matriculation year'] || new Date().getFullYear().toString(),
      gpa: typeof row['Undergraduate GPA'] === 'number' ? row['Undergraduate GPA'].toFixed(2) : (row['Undergraduate GPA'] || 'N/A'),
      sgpa: 'N/A', // Science GPA isn't directly in your CSV
      mcat: row['Cumulative MCAT Score'] ? row['Cumulative MCAT Score'].toString() : 'N/A',
      mcatBreakdown: row['MCAT Subsection Scores (If remember)'] || 'N/A',
      acceptedSchools,
      backgroundItems,
      reflections
    };
  });
};

/**
 * Load profiles from a CSV file path
 * @returns {Promise<Array>} - Array of profile objects
 */
export const loadProfilesFromCSV = async () => {
  try {
    // Path to the CSV file - this should be the correct public path
    const csvPath = '/assets/data/Copy of Applicant Profiles (Responses) - Reimbursed Responses.csv';
    
    console.log("Attempting to fetch CSV from:", csvPath);
    
    // Fetch the CSV file
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log("CSV file fetched successfully, length:", csvText.length);
    
    // Add debug log to see first part of CSV
    console.log("CSV preview:", csvText.substring(0, 200));
    
    // Parse the CSV text
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            console.log('CSV Parse Results - Headers:', results.meta.fields);
            console.log('CSV Parse Results - Row count:', results.data.length);
            
            if (results.data.length === 0) {
              console.warn("CSV parsed but no data rows found");
              resolve([]);
              return;
            }
            
            // Log the first row to help debug field mapping
            console.log('First data row sample:', JSON.stringify(results.data[0]).substring(0, 300));
            
            const profiles = processProfileData(results.data);
            console.log(`Processed ${profiles.length} profiles from CSV`);
            resolve(profiles);
          } catch (error) {
            console.error('Error processing CSV data:', error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV file:', error);
    return [];
  }
};

/**
 * Get all unique schools from profiles data
 * @param {Array} profiles - The processed profile objects
 * @returns {Array} - Array of school objects
 */
export const extractSchoolsFromProfiles = (profiles) => {
  // Create a map to store schools and the count of profiles for each
  const schoolsMap = new Map();
  
  // Extract schools from profiles
  profiles.forEach(profile => {
    if (profile.acceptedSchools && profile.acceptedSchools.length > 0) {
      profile.acceptedSchools.forEach(school => {
        const schoolName = school.trim();
        if (schoolName) {
          if (schoolsMap.has(schoolName)) {
            schoolsMap.set(schoolName, schoolsMap.get(schoolName) + 1);
          } else {
            schoolsMap.set(schoolName, 1);
          }
        }
      });
    }
  });
  
  // Convert the map to an array of school objects
  const schools = Array.from(schoolsMap.entries()).map(([name, profileCount], index) => {
    return {
      id: `school-${index}`,
      name,
      profileCount,
      // Default values for other fields
      description: `${name} is a medical school with ${profileCount} accepted student profiles in our database.`,
      logoUrl: null,
      acceptanceRate: 'N/A',
      avgGPA: calculateAvgGPA(profiles, name),
      avgMCAT: calculateAvgMCAT(profiles, name),
      website: null
    };
  });
  
  return schools;
};

/**
 * Calculate average GPA for profiles accepted to a particular school
 * @param {Array} profiles - The processed profile objects
 * @param {string} schoolName - The name of the school
 * @returns {string} - The average GPA as a string
 */
const calculateAvgGPA = (profiles, schoolName) => {
  const matchingProfiles = profiles.filter(profile => 
    profile.acceptedSchools.some(school => school.trim() === schoolName)
  );
  
  if (matchingProfiles.length === 0) return 'N/A';
  
  const validGPAs = matchingProfiles
    .filter(profile => typeof profile.gpa === 'number' || (typeof profile.gpa === 'string' && !isNaN(parseFloat(profile.gpa))))
    .map(profile => typeof profile.gpa === 'number' ? profile.gpa : parseFloat(profile.gpa));
  
  if (validGPAs.length === 0) return 'N/A';
  
  const sum = validGPAs.reduce((total, gpa) => total + gpa, 0);
  return (sum / validGPAs.length).toFixed(2);
};

/**
 * Calculate average MCAT for profiles accepted to a particular school
 * @param {Array} profiles - The processed profile objects
 * @param {string} schoolName - The name of the school
 * @returns {string} - The average MCAT as a string
 */
const calculateAvgMCAT = (profiles, schoolName) => {
  const matchingProfiles = profiles.filter(profile => 
    profile.acceptedSchools.some(school => school.trim() === schoolName)
  );
  
  if (matchingProfiles.length === 0) return 'N/A';
  
  const validMCATs = matchingProfiles
    .filter(profile => typeof profile.mcat === 'number' || (typeof profile.mcat === 'string' && !isNaN(parseInt(profile.mcat))))
    .map(profile => typeof profile.mcat === 'number' ? profile.mcat : parseInt(profile.mcat));
  
  if (validMCATs.length === 0) return 'N/A';
  
  const sum = validMCATs.reduce((total, mcat) => total + mcat, 0);
  return Math.round(sum / validMCATs.length).toString();
};

/**
 * Filter profiles based on search query and filter criteria
 * @param {Array} profiles - All profiles
 * @param {string} searchQuery - Search query
 * @param {Object} filterCriteria - Filter criteria
 * @returns {Array} - Filtered profiles
 */
export const filterProfiles = (profiles, searchQuery, filterCriteria) => {
  let filtered = [...profiles];
  
  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(profile => 
      profile.title?.toLowerCase().includes(query) ||
      profile.type?.toLowerCase().includes(query) ||
      profile.state?.toLowerCase().includes(query) ||
      (profile.backgroundItems && profile.backgroundItems.some(item => item.toLowerCase().includes(query))) ||
      (profile.acceptedSchools && profile.acceptedSchools.some(school => school.toLowerCase().includes(query)))
    );
  }
  
  // Apply major filters
  if (filterCriteria.majors && filterCriteria.majors.length > 0) {
    filtered = filtered.filter(profile => 
      filterCriteria.majors.includes(profile.type)
    );
  }
  
  // Apply GPA filters
  if (filterCriteria.gpaRanges && filterCriteria.gpaRanges.length > 0) {
    filtered = filtered.filter(profile => {
      const gpa = parseFloat(profile.gpa);
      if (isNaN(gpa)) return false;
      
      return filterCriteria.gpaRanges.some(range => {
        const [min, max] = range.split('-').map(parseFloat);
        return gpa >= min && gpa <= max;
      });
    });
  }
  
  // Apply MCAT filters
  if (filterCriteria.mcatRanges && filterCriteria.mcatRanges.length > 0) {
    filtered = filtered.filter(profile => {
      const mcat = parseInt(profile.mcat);
      if (isNaN(mcat)) return false;
      
      return filterCriteria.mcatRanges.some(range => {
        if (range.includes('+')) {
          const min = parseInt(range.replace('+', ''));
          return mcat >= min;
        } else {
          const [min, max] = range.split('-').map(parseInt);
          return mcat >= min && mcat <= max;
        }
      });
    });
  }
  
  return filtered;
};

/**
 * Filter and sort schools based on search query and sort option
 * @param {Array} schools - All schools
 * @param {string} searchQuery - Search query
 * @param {string} sortOption - Sort option
 * @returns {Array} - Filtered and sorted schools
 */
export const filterAndSortSchools = (schools, searchQuery, sortOption) => {
  let filtered = [...schools];
  
  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(school => 
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply sorting
  if (sortOption === 'alphabetical') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'alphabetical-reverse') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortOption === 'profiles-desc') {
    filtered.sort((a, b) => b.profileCount - a.profileCount);
  } else if (sortOption === 'profiles-asc') {
    filtered.sort((a, b) => a.profileCount - b.profileCount);
  } else if (sortOption === 'acceptance-desc') {
    filtered.sort((a, b) => {
      const aRate = parseFloat(a.acceptanceRate?.replace('%', '') || 0);
      const bRate = parseFloat(b.acceptanceRate?.replace('%', '') || 0);
      return bRate - aRate;
    });
  } else if (sortOption === 'acceptance-asc') {
    filtered.sort((a, b) => {
      const aRate = parseFloat(a.acceptanceRate?.replace('%', '') || 0);
      const bRate = parseFloat(b.acceptanceRate?.replace('%', '') || 0);
      return aRate - bRate;
    });
  }
  
  return filtered;
};

export default {
  parseProfilesFromCSV,
  processProfileData,
  loadProfilesFromCSV,
  extractSchoolsFromProfiles,
  filterProfiles,
  filterAndSortSchools
};