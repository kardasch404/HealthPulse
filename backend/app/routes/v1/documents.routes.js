import express from 'express';
import DocumentController from '../../controllers/DocumentController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();
const documentController = new DocumentController();

router.post(
    '/',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    upload.single('file'),
    documentController.uploadDocument.bind(documentController)
);

router.get(
    '/patient/:patientId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.listPatientDocuments.bind(documentController)
);

router.get(
    '/consultation/:consultationId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.getConsultationDocuments.bind(documentController)
);

router.get(
    '/lab-order/:labOrderId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.getLabOrderDocuments.bind(documentController)
);

router.get(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.getDocumentById.bind(documentController)
);

router.get(
    '/:id/download',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.downloadDocument.bind(documentController)
);

router.put(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    documentController.updateDocument.bind(documentController)
);

router.delete(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    documentController.deleteDocument.bind(documentController)
);

export default router;
