import { Socket } from 'socket.io-client';
import type { Conversation,Message } from "./chat";
import type { User, Friend, FriendRequest } from "./user";

export interface AuthStore{
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  isCheckingAuth: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signUp:(
    username: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;

  logIn:(
    email: string,
    password:string,
  ) => Promise<boolean>;

  logOut: () => Promise<void>;

  fetchMe: () => Promise<void>;

  refresh: () => Promise<boolean>;
  checkAuth: () => Promise<void>; 

  updateProfile: (data: { username: string; bio?: string; avatar?: string }) => Promise<void>;
}

export interface ThemeState {
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export interface ChatState {
  conversations: Conversation[];
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
  isLoadingRequests: boolean;
  messages: Record<string, {
    items: Message[],
    hasMore: boolean,
    nextCursor?: string | null;
  }>
  activeConversationId: string | null;
  convoLoading: boolean;
  messageLoading: boolean;
  reset: () => void;
  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?   : string) => Promise<void>;
  fetchFriends: () => Promise<void>;
  createDirectConversation: (recipientId: string) => Promise<Conversation | undefined>;
  createGroupConversation: (name: string, members: string[]) => Promise<void>;
  accessConversation: (userId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: "TEXT" | "IMAGE", imgUrl?: string) => Promise<void>;
  sendImageMessage: (conversationId: string, file: File) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  setOnlineUsers: (userIds: string[]) => void;
  onlineUserIds: string[];
  isSearching: boolean;
  setSearching: (isSearching: boolean) => void;
  
  // Friend Request Actions
  sendFriendRequest: (receiverId: string, message?: string) => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  addFriendRequest: (request: FriendRequest) => void;

  //add message
  addMessage: ( message: Message) => Promise<void>;
  //update convo
  updateConversation: (conversation: Conversation) => Promise<void>;
  
  markConversationAsRead: (conversationId: string) => Promise<void>;
  onConversationSeen: (conversationId: string, userId: string, lastSeenAt: Date) => void;
  onNewConversation: (conversation: Conversation) => void;
  onFriendRequestAccepted: (request: any) => void;
}

export interface SocketState {
  socket: Socket | null;
  connectedSocket: () => void;
  disconnectedSocket: () => void;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  joinConversation: (conversationId: string) => void;
}