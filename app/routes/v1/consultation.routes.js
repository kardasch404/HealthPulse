import express from 'express';
import ConsultationController from '../../controllers/ConsultationController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = express.Router();
const consultationController = new ConsultationController();

// All routes require authentication
router.use(authenticate);

// Create consultation - Doctor only
router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.createConsultation(req, res)
);

// List doctor's consultations - Doctor only
router.get(
    '/',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.listMyConsultations(req, res)
);

// Get patient consultation history - Doctor only
router.get(
    '/patient/:patientId/history',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.getPatientHistory(req, res)
);

// Get consultation by ID - Doctor, Patient (own), Admin
router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_CONSULTATIONS),
    (req, res) => consultationController.getConsultationById(req, res)
);

// Update consultation - Doctor only
router.put(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.updateConsultation(req, res)
);

// Add vital signs - Doctor only
router.post(
    '/:id/vital-signs',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.addVitalSigns(req, res)
);

// Add diagnosis - Doctor only
router.post(
    '/:id/diagnosis',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.addDiagnosis(req, res)
);

// Complete consultation - Doctor only
router.patch(
    '/:id/complete',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.completeConsultation(req, res)
);

// Delete consultation - Doctor only
router.delete(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.deleteConsultation(req, res)
);

export default router;
