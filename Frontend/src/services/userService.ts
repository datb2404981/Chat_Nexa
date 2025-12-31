import api from "@/lib/api";
import type { Friend, SearchResult } from "@/types/user";

export const userService = {
  getFriends: async (): Promise<Friend[]> => {
    const res = await api.get("/friends");
    // Handle potential response structures (standard vs wrapped)
    const friends = res.data?.data || res.data || [];
    return Array.isArray(friends) ? friends : [];
  },

  searchUsers: async (query: string): Promise<SearchResult[]> => {
    if (!query) return [];
    const res = await api.get(`/users/search?username=${encodeURIComponent(query)}`);
    // Handle potential response structures
    const results = res.data?.data || res.data || [];
    return Array.isArray(results) ? results : [];
  },

  searchNewFriend: async (query: string): Promise<SearchResult[]> => {
    if (!query) return [];
    const res = await api.get(`/users/search-new-friends?keyword=${encodeURIComponent(query)}`);
    // Handle potential response structures
    const results = res.data?.data || res.data || [];
    return Array.isArray(results) ? results : [];
  },

  sendFriendRequest: async (receiverId: string, message?: string): Promise<void> => {
    await api.post("/friends/request", { receiverId, message });
  },

  fetchFriendRequests: async (): Promise<any> => {
    const res = await api.get("/friends/requests");
    return res.data?.data || res.data;
  },
  
  acceptFriendRequest: async (requestId: string): Promise<void> => {
    await api.patch(`/friends/requests/${requestId}/accept`);
  },

  declineFriendRequest: async (requestId: string): Promise<void> => {
    await api.patch(`/friends/requests/${requestId}/decline`);
  },

  cancelFriendRequest: async (requestId: string): Promise<void> => {
    // Assuming backend endpoint for cancelling by Request ID
    await api.delete(`/friends/requests/${requestId}`);
  },

  updateFriendRequestMessage: async (receiverId: string, message: string): Promise<void> => {
    await api.patch("/friends/request/message", { receiverId, message });
  },

  updateProfile: async (data: { username: string; bio?: string; avatar?: string }): Promise<any> => {
    const res = await api.patch("/users/profile", data);
    return res.data;
  }
}

