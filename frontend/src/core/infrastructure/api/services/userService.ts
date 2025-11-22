import { axiosInstance } from '../axiosInstance';
import { API_ENDPOINTS } from '../../../../shared/constants/api';
import type { ApiResponse } from '../../../../shared/types';

export interface CreateUserData {
  email: string;
  password: string;
  fname: string;
  lname: string;
  phone?: string;
  roleId: string;
}

export interface UpdateUserData {
  fname?: string;
  lname?: string;
  phone?: string;
  email?: string;
}

export const userService = {
  // Get all users
  getAll: async (params?: { page?: number; limit?: number; role?: string }) => {
    const response = await axiosInstance.get<ApiResponse>(API_ENDPOINTS.USERS, { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`${API_ENDPOINTS.USERS}/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: CreateUserData) => {
    const response = await axiosInstance.post<ApiResponse>(API_ENDPOINTS.USERS, data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserData) => {
    const response = await axiosInstance.put<ApiResponse>(`${API_ENDPOINTS.USERS}/${id}`, data);
    return response.data;
  },

  // Suspend user
  suspend: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`${API_ENDPOINTS.USERS}/${id}/suspend`);
    return response.data;
  },

  // Activate user
  activate: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`${API_ENDPOINTS.USERS}/${id}/activate`);
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse>(`${API_ENDPOINTS.USERS}/${id}`);
    return response.data;
  },

  // Get roles
  getRoles: async () => {
    const response = await axiosInstance.get<ApiResponse>('/roles');
    return response.data;
  },
};
