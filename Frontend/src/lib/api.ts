import axios from 'axios';

// URL của Backend NestJS (mặc định thường là 3000 hoặc 3001)
const API_URL = 'http://localhost:8080/api/v1'; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Hoặc lấy từ Cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;