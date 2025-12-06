import { axiosInstance } from '../axiosInstance';

export const labOrderService = {
  create: (data: any) => axiosInstance.post('/lab-orders', data),
  
  getAll: () => axiosInstance.get('/lab-orders'),
  
  getMyLabOrders: () => axiosInstance.get('/lab-orders/my'),
  
  getById: (id: string) => axiosInstance.get(`/lab-orders/${id}`),
  
  addTest: (id: string, test: any) => 
    axiosInstance.post(`/lab-orders/${id}/tests`, test),
  
  getResults: (id: string) => axiosInstance.get(`/lab-orders/${id}/results`),
  
  downloadReport: async (id: string) => {
    // First check if report exists with a regular request
    const checkResponse = await axiosInstance.get(`/lab-orders/${id}/report`);
    
    // If we get here and it's JSON, it means no PDF is available
    if (checkResponse.data && typeof checkResponse.data === 'object' && !checkResponse.data.success) {
      throw new Error(checkResponse.data.error || checkResponse.data.message || 'Lab report not available');
    }
    
    // If we get here, we should have a PDF, so request it as blob
    return await axiosInstance.get(`/lab-orders/${id}/report`, { responseType: 'blob' });
  },
  
  cancel: (id: string, reason: string) => 
    axiosInstance.post(`/lab-orders/${id}/cancel`, { reason }),
};