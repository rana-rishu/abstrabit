export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  workspaceId: string;
}
