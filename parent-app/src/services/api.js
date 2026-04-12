import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user', 'student']);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

export const studentsAPI = {
  getByParentEmail: (email) => api.get('/students', { params: { parentEmail: email } }),
};

export const busesAPI = {
  getById: (id) => api.get(`/buses/${id}`),
  getLocation: (id) => api.get(`/buses/${id}/location`),
};

export const attendanceAPI = {
  getHistory: (studentId, startDate, endDate) =>
    api.get('/attendance/history', { params: { studentId, startDate, endDate } }),
  getStats: (studentId, startDate, endDate) =>
    api.get('/attendance/stats', { params: { studentId, startDate, endDate } }),
};

export const gpsAPI = {
  getCurrentLocation: (busId) => api.get(`/gps/current/${busId}`),
};

export default api;
