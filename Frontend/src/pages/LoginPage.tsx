
import { LoginForm } from '@/components/auth/login-form'
import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuthStore();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      refresh()
        .then((success) => {
          // Nếu refresh thành công (true), redirect về home
          toast.success("Đăng nhập thành công!");
          if (success) {
            navigate("/");
          } else {
             // Refresh thất bại (false), user ở lại đây
              console.error("Login success param present, but refresh failed.");
          }
        })
        .catch((err) => {
          console.error("Auto login error", err);
        });
    }
  }, [searchParams, refresh, navigate]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage