import { axiosInstance } from '../axiosInstance';

export const profileService = {
  getProfile: () => axiosInstance.get('/users/profile'),
  
  updateProfile: (data: any) => axiosInstance.put('/users/profile', data),
  
  changePassword: (data: any) => axiosInstance.patch('/users/change-password', data),
};