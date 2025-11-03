import express from 'express';
import LaboratoryController from '../../controllers/LaboratoryController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = express.Router();
const laboratoryController = new LaboratoryController();

// All routes require authentication
router.use(authenticate);

// REST API Routes for Laboratory Management

// POST /laboratories - Register new laboratory (Admin only)
router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.registerLaboratory(req, res)
);

// GET /laboratories - List all laboratories with filtering
router.get(
    '/',
    checkPermission(PERMISSIONS.VIEW_LABORATORIES),
    (req, res) => laboratoryController.getAllLaboratories(req, res)
);

// GET /laboratories/search - Search laboratories
router.get(
    '/search',
    checkPermission(PERMISSIONS.VIEW_LABORATORIES),
    (req, res) => laboratoryController.searchLaboratories(req, res)
);

// GET /laboratories/:id - Get specific laboratory by ID
router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_LABORATORIES),
    (req, res) => laboratoryController.getLaboratoryById(req, res)
);

// PUT /laboratories/:id - Update laboratory (Admin only)
router.put(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.updateLaboratory(req, res)
);

// PATCH /laboratories/:id/activate - Activate laboratory (Admin only)
router.patch(
    '/:id/activate',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.activateLaboratory(req, res)
);

// PATCH /laboratories/:id/suspend - Suspend laboratory (Admin only)
router.patch(
    '/:id/suspend',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.suspendLaboratory(req, res)
);

// DELETE /laboratories/:id - Delete laboratory (Admin only)
router.delete(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.deleteLaboratory(req, res)
);

export default router;