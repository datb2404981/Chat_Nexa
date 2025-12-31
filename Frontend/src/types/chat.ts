

export interface Participant {
  _id: string;
  email: string;
  displayName?: string;
  username?: string;
  avatar?: string | null;
  joinedAt: string;
  status?: "online" | "offline";
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  username?: string;
  avatar?: string | null;
  isOnline?: boolean;
  status?: "online" | "offline";
}

export interface Group {
  name: string;
  createdBy: string;
  avatar?: string | null;
}

export interface LastMessage {
  _id: string;
  content: string;
  createdAt: string;
  sender: {
    _id: string;
    displayName: string;
    avatar?: string | null;
  };
}

export interface Conversation {
  _id: string;
  isGroup: boolean;
  group: Group;
  participants: Participant[];
  lastMessageAt: string;
  readBy: { userId: Participant; lastSeenAt: string }[];
  lastMessage: LastMessage | null;
  unreadCounts: Record<string, number>; // key = userId, value = unread count
  createdAt: string;
  updatedAt: string;
  receiver?: SeenUser;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imgUrl?: string | null;
  type?: "TEXT" | "IMAGE";
  updatedAt?: string | null;
  createdAt: string;
  isOwn?: boolean;
  status?: "sending" | "sent" | "error";
}
