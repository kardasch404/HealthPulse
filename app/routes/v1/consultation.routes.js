import express from 'express';
import ConsultationController from '../../controllers/ConsultationController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = express.Router();
const consultationController = new ConsultationController();

router.use(authenticate);

router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.createConsultation(req, res)
);

router.get(
    '/',
    checkPermission(PERMISSIONS.VIEW_CONSULTATIONS),
    (req, res) => consultationController.getAllConsultations(req, res)
);

router.get(
    '/my',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.listMyConsultations(req, res)
);

router.get(
    '/patient/:patientId/history',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.getPatientHistory(req, res)
);

router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_CONSULTATIONS),
    (req, res) => consultationController.getConsultationById(req, res)
);

router.put(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.updateConsultation(req, res)
);

router.post(
    '/:id/vital-signs',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.addVitalSigns(req, res)
);

router.post(
    '/:id/diagnosis',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.addDiagnosis(req, res)
);

router.patch(
    '/:id/complete',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.completeConsultation(req, res)
);

router.delete(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_CONSULTATIONS),
    (req, res) => consultationController.deleteConsultation(req, res)
);

export default router;
