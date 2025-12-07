import express from 'express';
import LabOrderController from '../../controllers/LabOrderController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validation.js';
import LabOrderValidator from '../../validators/LabOrderValidator.js';
import { PERMISSIONS } from '../../constants/roles.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();
const labOrderController = new LabOrderController();

router.use(authenticate);

router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_LAB_ORDERS),
    validate(LabOrderValidator.createSchema),
    (req, res) => labOrderController.createLabOrder(req, res)
);

router.put(
    '/:id/tests',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    validate(LabOrderValidator.addTestSchema),
    (req, res) => labOrderController.addTest(req, res)
);

router.get(
    '/my',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => {
        if (req.user.role === 'doctor') {
            req.query.doctorId = req.user.userId;
            return labOrderController.getAllLabOrders(req, res);
        } else if (req.user.role === 'lab_technician') {
            return labOrderController.getMyLabOrders(req, res);
        } else {
            return labOrderController.getAllLabOrders(req, res);
        }
    }
);

router.get(
    '/result-history',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getResultHistory(req, res)
);

router.get(
    '/',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getAllLabOrders(req, res)
);

router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getLabOrderById(req, res)
);

router.get(
    '/:id/results',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getLabResults(req, res)
);

router.patch(
    '/:id/status',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    validate(LabOrderValidator.updateStatusSchema),
    (req, res) => labOrderController.updateLabOrderStatus(req, res)
);

router.patch(
    '/:orderId/tests/:testId/status',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    validate(LabOrderValidator.updateTestStatusSchema),
    (req, res) => labOrderController.updateTestStatus(req, res)
);

router.post(
    '/:orderId/tests/:testId/results',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    validate(LabOrderValidator.addResultsSchema),
    (req, res) => labOrderController.addTestResults(req, res)
);

router.post(
    '/:id/cancel',
    checkPermission(PERMISSIONS.MANAGE_LAB_ORDERS),
    validate(LabOrderValidator.cancelSchema),
    (req, res) => labOrderController.cancelLabOrder(req, res)
);

router.get(
    '/statistics/overview',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getStatistics(req, res)
);

router.post(
    '/:id/upload-results',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    (req, res) => labOrderController.uploadLabResultsJSON(req, res)
);

router.post(
    '/:id/upload-report',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    upload.single('file'),
    (req, res) => labOrderController.uploadLabReportPDF(req, res)
);

router.post(
    '/:id/validate',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    (req, res) => labOrderController.validateLabOrder(req, res)
);



router.get(
    '/:id/report',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.downloadLabReport(req, res)
);

export default router;
