import express from 'express';
import DocumentController from '../../controllers/DocumentController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();
const documentController = new DocumentController();

router.post(
    '/upload',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    upload.single('file'),
    (req, res) => documentController.uploadDocument(req, res)
);

router.get(
    '/',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    (req, res) => documentController.getAllDocuments(req, res)
);

router.get(
    '/patient/:patientId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    (req, res) => documentController.listPatientDocuments(req, res)
);

router.get(
    '/consultation/:consultationId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    (req, res) => documentController.getConsultationDocuments(req, res)
);

router.get(
    '/lab-order/:labOrderId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    (req, res) => documentController.getLabOrderDocuments(req, res)
);

router.get(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    (req, res) => documentController.getDocumentById(req, res)
);

router.get(
    '/:id/download',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    (req, res) => documentController.downloadDocument(req, res)
);

router.put(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    (req, res) => documentController.updateDocument(req, res)
);

router.delete(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    (req, res) => documentController.deleteDocument(req, res)
);

export default router;
