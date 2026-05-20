// Unified auth types for all adapters
export interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

export interface Session {
  user: User;
  token?: string;
  expires?: string;
  expiresAt?: string | null;
  [key: string]: any;
}

export interface AuthAdapter {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  refreshSession?(): Promise<Session | null>;
}
