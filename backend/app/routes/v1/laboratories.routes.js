import express from 'express';
import LaboratoryController from '../../controllers/LaboratoryController.js';
import { authenticate } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/permission.js';
import { PERMISSIONS } from '../../constants/roles.js';

const router = express.Router();
const laboratoryController = new LaboratoryController();

router.use(authenticate);


router.post(
    '/',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.registerLaboratory(req, res)
);

router.get(
    '/',
    checkPermission(PERMISSIONS.VIEW_LABORATORIES),
    (req, res) => laboratoryController.getAllLaboratories(req, res)
);

router.get(
    '/search',
    checkPermission(PERMISSIONS.VIEW_LABORATORIES),
    (req, res) => laboratoryController.searchLaboratories(req, res)
);

router.get(
    '/:id',
    checkPermission(PERMISSIONS.VIEW_LABORATORIES),
    (req, res) => laboratoryController.getLaboratoryById(req, res)
);

router.put(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.updateLaboratory(req, res)
);

router.patch(
    '/:id/activate',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.activateLaboratory(req, res)
);

router.patch(
    '/:id/suspend',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.suspendLaboratory(req, res)
);

router.delete(
    '/:id',
    checkPermission(PERMISSIONS.MANAGE_LABORATORIES),
    (req, res) => laboratoryController.deleteLaboratory(req, res)
);

export default router;