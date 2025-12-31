import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { authService } from '@/services/authService'; // Đảm bảo đường dẫn đúng
import { useChatStore } from './useChatStore';
import type { AuthStore } from '@/types/store'; // Đảm bảo type khớp

// Singleton promise to prevent multiple refresh calls (e.g. strict mode, parallel requests)
let refreshPromise: Promise<boolean> | null = null;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // =========================================
      // 1. INITIAL STATE
      // =========================================
      user: null,
      accessToken: null,
      loading: false,
      isCheckingAuth: true,
      error: null,
      isAuthenticated: false, // Thêm flag này để dễ check ở App.tsx

      // =========================================
      // 2. AUTH ACTIONS (Login/Register)
      // =========================================
      signUp: async (username, email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.signUp(username, email, password);
          // Giả sử API trả về { data: { access_token, user } }
          const { access_token, user } = res.data;

          set({ accessToken: access_token, user, isAuthenticated: true });
          
          toast.success('Đăng ký thành công');
          return { success: true };
        } catch (error: any) {
          const message = error.response?.data?.message || 'Đăng ký thất bại';
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ loading: false });
        }
      },

      logIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // Reset chat store trước khi login mới
          useChatStore.getState().reset(); 

          const res = await authService.logIn(email, password);
          const { access_token, user } = res.data;

          // Cập nhật state
          set({ accessToken: access_token, user, isAuthenticated: true });
          
          // Fetch dữ liệu cần thiết sau khi login
          useChatStore.getState().fetchConversations();
          useChatStore.getState().fetchFriends();

          toast.success('Đăng nhập thành công');
          return true;
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Đăng nhập thất bại';
          toast.error(msg);
          set({ error: msg });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      // =========================================
      // 3. LOGOUT & CLEANUP
      // =========================================
      logOut: async () => {
        // 1. Xóa state Client NGAY LẬP TỨC (để UI chuyển về Login ko bị delay)
        set({ user: null, accessToken: null, isAuthenticated: false, error: null });
        useChatStore.getState().reset();
        localStorage.removeItem('chat-storage'); // Xóa cache chat
        
        try {
          // 2. Gọi API để Server xóa Cookie (Fire & Forget)
          // Không quan tâm kết quả vì Client đã logout rồi
          await authService.logOut();
          toast.success('Đăng xuất thành công');
        } catch (error) {
          // Token hết hạn thì API logout sẽ lỗi 401, ta kệ nó
          console.log("Logout server side failed (likely session expired).");
        }
      },

      // =========================================
      // 4. CHECK AUTH & REFRESH FLOW
      // =========================================
      checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
          const { accessToken } = get();

          // 1. Nếu chưa có token (F5 hoặc lần đầu vào), thử Refresh (Silent Login)
          if (!accessToken) {
            console.log("⚪ [CheckAuth] No token found, attempting silent login...");
            const success = await get().refresh();
            if (success) {
               await get().fetchMe();
            }
            return;
          }

          // 2. Nếu đã có token, verify bằng cách fetchMe
          // (Nếu token hết hạn, Interceptor sẽ xử lý refresh tự động)
          console.log("🟢 [CheckAuth] Token found, verifying...");
          await get().fetchMe();

        } catch (error) {
          console.log("🔴 [CheckAuth] Failed:", error);
          get().logOut();
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      refresh: async () => {
        // 1. If a refresh is already in progress, return the existing promise
        if (refreshPromise) {
            console.log("⚠️ Refresh already in progress, waiting...");
            return refreshPromise;
        }

        // 2. Create a new refresh logic wrapper
        refreshPromise = (async () => {
            try {
              const data = await authService.refresh();
              
              // Correctly handle token string or object
              const newAccessToken = typeof data === 'string' ? data : (data?.accessToken || data?.access_token);

              if (newAccessToken) {
                  set({ accessToken: newAccessToken, isAuthenticated: true });
                  return true;
              }
              return false;
            } catch (error) {
              console.error("Refresh Token failed:", error);
              set({ accessToken: null, user: null, isAuthenticated: false });
              return false;
            } finally {
              // 3. Reset promise when done so future calls can happen
              refreshPromise = null;
            }
        })();

        return refreshPromise;
      },

      fetchMe: async () => {
        try {
            const user = await authService.fetchMe();
            set({ user, isAuthenticated: true });
        } catch (error) {
            throw error; // Ném lỗi để checkAuth bắt được và xử lý
        }
      },

      // =========================================
      // 5. PROFILE & UTILS
      // =========================================
      updateProfile: async (data: any) => {
        set({ loading: true });
        try {
          // Dynamic import to avoid dependency cycle
          const { userService } = await import('@/services/userService');
          
          await userService.updateProfile(data);
           
          // Force refresh user data from server to ensure complete sync
          await get().fetchMe();
          
          toast.success("Cập nhật hồ sơ thành công!");
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Cập nhật thất bại';
          toast.error(msg);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage', // Tên Key trong LocalStorage
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }), // Chỉ lưu token và user
    }
  )
);