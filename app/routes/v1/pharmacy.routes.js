import express from 'express';
import PharmacyController from '../../controllers/PharmacyController.js';
import PharmacyService from '../../services/PharmacyService.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin, requireRole } from '../../middlewares/permission.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

// Initialize service and controller
const pharmacyService = new PharmacyService();
const pharmacyController = new PharmacyController(pharmacyService);

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/pharmacies
 * @desc    Register a new pharmacy
 * @access  Admin only
 */
router.post('/', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.registerPharmacy(req, res))
);

/**
 * @route   GET /api/v1/pharmacies/stats
 * @desc    Get pharmacy statistics for dashboard
 * @access  Admin only
 */
router.get('/stats', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.getPharmacyStats(req, res))
);

/**
 * @route   GET /api/v1/pharmacies/nearby
 * @desc    Get pharmacies by location
 * @access  All authenticated users
 */
router.get('/nearby', 
    catchAsync((req, res) => pharmacyController.getNearbyPharmacies(req, res))
);

/**
 * @route   GET /api/v1/pharmacies/search/services
 * @desc    Search pharmacies by services
 * @access  All authenticated users
 */
router.get('/search/services', 
    catchAsync((req, res) => pharmacyController.searchByServices(req, res))
);

/**
 * @route   GET /api/v1/pharmacies/search
 * @desc    Search pharmacies by name/location
 * @access  All authenticated users
 */
router.get('/search', 
    catchAsync((req, res) => pharmacyController.searchPharmacies(req, res))
);

/**
 * @route   GET /api/v1/pharmacies
 * @desc    Get all pharmacies with filters and pagination
 * @access  Admin, Pharmacist
 */
router.get('/', 
    requireRole([ROLES.ADMIN, ROLES.PHARMACIST]),
    catchAsync((req, res) => pharmacyController.getAllPharmacies(req, res))
);

/**
 * @route   GET /api/v1/pharmacies/:id
 * @desc    Get pharmacy by ID
 * @access  Admin, Pharmacist
 */
router.get('/:id', 
    requireRole([ROLES.ADMIN, ROLES.PHARMACIST]),
    catchAsync((req, res) => pharmacyController.getPharmacyById(req, res))
);

/**
 * @route   PUT /api/v1/pharmacies/:id
 * @desc    Update pharmacy information
 * @access  Admin only
 */
router.put('/:id', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.updatePharmacy(req, res))
);

/**
 * @route   DELETE /api/v1/pharmacies/:id
 * @desc    Delete pharmacy (soft delete)
 * @access  Admin only
 */
router.delete('/:id', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.deletePharmacy(req, res))
);

/**
 * @route   PATCH /api/v1/pharmacies/:id/activate
 * @desc    Activate pharmacy
 * @access  Admin only
 */
router.patch('/:id/activate', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.activatePharmacy(req, res))
);

/**
 * @route   PATCH /api/v1/pharmacies/:id/suspend
 * @desc    Suspend pharmacy
 * @access  Admin only
 */
router.patch('/:id/suspend', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.suspendPharmacy(req, res))
);

/**
 * @route   PATCH /api/v1/pharmacies/:id/verify
 * @desc    Verify pharmacy
 * @access  Admin only
 */
router.patch('/:id/verify', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.verifyPharmacy(req, res))
);

/**
 * @route   POST /api/v1/pharmacies/:id/pharmacists
 * @desc    Add pharmacist to pharmacy
 * @access  Admin only
 */
router.post('/:id/pharmacists', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.addPharmacist(req, res))
);

export default router;