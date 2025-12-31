import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatAppPage from './pages/ChatAppPage';
import { Toaster } from "sonner";
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useThemeStore } from './store/useThemeStore';
import { useSocketStore } from './store/useSocketStore';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Loader } from 'lucide-react';

// Component helpers to handle navigation inside Router context
const NavHandler = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
      navigate('/');
    }
  }, [user, location.pathname, navigate]);

  return null;
};

export default function App() {
  const { theme } = useThemeStore();
  const { isCheckingAuth, checkAuth, user } = useAuthStore();
  const { connectedSocket, disconnectedSocket } = useSocketStore();
  
  useOnlineStatus();

  // Apply theme on mount and change
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const applySystemTheme = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      };

      applySystemTheme();

      // Listen for system changes
      mediaQuery.addEventListener('change', applySystemTheme);

      return () => mediaQuery.removeEventListener('change', applySystemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  useEffect(() => {  
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {  
    if (user) {
      connectedSocket();
    }
    return () => disconnectedSocket();
  }, [user, connectedSocket, disconnectedSocket]);

  if (isCheckingAuth && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <NavHandler />
        <Routes>
          {/* public routers*/}
          <Route
            path='/login'
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path='/signup'
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />

          {/* protectect routers*/}
          <Route element={<ProtectedRoute />}>
            <Route
              path='/'
              element={<ChatAppPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
