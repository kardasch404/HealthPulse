import express from 'express';
import PrescriptionController from '../../controllers/PrescriptionController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = express.Router();
const prescriptionController = new PrescriptionController();

// All routes require authentication
router.use(authenticate);

// REST API Routes following best practices

// GET /prescriptions - List my prescriptions (context-aware based on user role)
router.get(
    '/',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.listMyPrescriptions(req, res)
);

// POST /prescriptions - Create new prescription (Doctor only)
router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.createPrescription(req, res)
);

// GET /prescriptions/my-prescriptions - Alternative route for patient convenience
router.get(
    '/my-prescriptions',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getMyPrescriptions(req, res)
);

// GET /prescriptions/:id - Get specific prescription by ID
router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getPrescriptionById(req, res)
);

// PUT /prescriptions/:id - Update prescription (draft only, Doctor only)
router.put(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.updatePrescription(req, res)
);

// PUT /prescriptions/:id/medications - Add medication to prescription (changed from POST to PUT)
router.put(
    '/:id/medications',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.addMedication(req, res)
);

// GET /prescriptions/:id/status - Get prescription status
router.get(
    '/:id/status',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getPrescriptionStatus(req, res)
);

// PATCH /prescriptions/:id/sign - Sign prescription (Doctor only)
router.patch(
    '/:id/sign',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.signPrescription(req, res)
);

// PATCH /prescriptions/:id/assign-pharmacy - Assign to pharmacy (Doctor only)
router.patch(
    '/:id/assign-pharmacy',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.assignToPharmacy(req, res)
);

// PATCH /prescriptions/:id/cancel - Cancel prescription (Doctor only)
router.patch(
    '/:id/cancel',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.cancelPrescription(req, res)
);

export default router;
