export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
