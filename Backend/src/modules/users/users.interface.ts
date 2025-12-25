// Định nghĩa Interface thuần (Clean Data)
export interface IUser {
  _id: string;
  email: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  role?: string;
  // Không có hàm .save() ở đây
}