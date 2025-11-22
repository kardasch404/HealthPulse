export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: '/users',
  PATIENTS: '/patients',
  APPOINTMENTS: '/termins',
  CONSULTATIONS: '/consultations',
  PRESCRIPTIONS: '/prescriptions',
  LAB_ORDERS: '/lab-orders',
  DOCUMENTS: '/documents',
} as const;
