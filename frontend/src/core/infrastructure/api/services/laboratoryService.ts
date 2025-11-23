import { axiosInstance } from '../axiosInstance';
import type { ApiResponse } from '../../../../shared/types';

export interface CreateLaboratoryData {
  name: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  emergencyPhone?: string;
  accreditation: string;
  certifications?: string[];
  services?: string[];
  specializations?: string[];
  turnaroundTime?: {
    routine?: string;
    urgent?: string;
    stat?: string;
  };
}

export interface UpdateLaboratoryData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  emergencyPhone?: string;
  accreditation?: string;
  certifications?: string[];
  services?: string[];
  specializations?: string[];
}

export const laboratoryService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse>('/laboratories');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/laboratories/${id}`);
    return response.data;
  },

  create: async (data: CreateLaboratoryData) => {
    const response = await axiosInstance.post<ApiResponse>('/laboratories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateLaboratoryData) => {
    const response = await axiosInstance.put<ApiResponse>(`/laboratories/${id}`, data);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/laboratories/${id}/activate`);
    return response.data;
  },

  suspend: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/laboratories/${id}/suspend`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse>(`/laboratories/${id}`);
    return response.data;
  },
};
