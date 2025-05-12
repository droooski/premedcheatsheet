// src/utils/profilesData.js
/**
 * Helper utility for loading and working with profile data
 */

// Load the profiles data from JSON file
export const loadProfiles = async () => {
  try {
    const response = await fetch('/data/applicant-profiles.json');
    if (!response.ok) {
      throw new Error(`Failed to load profiles: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Loaded ${data.length} profiles from JSON`);
    return data;
  } catch (error) {
    console.error('Error loading profiles:', error);
    // Return an empty array as fallback
    return [];
  }
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

// Extract all schools with their correct profile counts
export const getSchoolsWithProfileCounts = (profiles) => {
  const schoolCountMap = new Map();
  
  // Count profiles per school
  profiles.forEach(profile => {
    if (profile.acceptedSchools && Array.isArray(profile.acceptedSchools)) {
      profile.acceptedSchools.forEach(schoolName => {
        const normalizedName = schoolName.trim().toLowerCase();
        if (normalizedName) {
          const count = schoolCountMap.get(normalizedName) || 0;
          schoolCountMap.set(normalizedName, count + 1);
        }
      });
    }
  });
  
  return schoolCountMap;
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

// Extract all schools from profiles
export const extractSchools = (profiles) => {
  const schoolsMap = new Map();
  
  profiles.forEach(profile => {
    if (profile.acceptedSchools && Array.isArray(profile.acceptedSchools)) {
      profile.acceptedSchools.forEach(school => {
        const schoolName = school.trim();
        if (schoolName) {
          if (schoolsMap.has(schoolName)) {
            schoolsMap.set(
              schoolName, 
              { 
                ...schoolsMap.get(schoolName),
                count: schoolsMap.get(schoolName).count + 1,
                profiles: [...schoolsMap.get(schoolName).profiles, profile.id]
              }
            );
          } else {
            schoolsMap.set(
              schoolName, 
              { 
                id: `school-${schoolsMap.size}`,
                name: schoolName,
                count: 1,
                profiles: [profile.id]
              }
            );
          }
        }
      });
    }
  });
  
  return Array.from(schoolsMap.values());
};

export default {
  loadProfiles,
  filterProfiles,
  groupProfilesByType,
  extractSchools
};