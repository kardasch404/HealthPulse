import { axiosInstance } from '../axiosInstance';
import type { ApiResponse } from '../../../../shared/types';

export interface CreatePatientData {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
}

export interface UpdatePatientData {
  fname?: string;
  lname?: string;
  email?: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
}

export const patientService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse>('/patients');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/patients/${id}`);
    return response.data;
  },

  getMedicalHistory: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/patients/${id}/medical-history`);
    return response.data;
  },

  create: async (data: CreatePatientData) => {
    const response = await axiosInstance.post<ApiResponse>('/patients', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePatientData) => {
    const response = await axiosInstance.put<ApiResponse>(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse>(`/patients/${id}`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/patients/search?q=${query}`);
    return response.data;
  },
};
