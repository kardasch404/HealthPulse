import { axiosInstance } from '../axiosInstance';
import type { ApiResponse } from '../../../../shared/types';

export interface CreatePharmacyData {
  name: string;
  licenseNumber: string;
  contact: {
    phone: string;
    email?: string;
  };
  address: {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country?: string;
  };
  operatingHours?: Array<{
    day: string;
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;
  }>;
}

export interface UpdatePharmacyData {
  name?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  operatingHours?: Array<{
    day: string;
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;
  }>;
}

export const pharmacyService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse>('/pharmacies');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/pharmacies/${id}`);
    return response.data;
  },

  create: async (data: CreatePharmacyData) => {
    const response = await axiosInstance.post<ApiResponse>('/pharmacies', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePharmacyData) => {
    const response = await axiosInstance.put<ApiResponse>(`/pharmacies/${id}`, data);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/pharmacies/${id}/activate`);
    return response.data;
  },

  suspend: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/pharmacies/${id}/suspend`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse>(`/pharmacies/${id}`);
    return response.data;
  },
};
