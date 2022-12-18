export interface GenericResponse {
  status: string;
  message: string;
}

export interface ResetPasswordRequest {
  user: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SaveNoteRequest {
  user: string;
  created: string;
  modified: string;
  title: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  user: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  status: string;
}
