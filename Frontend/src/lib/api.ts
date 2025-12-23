import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// 1. Cấu hình Base URL (Ưu tiên lấy từ biến môi trường, fallback về localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Mở rộng type cho Axios Request để thêm cờ _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ⚠️ Bắt buộc phải có để gửi/nhận Cookie HttpOnly
});

// =================================================================
// 2. REQUEST INTERCEPTOR: Gắn Token vào mọi request
// =================================================================
api.interceptors.request.use(
  (config) => {
    // Luôn lấy token mới nhất từ localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =================================================================
// 3. RESPONSE INTERCEPTOR: Xử lý Auto Refresh Token
// =================================================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Nếu không có request config (lỗi mạng lạ) thì reject luôn
    if (!originalRequest) return Promise.reject(error);

    // 🛑 DANH SÁCH ĐEN: Các API không bao giờ được phép refresh
    // (Tránh trường hợp login sai pass mà nó cứ đi refresh mãi)
    const NO_RETRY_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/refresh-token'];
    
    if (originalRequest.url && NO_RETRY_URLS.some(url => originalRequest.url?.includes(url))) {
      return Promise.reject(error);
    }

    // ✅ LOGIC REFRESH: Chỉ chạy khi lỗi 401 (Unauthorized) và chưa từng retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log(`🔒 401 Error from: ${originalRequest.url}`); // Debug Log
      originalRequest._retry = true; // Đánh dấu đã thử retry 1 lần

      try {
        console.log("🔄 Access Token hết hạn. Đang lấy lại token mới...");

        // 1. Gọi API Refresh (Cookie HttpOnly sẽ tự động được gửi kèm)
        // 👇 Check lại URL backend của bạn xem là 'refresh' hay 'refresh-token' nhé
        const { data } = await api.post('/auth/refresh'); 
        
        // Cần check kỹ cấu trúc response (do có TransformInterceptor)
        // Nếu bọc trong data: { data: { access_token: ... } }
        const newAccessToken = data.data?.access_token || data.data?.accessToken || data.access_token || data.accessToken;

        if (newAccessToken) {
          // 2. Lưu token mới vào LocalStorage & Store ngay lập tức
          localStorage.setItem('accessToken', newAccessToken);
          useAuthStore.getState().setAccessToken(newAccessToken);

          // 3. Cập nhật header cho request đang bị lỗi
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 4. Gọi lại request cũ
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Refresh Token hết hạn hoặc không hợp lệ. Logout ngay.");
        
        // Refresh thất bại (Cookie hết hạn 7 ngày) -> Logout user
        useAuthStore.getState().logOut(); // Hoặc clearState()
        localStorage.removeItem('accessToken');
        
        // (Tuỳ chọn) Chuyển hướng về trang login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Các lỗi khác (400, 403, 500...) thì trả về lỗi bình thường cho UI xử lý
    return Promise.reject(error);
  }
);

export default api;