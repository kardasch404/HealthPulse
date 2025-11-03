import express from 'express';
import DocumentController from '../../controllers/DocumentController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();
const documentController = new DocumentController();

/**
 * @route POST /api/v1/documents
 * @desc Upload document
 * @access Private (Doctor, Nurse, Lab Technician)
 */
router.post(
    '/',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    upload.single('file'),
    documentController.uploadDocument.bind(documentController)
);

/**
 * @route GET /api/v1/documents/patient/:patientId
 * @desc List patient documents
 * @access Private (Doctor, Nurse, Patient)
 */
router.get(
    '/patient/:patientId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.listPatientDocuments.bind(documentController)
);

/**
 * @route GET /api/v1/documents/consultation/:consultationId
 * @desc Get consultation documents
 * @access Private (Doctor, Nurse)
 */
router.get(
    '/consultation/:consultationId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.getConsultationDocuments.bind(documentController)
);

/**
 * @route GET /api/v1/documents/lab-order/:labOrderId
 * @desc Get lab order documents
 * @access Private (Doctor, Lab Technician)
 */
router.get(
    '/lab-order/:labOrderId',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.getLabOrderDocuments.bind(documentController)
);

/**
 * @route GET /api/v1/documents/:id
 * @desc Get document details
 * @access Private (Doctor, Nurse, Patient)
 */
router.get(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.getDocumentById.bind(documentController)
);

/**
 * @route GET /api/v1/documents/:id/download
 * @desc Download document
 * @access Private (Doctor, Nurse, Patient)
 */
router.get(
    '/:id/download',
    authenticate,
    checkPermission(PERMISSIONS.VIEW_MEDICAL_DOCUMENTS),
    documentController.downloadDocument.bind(documentController)
);

/**
 * @route PUT /api/v1/documents/:id
 * @desc Update document
 * @access Private (Doctor, Nurse)
 */
router.put(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    documentController.updateDocument.bind(documentController)
);

/**
 * @route DELETE /api/v1/documents/:id
 * @desc Delete document
 * @access Private (Doctor, Admin)
 */
router.delete(
    '/:id',
    authenticate,
    checkPermission(PERMISSIONS.MANAGE_MEDICAL_DOCUMENTS),
    documentController.deleteDocument.bind(documentController)
);

export default router;
