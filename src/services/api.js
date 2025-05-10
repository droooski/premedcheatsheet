// Base API URL - replace with your actual API endpoint
const API_BASE_URL = 'https://api.premedcheatsheet.com';

// Helper function for making API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Auth API
export const auth = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  forgotPassword: (email) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
};

// Profiles API
export const profiles = {
  getAll: (filters = {}) => apiRequest('/profiles', {
    method: 'GET',
    body: JSON.stringify(filters),
  }),
  
  getById: (profileId) => apiRequest(`/profiles/${profileId}`, {
    method: 'GET',
  }),
  
  getFeatured: () => apiRequest('/profiles/featured', {
    method: 'GET',
  }),
};

// Subscriptions API
export const subscriptions = {
  create: (subscriptionData) => apiRequest('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscriptionData),
  }),
  
  getPlans: () => apiRequest('/subscriptions/plans', {
    method: 'GET',
  }),
};

export default {
  auth,
  profiles,
  subscriptions,
};