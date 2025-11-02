import express from 'express';
import PrescriptionController from '../../controllers/PrescriptionController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = express.Router();
const prescriptionController = new PrescriptionController();

// All routes require authentication
router.use(authenticate);

// Patient route - Get my prescriptions
router.get(
    '/my-prescriptions',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getMyPrescriptions(req, res)
);

// Create prescription - Doctor only
router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.createPrescription(req, res)
);

// List doctor's prescriptions - Doctor only
router.get(
    '/',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.listMyPrescriptions(req, res)
);

// Get prescription by ID - Doctor, Patient (own), Admin
router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getPrescriptionById(req, res)
);

// Update prescription (draft only) - Doctor only
router.put(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.updatePrescription(req, res)
);

// Add medication to prescription - Doctor only
router.post(
    '/:id/medications',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.addMedication(req, res)
);

// Sign prescription - Doctor only
router.patch(
    '/:id/sign',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.signPrescription(req, res)
);

// Assign to pharmacy - Doctor only
router.patch(
    '/:id/assign-pharmacy',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.assignToPharmacy(req, res)
);

// View prescription status - Doctor, Patient (own)
router.get(
    '/:id/status',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getPrescriptionStatus(req, res)
);

// Cancel prescription - Doctor only
router.patch(
    '/:id/cancel',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.cancelPrescription(req, res)
);

export default router;
