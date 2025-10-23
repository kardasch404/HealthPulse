import express from 'express';
import authRoutes from './auth.routes.js';
import rolesRoutes from './roles.routes.js';
import usersRoutes from './users.routes.js';
import terminsRoutes from './termins.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);
router.use('/users', usersRoutes);
router.use('/termins', terminsRoutes);

export default router;