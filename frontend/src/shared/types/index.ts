  import { Role } from '../constants/roles';

export interface User {
  _id: string;
  email: string;
  fname: string;
  lname: string;
  phone?: string;
  roleId: {
    _id: string;
    name: Role;
    permissions: Record<string, any>;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fname: string;
  lname: string;
  phone?: string;
  roleId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
