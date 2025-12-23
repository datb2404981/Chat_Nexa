// src/components/ProtectedRoute.tsx
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const ProtectedRoute = () => {
  const { accessToken, user, refresh, fetchMe } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Nếu đã có token và user trong store -> Ngon, vào luôn
      if (accessToken && user) {
        setIsChecking(false);
        return;
      }

      // 2. Nếu chưa có, thử refresh token (lấy từ Cookie)
      // Lưu ý: Đảm bảo hàm refresh trong store trả về true/false hoặc token
      const newToken = await refresh(); 

      if (newToken) {
        // 3. Nếu refresh thành công -> Lấy thông tin User
        // Lúc này axios interceptor (đã config ở api.ts) sẽ tự lấy token từ localStorage
        await fetchMe();
      }
      
      // 4. Kết thúc kiểm tra
      setIsChecking(false);
    };

    initAuth();
  }, []); // Chỉ chạy 1 lần khi mount

  if (isChecking) {
    return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Hoặc Component Loading xịn của bạn
  }

  // Check lại lần cuối: Nếu chạy xong hết mà vẫn không có token -> Đá về Login
  if (!useAuthStore.getState().accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;