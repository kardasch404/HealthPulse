import express from 'express';
import UserController from '../../controllers/UserController.js';
import UserService from '../../services/UserService.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin, requireRole } from '../../middlewares/permission.js';
import { canUpdateUser, canDeleteUser } from '../../middlewares/userPermissions.js';
import { canCreateAnyUser } from '../../middlewares/patientPermissions.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

// Initialize service and controller
const userService = new UserService();
const userController = new UserController(userService);

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Admin can create any user, Doctor/Nurse/Reception can only create patients
 */
router.post('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    canCreateAnyUser,       // Check specific role permissions
    catchAsync((req, res) => userController.createUser(req, res))
);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filters
 * @access  Admin, Doctor, Nurse, Reception (can view patients)
 */
router.get('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => userController.getAllUsers(req, res))
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin, Doctor, Nurse, Reception (can view patient details)
 */
router.get('/:id', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => userController.getUserById(req, res))
);

/**
 * @route   GET /api/v1/users/role/:role
 * @desc    Get users by role (doctor, nurse, reception, patient)
 * @access  Admin only
 */
router.get('/role/:role', 
    requireAdmin,
    catchAsync((req, res) => userController.getUsersByRole(req, res))
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put('/:id', 
    requireAdmin,
    canUpdateUser,          // Check if admin can update users
    catchAsync((req, res) => userController.updateUser(req, res))
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Deactivate user (soft delete)
 * @access  Admin only
 */
router.delete('/:id', 
    requireAdmin,
    canDeleteUser,          // Check if admin can delete users
    catchAsync((req, res) => userController.deleteUser(req, res))
);

/**
 * @route   PATCH /api/v1/users/:id/activate
 * @desc    Activate user
 * @access  Admin only
 */
router.patch('/:id/activate', 
    requireAdmin,
    catchAsync((req, res) => userController.activateUser(req, res))
);

export default router;
