import axios from 'axios';

// Base URL — points to your backend
const API = axios.create({
   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Interceptor — automatically adds token to every request
// So you don't manually add Authorization header every time
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth routes
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);

// Calculation routes
export const calculate        = (data) => API.post('/calculations', data);
export const getCalculations  = ()     => API.get('/calculations');
export const getCalculation   = (id)   => API.get(`/calculations/${id}`);
export const deleteCalculation= (id)   => API.delete(`/calculations/${id}`);