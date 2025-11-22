import { axiosInstance } from '../axiosInstance';
import { API_ENDPOINTS } from '../../../../shared/constants/api';
import type { LoginCredentials, RegisterData, AuthTokens, User, ApiResponse } from '../../../../shared/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> => {
    const response = await axiosInstance.post<ApiResponse<{ data: { user: any; tokens: AuthTokens } }>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const loginData = response.data.data!.data;
    return {
      tokens: loginData.tokens,
      user: loginData.user,
    };
  },

  register: async (data: RegisterData): Promise<{ tokens: AuthTokens; user: User }> => {
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return {
      tokens: {
        accessToken: response.data.data!.accessToken,
        refreshToken: response.data.data!.refreshToken,
      },
      user: response.data.data!.user,
    };
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return response.data.data!;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data.data!;
  },
};
