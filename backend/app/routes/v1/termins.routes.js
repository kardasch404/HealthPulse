import { Router } from 'express';
import TerminController from '../../controllers/TerminController.js';
import TerminValidator from '../../validators/TerminSchema.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validation.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
const terminController = new TerminController();


router.get(
    '/available',
    authenticate,
    catchAsync(terminController.findAvailableDoctors.bind(terminController))
);

router.get(
    '/my',
    authenticate,
    requireRole([ROLES.DOCTOR, ROLES.PATIENT]),
    catchAsync(terminController.getUpcomingTermins.bind(terminController))
);

router.get(
    '/all',
    authenticate,
    requireRole([ROLES.ADMIN, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync(terminController.getAllTermins.bind(terminController))
);

router.post(
    '/',
    authenticate,
    requireRole([ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT]),
    validate(TerminValidator.createSchema),
    catchAsync(terminController.createTermin.bind(terminController))
);

router.get(
    '/:id',
    authenticate,
    catchAsync(terminController.getTerminById.bind(terminController))
);

router.put(
    '/:id/cancel',
    authenticate,
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT, ROLES.RECEPTION]),
    validate(TerminValidator.cancelSchema),
    catchAsync(terminController.cancelTermin.bind(terminController))
);

router.put(
    '/:id/complete',
    authenticate,
    requireRole([ROLES.DOCTOR]),
    catchAsync(terminController.completeTermin.bind(terminController))
);

export default router;
