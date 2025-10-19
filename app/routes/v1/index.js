import express from 'express';
import authRoutes from './auth.routes.js';
import rolesRoutes from './roles.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);

export default router;