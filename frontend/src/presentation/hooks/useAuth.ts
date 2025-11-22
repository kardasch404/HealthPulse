import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../core/application/stores/hooks';
import { loginAsync, registerAsync, logoutAsync, clearError } from '../../core/application/stores/authSlice';
import type { LoginCredentials, RegisterData } from '../../shared/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await dispatch(loginAsync(credentials));
      if (loginAsync.fulfilled.match(result)) {
        navigate('/dashboard');
      }
      return result;
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const result = await dispatch(registerAsync(data));
      if (registerAsync.fulfilled.match(result)) {
        navigate('/dashboard');
      }
      return result;
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAsync());
    navigate('/login');
  }, [dispatch, navigate]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError: clearAuthError,
  };
};
