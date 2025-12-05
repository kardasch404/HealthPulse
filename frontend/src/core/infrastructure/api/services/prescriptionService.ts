import { axiosInstance } from '../axiosInstance';

export const prescriptionService = {
  create: (data: any) => axiosInstance.post('/prescriptions', data),
  
  getAll: () => axiosInstance.get('/prescriptions'),
  
  getById: (id: string) => axiosInstance.get(`/prescriptions/${id}`),
  
  update: (id: string, data: any) => axiosInstance.put(`/prescriptions/${id}`, data),
  
  addMedication: (id: string, medication: any) => 
    axiosInstance.put(`/prescriptions/${id}/medications`, medication),
  
  sign: (id: string) => axiosInstance.put(`/prescriptions/${id}/sign`, {}),
  
  assignPharmacy: (id: string, pharmacyId: string) => 
    axiosInstance.patch(`/prescriptions/${id}/assign-pharmacy`, { pharmacyId }),
  
  cancel: (id: string, reason: string) => 
    axiosInstance.patch(`/prescriptions/${id}/cancel`, { reason }),
};
