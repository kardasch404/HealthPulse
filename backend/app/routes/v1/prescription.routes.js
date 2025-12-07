import express from 'express';
import PrescriptionController from '../../controllers/PrescriptionController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = express.Router();
const prescriptionController = new PrescriptionController();

router.use(authenticate);


router.get(
    '/',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.listMyPrescriptions(req, res)
);

router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.createPrescription(req, res)
);

router.get(
    '/my-prescriptions',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getMyPrescriptions(req, res)
);

router.get(
    '/dispensing-history',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getDispensingHistory(req, res)
);

router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getPrescriptionById(req, res)
);

router.put(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.updatePrescription(req, res)
);

router.put(
    '/:id/medications',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.addMedication(req, res)
);

router.get(
    '/:id/status',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getPrescriptionStatus(req, res)
);

router.put(
    '/:id/sign',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.signPrescription(req, res)
);

router.patch(
    '/:id/assign-pharmacy',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.assignToPharmacy(req, res)
);

router.patch(
    '/:id/cancel',
    checkPermission(PERMISSIONS.MANAGE_PRESCRIPTIONS),
    (req, res) => prescriptionController.cancelPrescription(req, res)
);

// Pharmacist routes
router.patch(
    '/:id/status',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.updatePrescriptionStatus(req, res)
);

router.get(
    '/pharmacy/:pharmacyId',
    checkPermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
    (req, res) => prescriptionController.getPharmacyPrescriptions(req, res)
);

export default router;
