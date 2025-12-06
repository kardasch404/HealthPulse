import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fname: z.string().min(2, 'First name must be at least 2 characters'),
  lname: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const consultationSchema = z.object({
  terminId: z.string().optional(),
  patientId: z.string().min(1, 'Patient required'),
  chiefComplaint: z.string().min(3, 'Chief complaint required'),
  historyOfPresentIllness: z.string().optional(),
  symptoms: z.string().optional(),
  bloodPressure: z.string().optional(),
  pulse: z.string().optional().refine((val) => !val || Number(val) >= 0, 'Must be positive'),
  temperature: z.string().optional().refine((val) => !val || Number(val) >= 0, 'Must be positive'),
  respiratoryRate: z.string().optional().refine((val) => !val || Number(val) >= 0, 'Must be positive'),
  weight: z.string().optional().refine((val) => !val || Number(val) >= 0, 'Must be positive'),
  height: z.string().optional().refine((val) => !val || Number(val) >= 0, 'Must be positive'),
  oxygenSaturation: z.string().optional().refine((val) => !val || Number(val) >= 0, 'Must be positive'),
  physicalExamination: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpInstructions: z.string().optional(),
});

export const medicationSchema = z.object({
  medicationName: z.string().min(2, 'Medication name required'),
  genericName: z.string().optional(),
  dosage: z.string().min(1, 'Dosage required'),
  dosageForm: z.enum(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'patch']),
  frequency: z.string().min(1, 'Frequency required'),
  route: z.enum(['oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhalation', 'rectal', 'sublingual']),
  durationValue: z.string().refine((val) => Number(val) > 0, 'Duration must be positive'),
  durationUnit: z.enum(['days', 'weeks', 'months']),
  quantity: z.string().refine((val) => Number(val) > 0, 'Quantity must be positive'),
  instructions: z.string().optional(),
});

export const prescriptionSchema = z.object({
  consultationId: z.string().optional(),
  patientId: z.string().min(1, 'Patient required'),
  medications: z.array(medicationSchema).min(1, 'At least one medication required'),
  doctorNotes: z.string().optional(),
  validUntil: z.string().optional(),
});

export const updatePrescriptionSchema = z.object({
  notes: z.string().optional(),
  validUntil: z.string().optional(),
});

export const testSchema = z.object({
  name: z.string().min(2, 'Test name required'),
  code: z.string().min(1, 'Test code required'),
  category: z.enum(['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Endocrinology', 'Cardiology', 'Other']),
  urgency: z.enum(['routine', 'urgent', 'stat']),
  instructions: z.string().optional(),
  expectedTurnaround: z.string().refine((val) => Number(val) > 0, 'Must be positive'),
});

export const labOrderSchema = z.object({
  consultationId: z.string().optional(),
  patientId: z.string().min(1, 'Patient required'),
  laboratoryId: z.string().min(1, 'Laboratory required'),
  tests: z.array(testSchema).min(1, 'At least one test required'),
  clinicalIndication: z.string().min(3, 'Clinical indication required'),
  urgency: z.enum(['routine', 'urgent', 'stat']),
  notes: z.string().optional(),
  fastingRequired: z.boolean().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ConsultationFormData = z.infer<typeof consultationSchema>;
export type MedicationFormData = z.infer<typeof medicationSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
export type UpdatePrescriptionFormData = z.infer<typeof updatePrescriptionSchema>;
export type TestFormData = z.infer<typeof testSchema>;
export type LabOrderFormData = z.infer<typeof labOrderSchema>;
