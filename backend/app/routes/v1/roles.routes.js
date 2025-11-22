import express from 'express';
import RoleController from '../../controllers/RoleController.js';
import RoleService from '../../services/RoleService.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();
const roleService = new RoleService();
const roleController = new RoleController(roleService);

router.use(authenticate);

router.get('/', (req, res) => roleController.getAllRoles(req, res));

router.get('/:id', (req, res) => roleController.getRoleById(req, res));

router.post('/', (req, res) => roleController.createRole(req, res));

router.put('/:id', (req, res) => roleController.updateRole(req, res));

router.delete('/:id', (req, res) => roleController.deleteRole(req, res));

router.patch('/:id/permissions', (req, res) => roleController.updateRolePermissions(req, res));

export default router;
