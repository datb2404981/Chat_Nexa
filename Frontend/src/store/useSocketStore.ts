
import type { SocketState } from "@/types/store";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { io, type Socket } from "socket.io-client";
import { useChatStore } from './useChatStore';

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connectedSocket: () => { 
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return;
    const socket: Socket = io(baseURL, {
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    set({ socket })
    socket.on("connect", () => { 
      // console.log("Đã kết nối với Socket");
      
      const { conversations } = useChatStore.getState();
      const { user } = useAuthStore.getState();

      if (user?._id) {
        socket.emit("join_room", user._id);
      }

      conversations.forEach((c) => {
        socket.emit("join_room", c._id);
      });

      get().subscribeToMessages();
    });
  },


  subscribeToMessages: () => {
    const socket = get().socket;
    if (!socket) return;

    socket.off("new_message"); // Prevent duplicate listeners
    socket.on("new_message", ({ message, conversation }) => { 
      // console.log("Socket received new_message:", message);
      // ... existing code ...
      // Normalize senderId and other fields for frontend
      const normalizedMessage = {
        ...message,
        _id: message._id?.toString(),
        senderId: (message.senderID?._id || message.senderID)?.toString(), 
        conversationId: message.conversationId?.toString(),
        createdAt: new Date(message.createdAt).toISOString(),
      };

      useChatStore.getState().addMessage(normalizedMessage);

      if (conversation) {
        useChatStore.getState().updateConversation(conversation);
      }
    });

    socket.off("on_conversation_seen");
    socket.on("on_conversation_seen", ({ conversationId, userId, lastSeenAt }) => {
      useChatStore.getState().onConversationSeen(conversationId, userId, lastSeenAt);
    });

    socket.off("new_friend_request");
    socket.on("new_friend_request", (request) => {
       console.log("Socket received new_friend_request:", request);
       useChatStore.getState().addFriendRequest(request);
    });

    socket.off("friend_request_accepted");
    socket.on("friend_request_accepted", (request) => {
        console.log("Socket received friend_request_accepted:", request);
        useChatStore.getState().onFriendRequestAccepted(request);
    });
  },
  unsubscribeFromMessages: () => {
    const socket = get().socket;
    if (!socket) return;
    socket.off("new_message");
  },

  disconnectedSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  joinConversation: (conversationId: string) => { 
    const socket = get().socket;
    if(socket) {
      socket.emit('join_room', conversationId);
    }
  }
  
}))

// Auto-join rooms when conversations update
useChatStore.subscribe((state) => {
  const socket = useSocketStore.getState().socket;
  const conversations = state.conversations;
  if (socket && conversations && conversations.length > 0) {
    conversations.forEach((c) => socket.emit('join_room', c._id));
  }
});