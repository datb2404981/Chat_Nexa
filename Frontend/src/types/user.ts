export interface User{
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Friend{
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
  };
  senderId?: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
  };
  receiverId?: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
  message?: string;
}

export interface UserSearchResult extends User {
  type: 'user';
}

export interface GroupSearchResult {
  _id: string;
  name: string;
  avatar?: string;
  type: 'group';
  members?: any[];
}

export type SearchResult = UserSearchResult | GroupSearchResult;