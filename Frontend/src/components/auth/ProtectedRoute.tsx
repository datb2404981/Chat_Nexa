// src/components/ProtectedRoute.tsx
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const ProtectedRoute = () => {
  const { accessToken, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting]= useState(true);

  const initAuth = async () => {
    try {
      // Check directly from store to ensure we have latest values (avoiding closure staleness)
      if (!useAuthStore.getState().accessToken) {
        await refresh();
      }

      // If token exists (either from before or after refresh) but no user, fetch user
      if (useAuthStore.getState().accessToken && !useAuthStore.getState().user) {
        await fetchMe();
      }
    } catch (error) {
      console.error("ProtectedRoute: Init failed", error);
    } finally {
        setStarting(false);
    }
  };
  
  useEffect(() => {
    initAuth();
  }, []);

  if (starting || loading) {
    return <div className='flex h-screen items-center justify-center'>Loading...</div>; // Hoặc Component Loading xịn của bạn
  }

  // Check lại lần cuối: Nếu chạy xong hết mà vẫn không có token -> Đá về Login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;