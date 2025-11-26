import { axiosInstance } from '../axiosInstance';
import type { ApiResponse } from '../../../../shared/types';

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  type: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  appointmentDate?: string;
  appointmentTime?: string;
  type?: string;
  reason?: string;
  notes?: string;
  status?: string;
}

export const appointmentService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse>('/termins/my');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/termins/${id}`);
    return response.data;
  },

  create: async (data: CreateAppointmentData) => {
    const response = await axiosInstance.post<ApiResponse>('/termins', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAppointmentData) => {
    const response = await axiosInstance.put<ApiResponse>(`/termins/${id}`, data);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/termins/${id}/complete`);
    return response.data;
  },

  cancel: async (id: string, data: { reason: string }) => {
    const response = await axiosInstance.patch<ApiResponse>(`/termins/${id}/cancel`, data);
    return response.data;
  },

  checkAvailability: async (date: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/termins/availability?date=${date}`);
    return response.data;
  },
};
