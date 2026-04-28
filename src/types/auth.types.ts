export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  expectedRole?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  phone: string;
  role: string;
  restaurantId: number | null;
  restaurantName: string | null;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface AuthUser {
  userId: number;
  restaurantId: number | null;      
  restaurantName: string | null;    
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}