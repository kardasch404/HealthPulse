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

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/lab-orders
 * @desc    Create a new lab order
 * @access  Doctor only
 */
router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_LAB_ORDERS),
    validate(LabOrderValidator.createSchema),
    (req, res) => labOrderController.createLabOrder(req, res)
);

/**
 * @route   PUT /api/v1/lab-orders/:id/tests
 * @desc    Add test to existing lab order
 * @access  Doctor only
 */
router.put(
    '/:id/tests',
    checkPermission(PERMISSIONS.MANAGE_LAB_ORDERS),
    validate(LabOrderValidator.addTestSchema),
    (req, res) => labOrderController.addTest(req, res)
);

/**
 * @route   GET /api/v1/lab-orders
 * @desc    Get all lab orders with filtering
 * @access  Doctor, Lab Technician, Nurse, Admin
 */
router.get(
    '/',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getAllLabOrders(req, res)
);

/**
 * @route   GET /api/v1/lab-orders/:id
 * @desc    Get lab order by ID
 * @access  Doctor, Lab Technician, Nurse, Admin, Patient (own orders)
 */
router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getLabOrderById(req, res)
);

/**
 * @route   GET /api/v1/lab-orders/:id/results
 * @desc    Get lab results
 * @access  Doctor, Lab Technician, Patient (own results)
 */
router.get(
    '/:id/results',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getLabResults(req, res)
);

/**
 * @route   PATCH /api/v1/lab-orders/:id/status
 * @desc    Update lab order status
 * @access  Lab Technician, Doctor, Admin
 */
router.patch(
    '/:id/status',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    validate(LabOrderValidator.updateStatusSchema),
    (req, res) => labOrderController.updateLabOrderStatus(req, res)
);

/**
 * @route   PATCH /api/v1/lab-orders/:orderId/tests/:testId/status
 * @desc    Update test status within lab order
 * @access  Lab Technician, Admin
 */
router.patch(
    '/:orderId/tests/:testId/status',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    validate(LabOrderValidator.updateTestStatusSchema),
    (req, res) => labOrderController.updateTestStatus(req, res)
);

/**
 * @route   POST /api/v1/lab-orders/:orderId/tests/:testId/results
 * @desc    Add test results
 * @access  Lab Technician, Admin
 */
router.post(
    '/:orderId/tests/:testId/results',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    validate(LabOrderValidator.addResultsSchema),
    (req, res) => labOrderController.addTestResults(req, res)
);

/**
 * @route   POST /api/v1/lab-orders/:id/cancel
 * @desc    Cancel lab order
 * @access  Doctor, Admin
 */
router.post(
    '/:id/cancel',
    checkPermission(PERMISSIONS.MANAGE_LAB_ORDERS),
    validate(LabOrderValidator.cancelSchema),
    (req, res) => labOrderController.cancelLabOrder(req, res)
);

/**
 * @route   GET /api/v1/lab-orders/statistics/overview
 * @desc    Get lab order statistics
 * @access  Doctor, Lab Technician, Admin
 */
router.get(
    '/statistics/overview',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getStatistics(req, res)
);

/**
 * @route   POST /api/v1/lab-orders/:id/upload-results
 * @desc    Upload lab results as JSON
 * @access  Lab Technician
 */
router.post(
    '/:id/upload-results',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    (req, res) => labOrderController.uploadLabResultsJSON(req, res)
);

/**
 * @route   POST /api/v1/lab-orders/:id/upload-report
 * @desc    Upload lab report PDF
 * @access  Lab Technician
 */
router.post(
    '/:id/upload-report',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    upload.single('file'),
    (req, res) => labOrderController.uploadLabReportPDF(req, res)
);

/**
 * @route   POST /api/v1/lab-orders/:id/validate
 * @desc    Mark lab order as validated
 * @access  Lab Technician
 */
router.post(
    '/:id/validate',
    checkPermission(PERMISSIONS.PROCESS_LAB_ORDERS),
    (req, res) => labOrderController.validateLabOrder(req, res)
);

/**
 * @route   GET /api/v1/lab-orders/:id/result-history
 * @desc    Get result history
 * @access  Doctor, Lab Technician
 */
router.get(
    '/:id/result-history',
    checkPermission(PERMISSIONS.VIEW_LAB_ORDERS),
    (req, res) => labOrderController.getResultHistory(req, res)
);

export default router;
