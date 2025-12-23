import api from "@/lib/api"

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
    const res = await api.post("/auth/refresh", {}, { withCredentials: true });
    return res.data.access_token;
  }

}