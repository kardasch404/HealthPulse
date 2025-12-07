import { axiosInstance } from '../axiosInstance';

export const labOrderService = {
  create: (data: any) => axiosInstance.post('/lab-orders', data),
  
  getAll: () => axiosInstance.get('/lab-orders'),
  
  getMyLabOrders: () => axiosInstance.get('/lab-orders/my'),
  
  getById: (id: string) => axiosInstance.get(`/lab-orders/${id}`),
  
  addTest: (id: string, test: any) => 
    axiosInstance.post(`/lab-orders/${id}/tests`, test),
  
  getResults: (id: string) => axiosInstance.get(`/lab-orders/${id}/results`),
  
  updateStatus: (id: string, status: string, reason?: string) => 
    axiosInstance.patch(`/lab-orders/${id}/status`, { status, reason }),
  
  updateTestStatus: (orderId: string, testId: string, status: string, resultData?: any) => 
    axiosInstance.patch(`/lab-orders/${orderId}/tests/${testId}/status`, { status, ...resultData }),
  
  uploadResults: (orderId: string, testId: string, results: any) => 
    axiosInstance.post(`/lab-orders/${orderId}/tests/${testId}/results`, results),
  
  uploadResultsJSON: (id: string, resultsData: any) => 
    axiosInstance.post(`/lab-orders/${id}/upload-results`, resultsData),
  
  uploadReportPDF: (id: string, file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.description) formData.append('description', metadata.description);
    
    return axiosInstance.post(`/lab-orders/${id}/upload-report`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  validateOrder: (id: string, validationNotes: string) => 
    axiosInstance.post(`/lab-orders/${id}/validate`, { validationNotes }),
  
  getResultHistory: () => axiosInstance.get('/lab-orders/result-history'),
  
  downloadReport: async (id: string) => {
    const checkResponse = await axiosInstance.get(`/lab-orders/${id}/report`);
    
    if (checkResponse.data && typeof checkResponse.data === 'object' && !checkResponse.data.success) {
      throw new Error(checkResponse.data.error || checkResponse.data.message || 'Lab report not available');
    }
    
    return await axiosInstance.get(`/lab-orders/${id}/report`, { responseType: 'blob' });
  },
  
  cancel: (id: string, reason: string) => 
    axiosInstance.post(`/lab-orders/${id}/cancel`, { reason }),
};