import api from "@/lib/api";
import type { ConversationResponse,Message } from "@/types/chat";

interface FetchMessageProps{
  message: Message[];
  cursor?: string;
}

const pageLimit = 50;

export const chatService = {
  async fetchConversations(): Promise<ConversationResponse>{
    const res = await api.get("/conversations");
    // Safety check for nested structure:
    // 1. Axios gives 'data'
    // 2. TransformInterceptor gives 'data'
    // 3. ConversationService gives 'data' (array)
    // Try to access it safely
    const conversationsData = res.data?.data?.data || res.data?.data || []; 
    return {
      conversations: Array.isArray(conversationsData) ? conversationsData : []
    };
  },

  async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> { 
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`);
      
    // Handle potentially nested data structure (e.g., { data: { message: [], meta: ... } })
    const responseData = res.data?.data || res.data;
    
    return { 
      message: Array.isArray(responseData?.message) ? responseData.message : [], 
      cursor: responseData?.meta?.nextCursor 
    };
  },

  /**
   * dùng để tạo cuộc trò chuyện direct với bạn bè
   * dùng khi mới kết bạn chưa có cuộc trò chuyền nào 
   */
  async createDirectConversation(recipientId: string) {
    const res = await api.post(`/conversations/direct`, {
      receiverId: recipientId
    });
    return res.data.data;
  },

  /**
   * dùng khi tạo mới một cuộc trò chuyện
   * Used when initializing a new group chat context.
   */
  async createGroupConversation(name: string, members: string[]) {
    const res = await api.post(`/conversations/group`, {
      name, 
      memberIds: members
    });
    return res.data.data;
  },

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.url;
  },

  async sendMessage(conversationId: string, content: string, type: "TEXT" | "IMAGE" = "TEXT", imgUrl?: string) {
    const res = await api.post(`/messages`, {
      conversationId,
      content,
      type,
      imgUrl
    });
    return res.data.data;
  },

  async markAsRead(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}`);
    return res.data;
  }
}


