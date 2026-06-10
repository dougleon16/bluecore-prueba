export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  status: string;
  access_token: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}
