import { axiosInstance } from '../axiosInstance';

export const prescriptionService = {
  // Get all prescriptions (for current user based on role)
  getAll: () => axiosInstance.get('/prescriptions'),
  
  // Get my prescriptions
  getMyPrescriptions: () => axiosInstance.get('/prescriptions/my-prescriptions'),
  
  // Get prescription by ID
  getById: (id: string) => axiosInstance.get(`/prescriptions/${id}`),
  
  // Get prescriptions for a specific pharmacy
  getPharmacyPrescriptions: (pharmacyId: string, status?: string) => {
    const params = status ? { status } : {};
    return axiosInstance.get(`/prescriptions/pharmacy/${pharmacyId}`, { params });
  },
  
  // Update prescription status (for pharmacist)
  updateStatus: (id: string, status: string) => 
    axiosInstance.patch(`/prescriptions/${id}/status`, { status }),
  
  // Get prescription status
  getStatus: (id: string) => axiosInstance.get(`/prescriptions/${id}/status`),
  
  // Get dispensing history
  getDispensingHistory: () => axiosInstance.get('/prescriptions/dispensing-history'),
};
