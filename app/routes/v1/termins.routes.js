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

// Public/authenticated routes

/**
 * GET /api/v1/termins/available?date=2025-10-20&startTime=09:00&endTime=09:30
 * Get available doctors for a specific date and time slot
 * Accessible by: All authenticated users
 */
router.get(
    '/available',
    authenticate,
    catchAsync(terminController.findAvailableDoctors.bind(terminController))
);

/**
 * GET /api/v1/termins/my
 * Get my termins (doctor sees their appointments, patient sees their appointments)
 * Query params: ?date=2025-10-20&status=scheduled
 * Accessible by: Doctor, Patient
 */
router.get(
    '/my',
    authenticate,
    requireRole([ROLES.DOCTOR, ROLES.PATIENT]),
    catchAsync(terminController.getUpcomingTermins.bind(terminController))
);

/**
 * GET /api/v1/termins/all
 * Get all appointments with filters (no pagination)
 * Query params: ?date=2025-10-20&status=scheduled&sortBy=date&sortOrder=asc
 * Accessible by: Admin, Nurse, Reception
 */
router.get(
    '/all',
    authenticate,
    requireRole([ROLES.ADMIN, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync(terminController.getAllTermins.bind(terminController))
);

/**
 * POST /api/v1/termins
 * Create/book a termin
 * Accessible by: Doctor, Nurse, Reception, Patient
 */
router.post(
    '/',
    authenticate,
    requireRole([ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.PATIENT]),
    validate(TerminValidator.createSchema),
    catchAsync(terminController.createTermin.bind(terminController))
);

/**
 * GET /api/v1/termins/:id
 * Get specific termin details
 * Accessible by: Admin, Doctor (if theirs), Patient (if theirs), Nurse, Reception
 */
router.get(
    '/:id',
    authenticate,
    catchAsync(terminController.getTerminById.bind(terminController))
);

/**
 * PUT /api/v1/termins/:id/cancel
 * Cancel a termin
 * Accessible by: Doctor (if theirs), Patient (if theirs), Reception, Admin
 */
router.put(
    '/:id/cancel',
    authenticate,
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT, ROLES.RECEPTION]),
    validate(TerminValidator.cancelSchema),
    catchAsync(terminController.cancelTermin.bind(terminController))
);

/**
 * PUT /api/v1/termins/:id/complete
 * Mark termin as completed
 * Accessible by: Doctor (only for their appointments)
 */
router.put(
    '/:id/complete',
    authenticate,
    requireRole([ROLES.DOCTOR]),
    catchAsync(terminController.completeTermin.bind(terminController))
);

export default router;
