import express from 'express';
import RoleController from '../../controllers/RoleController.js';
import RoleService from '../../services/RoleService.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
const roleService = new RoleService();
const roleController = new RoleController(roleService);

// All routes require authentication
router.use(authenticate);

// GET /api/v1/roles - Get all roles (admin only)
router.get('/', (req, res) => roleController.getAllRoles(req, res));

// GET /api/v1/roles/:id - Get role by ID (admin only)
router.get('/:id', (req, res) => roleController.getRoleById(req, res));

// POST /api/v1/roles - Create new role (admin only)
router.post('/', (req, res) => roleController.createRole(req, res));

// PUT /api/v1/roles/:id - Update role (admin only)
router.put('/:id', (req, res) => roleController.updateRole(req, res));

// DELETE /api/v1/roles/:id - Delete role (admin only)
router.delete('/:id', (req, res) => roleController.deleteRole(req, res));

// PATCH /api/v1/roles/:id/permissions - Update role permissions (admin only)
router.patch('/:id/permissions', (req, res) => roleController.updateRolePermissions(req, res));

export default router;
