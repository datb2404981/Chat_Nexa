import type { User } from "./user";

export interface AuthStore{
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;

  signUp:(
    username: string,
    email: string,
    password: string,
  ) => Promise<boolean>;

  clearState: () => void;

  logIn:(
    email: string,
    password:string,
  ) => Promise<boolean>;

  logOut: () => Promise<boolean>;

  fetchMe: () => Promise<void>;

  refresh: () => Promise<boolean>;

  setAccessToken: (token: string) => void;

}