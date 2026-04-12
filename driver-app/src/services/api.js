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
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

export const attendanceAPI = {
  markByQR: (qrContent, busId) => api.post('/attendance/mark/qr', { qrContent, busId }),
  getTodayAttendance: (busId) => api.get('/attendance', {
    params: { busId, date: new Date().toISOString().split('T')[0] }
  }),
};

export const gpsAPI = {
  logLocation: (busId, latitude, longitude, speed) =>
    api.post('/gps/log', { busId, latitude, longitude, speed }),
};

export const busesAPI = {
  getById: (id) => api.get(`/buses/${id}`),
  getAll: () => api.get('/buses'),
};

export const studentsAPI = {
  getByBus: (busId) => api.get('/students', { params: { busId } }),
};

export default api;
