import api from "@/lib/api"
import axios from "axios";

// Helper to get API URL consistently
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const authService = {
  signUp: async (username: string, email: string, password: string) => {
    const res = await api.post("/auth/register", {
      username,
      email,
      password,
    }, { withCredentials: true });
    return res.data;
  },

  logIn: async (email: string, password: string) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    }, { withCredentials: true });
    return res.data; //access token
  },

  logOut: async () => {
    return await api.post("/auth/logout", {}, { withCredentials: true });
  },

  fetchMe: async () => {
    const res = await api.get("/users/me", { withCredentials: true });
    return res.data.data;
  },

  refresh: async () => {
     // Use raw axios to bypass interceptors that might attach old token
    const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
    // Handle nested response structure flexibility
    const data = res.data;
    return data.data?.access_token || data.data?.accessToken || data.access_token || data.accessToken;
  }
}