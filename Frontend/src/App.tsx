import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatAppPage from './pages/ChatAppPage';
import { Toaster  } from "sonner";
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return <>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        {/* public routers*/}
        <Route
          path='/login'
          element={<LoginPage />}
        />
        <Route
          path='/signup'
          element={<SignUpPage />}
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
}
