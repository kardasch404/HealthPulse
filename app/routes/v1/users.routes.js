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

const userService = new UserService();
const userController = new UserController(userService);

router.use(authenticate);

router.post('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    canCreateAnyUser,       // Check specific role permissions
    catchAsync((req, res) => userController.createUser(req, res))
);

router.get('/', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => userController.getAllUsers(req, res))
);

router.get('/me', 
    catchAsync((req, res) => userController.getCurrentUser(req, res))
);

router.put('/me', 
    catchAsync((req, res) => userController.updateCurrentUser(req, res))
);

router.get('/:id', 
    requireRole([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION]),
    catchAsync((req, res) => userController.getUserById(req, res))
);

router.get('/role/:role', 
    requireAdmin,
    catchAsync((req, res) => userController.getUsersByRole(req, res))
);

router.put('/:id', 
    requireAdmin,
    canUpdateUser,          // Check if admin can update users
    catchAsync((req, res) => userController.updateUser(req, res))
);

router.delete('/:id', 
    requireAdmin,
    canDeleteUser,          // Check if admin can delete users
    catchAsync((req, res) => userController.deleteUser(req, res))
);

router.patch('/:id/activate', 
    requireAdmin,
    catchAsync((req, res) => userController.activateUser(req, res))
);

export default router;
