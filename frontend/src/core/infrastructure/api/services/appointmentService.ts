import { axiosInstance } from '../axiosInstance';
import type { ApiResponse } from '../../../../shared/types';

export interface CreateAppointmentData {
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  reason?: string;
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
    const response = await axiosInstance.get<ApiResponse>('/appointments');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/appointments/${id}`);
    return response.data;
  },

  create: async (data: CreateAppointmentData) => {
    const response = await axiosInstance.post<ApiResponse>('/appointments', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAppointmentData) => {
    const response = await axiosInstance.put<ApiResponse>(`/appointments/${id}`, data);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/appointments/${id}/complete`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/appointments/${id}/cancel`);
    return response.data;
  },

  checkAvailability: async (date: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/appointments/availability?date=${date}`);
    return response.data;
  },
};
