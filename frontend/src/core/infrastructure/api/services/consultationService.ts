import { axiosInstance } from '../axiosInstance';
import type { ApiResponse } from '../../../../shared/types';

export interface CreateConsultationData {
  terminId?: string;
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  symptoms?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
  };
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  followUpDate?: string;
  followUpInstructions?: string;
}

export interface UpdateConsultationData {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  symptoms?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
  };
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  followUpDate?: string;
  followUpInstructions?: string;
}

export const consultationService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse>('/consultations/my');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/consultations/${id}`);
    return response.data;
  },

  getPatientHistory: async (patientId: string) => {
    const response = await axiosInstance.get<ApiResponse>(`/consultations/patient/${patientId}/history`);
    return response.data;
  },

  create: async (data: CreateConsultationData) => {
    const response = await axiosInstance.post<ApiResponse>('/consultations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateConsultationData) => {
    const response = await axiosInstance.put<ApiResponse>(`/consultations/${id}`, data);
    return response.data;
  },

  addDiagnosis: async (id: string, data: { diagnosis: string; treatmentPlan: string }) => {
    const response = await axiosInstance.patch<ApiResponse>(`/consultations/${id}/diagnosis`, data);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse>(`/consultations/${id}/complete`);
    return response.data;
  },
};
