export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  nickName: string;
  phoneNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleOAuth2Request {
  idToken: string;
  accessToken: string;
}

export interface UserJwtResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthState {
  user: UserJwtResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 