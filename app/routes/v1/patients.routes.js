import express from 'express';
import PatientController from '../../controllers/PatientController.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole, requireAdmin } from '../../middlewares/permission.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();
const patientController = new PatientController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/patients
 * @desc    Create new patient
 * @access  Doctor, Nurse, Reception, Admin
 */
router.post('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => patientController.createPatient(req, res))
);

/**
 * @route   GET /api/v1/patients
 * @desc    Get all patients with pagination and filters
 * @access  Doctor, Nurse, Reception, Admin
 */
router.get('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => patientController.getAllPatients(req, res))
);

/**
 * @route   GET /api/v1/patients/search
 * @desc    Search patients
 * @access  Doctor, Nurse, Reception, Admin
 */
router.get('/search', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => patientController.searchPatients(req, res))
);

/**
 * @route   GET /api/v1/patients/:id
 * @desc    Get patient by ID
 * @access  Doctor, Nurse, Reception, Admin, Patient (own)
 */
router.get('/:id', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT]),
    catchAsync((req, res) => patientController.getPatientById(req, res))
);

/**
 * @route   GET /api/v1/patients/:id/medical-history
 * @desc    Get patient medical history
 * @access  Doctor, Nurse, Admin, Patient (own)
 */
router.get('/:id/medical-history', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]),
    catchAsync((req, res) => patientController.getPatientMedicalHistory(req, res))
);

/**
 * @route   PUT /api/v1/patients/:id
 * @desc    Update patient
 * @access  Doctor, Nurse, Reception, Admin, Patient (own)
 */
router.put('/:id', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT]),
    catchAsync((req, res) => patientController.updatePatient(req, res))
);

/**
 * @route   DELETE /api/v1/patients/:id
 * @desc    Deactivate patient (soft delete)
 * @access  Admin only
 */
router.delete('/:id', 
    requireAdmin,
    catchAsync((req, res) => patientController.deletePatient(req, res))
);

export default router;
