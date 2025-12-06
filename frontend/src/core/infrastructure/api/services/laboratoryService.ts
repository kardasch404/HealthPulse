import { axiosInstance } from '../axiosInstance';

export const laboratoryService = {
  getAll: () => axiosInstance.get('/laboratories'),
  
  getById: (id: string) => axiosInstance.get(`/laboratories/${id}`),
};