import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) return Promise.reject(error);

    // 🛑 1. DANH SÁCH ĐEN: Các API này lỗi là cho "chết" luôn, không cứu.
    // Thêm '/auth/logout' vào đây là quan trọng nhất để tránh lỗi bạn đang gặp
    const NO_RETRY_URLS = [
        '/auth/login', 
        '/auth/register', 
        '/auth/refresh',
        '/auth/logout' // 👈 THÊM CÁI NÀY
    ];
    
    if (originalRequest.url && NO_RETRY_URLS.some(url => originalRequest.url?.includes(url))) {
      // Nếu API refresh mà lỗi -> Chắc chắn là hết hạn hẳn rồi -> Clear state
      if (originalRequest.url.includes('/auth/refresh')) {
          useAuthStore.getState().logOut(); 
      }
      return Promise.reject(error);
    }

    // 🛑 2. LOGIC REFRESH
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Token hết hạn. Đang thử Refresh...");
        
        // Gọi refresh từ store
        const refreshSuccess = await useAuthStore.getState().refresh();
        
        if (refreshSuccess) {
           const newAccessToken = useAuthStore.getState().accessToken;
           if (newAccessToken) {
              api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
           }
        }
        
        // Refresh thất bại
        useAuthStore.getState().logOut();
        return Promise.reject(error);

      } catch (refreshError) {
        // Refresh lỗi thì logout
        useAuthStore.getState().logOut();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;