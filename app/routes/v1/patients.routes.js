import express from 'express';
import PatientController from '../../controllers/PatientController.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole, requireAdmin } from '../../middlewares/permission.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();
const patientController = new PatientController();

router.use(authenticate);

router.post('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => patientController.createPatient(req, res))
);

router.get('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => patientController.getAllPatients(req, res))
);

router.get('/search', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => patientController.searchPatients(req, res))
);

router.get('/:id', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT]),
    catchAsync((req, res) => patientController.getPatientById(req, res))
);

router.get('/:id/medical-history', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]),
    catchAsync((req, res) => patientController.getPatientMedicalHistory(req, res))
);

router.put('/:id', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT]),
    catchAsync((req, res) => patientController.updatePatient(req, res))
);

router.delete('/:id', 
    requireAdmin,
    catchAsync((req, res) => patientController.deletePatient(req, res))
);

export default router;
