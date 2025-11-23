import { axiosInstance } from '../axiosInstance';
import type { ApiResponse } from '../../../../shared/types';

export interface CreateRoleData {
  name: string;
  permissions: Record<string, any>;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  permissions?: Record<string, any>;
  description?: string;
}

export const roleService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse>('/roles');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/roles/${id}`);
    return response.data;
  },

  create: async (data: CreateRoleData) => {
    const response = await axiosInstance.post<ApiResponse>('/roles', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRoleData) => {
    const response = await axiosInstance.put<ApiResponse>(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse>(`/roles/${id}`);
    return response.data;
  },
};
