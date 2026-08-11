export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  accepts_data_processing: boolean;
}

export interface AuthSession {
  inactivity_expires_in_hours: number;
  absolute_expires_in_hours: number;
}

export interface LoginResponse {
  message: string;
  session: AuthSession;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export interface AuthenticatedUserResponse {
  authenticated: true;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}
