import { axiosInstance } from '../axiosInstance';

export const documentService = {
  upload: (formData: FormData) => 
    axiosInstance.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getAll: () => axiosInstance.get('/documents'),
  
  getPatientDocuments: (patientId: string) => 
    axiosInstance.get(`/documents?patientId=${patientId}`),
  
  getById: (id: string) => axiosInstance.get(`/documents/${id}`),
  
  download: (id: string) => 
    axiosInstance.get(`/documents/${id}/download`, { responseType: 'blob' }),
  
  update: (id: string, data: any) => 
    axiosInstance.put(`/documents/${id}`, data),
  
  delete: (id: string) => axiosInstance.delete(`/documents/${id}`),
};