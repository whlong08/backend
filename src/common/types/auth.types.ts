export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  bio?: string;
  total_points: number;
  level: number;
  experience: number;
  subject?: string;
  created_at: Date;
  updated_at: Date;
  last_active: Date;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}
