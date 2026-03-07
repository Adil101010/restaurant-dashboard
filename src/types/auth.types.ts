export interface LoginRequest {
   emailOrPhone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
   userId: number; 
  restaurantName: string;
  email: string;
  restaurantId: number; 
}

export interface AuthUser {
  restaurantId: number;
  restaurantName: string;
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
