import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import type { AuthStore } from '@/types/store';

export const useAuthStore = create<AuthStore>((set,get) => ({
  accessToken: localStorage.getItem("accessToken"),
  user: null,
  loading: false,
  error: null,

  clearState: () => {
    set({ accessToken: null, user: null, loading: false, error: null });
  },

  signUp: async (username, email, password) => {
    try {
      set({ loading: true });

      // gọi api
      const res = await authService.signUp(username, email, password);
      const { access_token, user } = res.data;
      set({ accessToken: access_token, user });
      localStorage.setItem("accessToken", access_token);
      get().fetchMe();

      toast.success('Đăng ký thành công');
      return true;
      
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logIn: async (email, password) => {
    try {
      set({ loading: true });

      // gọi api
      const res = await authService.logIn(email, password);
      const { access_token, user } = res.data;
      set({ accessToken: access_token, user });
      localStorage.setItem("accessToken", access_token);
      get().fetchMe();
      
      toast.success('Đăng nhập thành công');
      return true;
      
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logOut: async () => {
    try {
      get().clearState();
      await authService.logOut();
      localStorage.removeItem("accessToken");
      toast.success('Đăng xuất thành công');
      return true;
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Đăng xuất thất bại');
      return false;
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user });
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        set({ user: null, accessToken: null });
        localStorage.removeItem("accessToken"); // Ensure local storage is also cleared
      }
      toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại!");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const access_token = await authService.refresh();
      get().setAccessToken(access_token);
      localStorage.setItem("accessToken", access_token); // Explicitly set it here too
      if (!get().user) {
        await get().fetchMe();
      }
      return true;
    } catch (error: any) {
      console.error("Refresh failed:", error);
      set({ accessToken: null, user: null });
      localStorage.removeItem("accessToken");
      // toast.error("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại!") // Auto check shouldn't toast?
      return false;
    } finally {
      set({ loading: false });
    }
  },

  setAccessToken: (access_token: string) => {
    set({ accessToken: access_token });
  },
}));
