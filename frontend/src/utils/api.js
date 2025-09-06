import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (email, password) => 
    api.post('/user/signin', { email, password }),
  
  register: (email, password, name, confirmPassword) => 
    api.post('/user/signup', { email, password, name, confirmPassword }),
};

const BASE_URL = "http://localhost:3000/user";

export const usageAPI = {
  getCurrentUsage: () => axios.get(`${BASE_URL}/getCurrentUsage`, {
    headers: { token: localStorage.getItem("token") }
  }),
  getWeeklyDurations: () => axios.get(`${BASE_URL}/getdurations`, {
    headers: { token: localStorage.getItem("token") }
  }),
  getGeminiInsights: () => axios.get(`${BASE_URL}/gemini-hi`, {
    headers: { token: localStorage.getItem("token") }
  }),
  getProductivityAnalysis: () => axios.get(`${BASE_URL}/gemini-productivity`, {
    headers: { token: localStorage.getItem("token") }
  }),
  getWeeklyFocusAnalysis: () => axios.get(`${BASE_URL}/gemini-weekly-focus`, {
    headers: { token: localStorage.getItem("token") }
  })
};

export default api;
